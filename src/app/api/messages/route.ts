import { auth } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        let unitId = searchParams.get('unitId');
        let channel = searchParams.get('channel') || 'ADMINISTRACION';

        // Validar permisos de acceso a mensajes
        const userRole = session.user.role;
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'CONSORCIO_ADMIN';
        const isStaff = userRole === 'STAFF';

        if (isAdmin || isStaff) {
             // Si es Admin o Staff, DEBE proveer unitId para ver mensajes de una unidad específica
             if (!unitId) return NextResponse.json({ error: 'Unit ID required for staff/admin' }, { status: 400 });

             // VERIFICACIÓN: La unidad DEBE pertenecer al condominio del admin/staff.
             const UNIT_MODEL = (await import('@/models/Unit')).default;
             const targetUnit = await UNIT_MODEL.findById(unitId);
             
             if (!targetUnit) {
                 return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
             }

             // Comparar IDs como strings
             if (targetUnit.condominiumId.toString() !== session.user.condominiumId?.toString()) {
                 return NextResponse.json({ error: 'Unauthorized: Unit belongs to another condominium' }, { status: 403 });
             }

        } else {
             // Es Resident (USER)
             // Asumimos que "session.user.unitId" sería lo ideal, pero si no está en sesión, validamos
             // buscando la unidad vinculada al usuario y comparando.
             
             // Si el request trae un unitId, verificamos que sea EL SUYO.
             if (!unitId) return NextResponse.json({ error: 'Unit ID required' }, { status: 400 });

              // Validar contra DB buscando si este user es residente de esa unit
             const UNIT_MODEL = (await import('@/models/Unit')).default;
             const unit = await UNIT_MODEL.findById(unitId);

             // Verificar si el usuario está en la lista de residentes (owners/tenants)
             // Esto asume Unit tiene residents array con userId o similar. 
             // O podemos simplificar usando condominiumId del usuario vs el de la unidad.
             // PERO un usuario solo debería ver SU unidad.
             
             // Por performance/MVP: Si el usuario tiene session.user.condominiumId, validamos que la unidad sea de ese condominio.
             // ESTO ES LO MINIMO: Evita ver chats de OTRO edificio.
             // Para evitar ver chats de OTRA unidad en el mismo edificio, necesitaríamos session.user.unitId confiable.
             
             if (!unit || unit.condominiumId.toString() !== session.user.condominiumId?.toString()) {
                  return NextResponse.json({ error: 'Unauthorized access to this unit' }, { status: 403 });
             }
             
             // TODO: Idealmente validar que session.user.id esté en unit.owners o unit.tenants
        }
        
        // Query base
        const query: any = { unitId };

        // Filtrado por canal
        if (channel) {
            query.channel = channel;
        }

        const messages = await Message.find(query)
            .sort({ createdAt: 1 }) // Orden cronológico
            .limit(100); // Limitar a últimos 100 por performance

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { content, unitId, type = 'text', fileUrl, channel = 'ADMINISTRACION' } = body;

        if ((!content && !fileUrl) || !unitId) {
            return NextResponse.json({ error: 'Missing content/file or unitId' }, { status: 400 });
        }

        // --- VERIFICACIÓN DE SEGURIDAD PARA POST ---
        const UNIT_MODEL = (await import('@/models/Unit')).default;
        const targetUnit = await UNIT_MODEL.findById(unitId);

        if (!targetUnit) {
            return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
        }

        // Verificar aislamiento de Condominio
        if (targetUnit.condominiumId.toString() !== session.user.condominiumId?.toString()) {
             // Caso especial: Super Admin podría mandar a cualquiera, pero por regla de negocio general lo bloqueamos
             // a menos que Super Admin cambie su 'contexto'.
             // Si es SUPER_ADMIN, podríamos ser permisivos, pero por defecto mejor seguros.
             if (session.user.role !== 'SUPER_ADMIN') {
                 return NextResponse.json({ error: 'Unauthorized: Cannot message unit in another condominium' }, { status: 403 });
             }
        }
        // -------------------------------------------

        let senderRole = 'USER';
        // Check if the user is STAFF, ADMIN, etc.
        if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN' || session.user.role === 'CONSORCIO_ADMIN') {
            senderRole = 'ADMIN'; 
        } else if (session.user.role === 'STAFF') {
             senderRole = 'STAFF'; // New sender role for Encargado
        }

        // If Encargado sends a message, it should be in ENCARGADO channel ideally, or whatever channel is passed (but restricted?)
        // For now, trust the frontend 'channel' param if it's valid.

        const newMessage = await Message.create({
            sender: senderRole,
            unitId,
            content,
            type,
            fileUrl,
            channel,
            isRead: false,
        });

        // --- Lógica de Respuesta Automática ---
        if (senderRole === 'USER') {
            try {
                // Importar dinámicamente para evitar ciclos si fuera el caso, aunque aquí no aplica
                const Settings = (await import('@/models/Settings')).default;
                const settings = await Settings.findOne();

                if (settings && settings.isAutoReplyEnabled) {
                    const now = new Date();
                    const currentDay = now.getDay(); // 0-6

                    // Ajuste de hora: Asegurarnos de usar la hora local del servidor o una zona específica
                    // Aquí usamos la hora del objeto Date que es UTC en muchos entornos serverless, 
                    // pero en un VPS local (Raspberry) suele ser la hora del sistema.
                    // Para ser robustos, parseamos las horas de settings (HH:mm)

                    const currentTime = now.getHours() * 60 + now.getMinutes();

                    const [startH, startM] = settings.adminWorkHours.start.split(':').map(Number);
                    const startTime = startH * 60 + startM;

                    const [endH, endM] = settings.adminWorkHours.end.split(':').map(Number);
                    const endTime = endH * 60 + endM;

                    const isWorkDay = settings.adminWorkHours.days.includes(currentDay);
                    const isWorkHour = currentTime >= startTime && currentTime < endTime;

                    if (!isWorkDay || !isWorkHour) {
                        // Estamos FUERA de horario -> Enviar Auto-Reply
                        await Message.create({
                            sender: 'ADMIN',
                            unitId,
                            content: settings.autoReplyMessage,
                            isRead: false, // El usuario no lo ha leído aún
                            // Podríamos agregar un flag metadata si quisiéramos identificarlo como auto
                        });
                    }
                }
            } catch (autoReplyError) {
                console.error('Error sending auto-reply:', autoReplyError);
                // No fallamos la request principal si falla el auto-reply
            }
        }
        // --------------------------------------

        return NextResponse.json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    // Endpoint para marcar como leídos
    try {
        await dbConnect();
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { unitId } = body;

        if (!unitId) return NextResponse.json({ error: 'Unit ID required' }, { status: 400 });

        // Si soy admin, marco como leídos los mensajes del USER en esa unidad
        // Si soy user, marco como leídos los mensajes del ADMIN en mi unidad

        let targetSender = 'ADMIN'; // Si soy user, leo los de admin
        if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN' || session.user.role === 'STAFF' || session.user.role === 'CONSORCIO_ADMIN') {
            targetSender = 'USER'; // Si soy admin, leo los de user
        }

        await Message.updateMany(
            { unitId, sender: targetSender, isRead: false },
            { $set: { isRead: true } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
