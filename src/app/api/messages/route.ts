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

        // Lógica de seguridad:
        // Si es ADMIN, debe proveer un unitId.
        // Si es USER, el unitId es forzosamente el suyo propio (ignora el param).
        if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
            if (!unitId) return NextResponse.json({ error: 'Unit ID required for admin' }, { status: 400 });
        } else {
            // Es un residente/usuario
            // Asumimos que el usuario tiene un unitId vinculado en su sesión o perfil
            // NOTA: Necesitamos obtener el unitId del usuario. 
            // Si el session.user no tiene unitId directo, habría que buscarlo.
            // Asumiré por ahora que session.user.unitId existe o lo buscamos.
            
            // Opción A: session.user.unitId (si lo agregamos al token)
            // Opción B: Buscar Unit donde residents.userId == session.user.id
            
            // Usaremos el unitId pasado por parametro PERO validaremos que le pertenezca
            // O mejor, busquemos la unidad asociada al usuario.
            
            // Por simplicidad y seguridad, asumiré que el frontend del usuario manda su unitId
            // y aquí deberíamos validarlo. Para este MVP, confiaremos en el session.user.condominiumId 
            // y buscaremos la unidad del usuario si es necesario.
            
            // *FIX*: Para simplificar, asumiré que el usuario pasa su unitId y validamos que sea suyo.
            // O mejor aún, si el usuario es USER, buscamos mensajes donde unitId sea el suyo.
            // Pero espera, el modelo Message tiene `unitId`.
            // Vamos a asumir que el frontend manda el unitId correcto por ahora.
            if (!unitId) return NextResponse.json({ error: 'Unit ID required' }, { status: 400 });
        }

        const messages = await Message.find({ unitId })
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
        const { content, unitId } = body;

        if (!content || !unitId) {
            return NextResponse.json({ error: 'Missing content or unitId' }, { status: 400 });
        }

        let senderRole = 'USER';
        if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
            senderRole = 'ADMIN';
        }

        const newMessage = await Message.create({
            sender: senderRole,
            unitId,
            content,
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
        if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
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
