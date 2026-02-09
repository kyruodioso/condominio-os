import { auth } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';
import Unit from '@/models/Unit'; // Asegúrate de que este modelo exista y esté exportado correctamente
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await auth();

        if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN' && session?.user?.role !== 'STAFF' && session?.user?.role !== 'CONSORCIO_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        let channelFilter = 'ADMINISTRACION';

        // Si es STAFF, por defecto ve ENCARGADO, a menos que se especifique lo contrario (si quisiera ver ADMIN, pero eso sería otro permiso)
        if (session.user.role === 'STAFF') {
            channelFilter = 'ENCARGADO';
        }
        
        // Si se pasa un canal por query param y el usuario tiene permisos (Admin puede ver todo?), lo usamos.
        // Por ahora, restrinjamos:
        // Admin -> ve ADMINISTRACION (y podría ver otros si se implementa switch)
        // Staff -> ve ENCARGADO
        // Para simplificar, si es Admin y pide channel=ENCARGADO, lo dejamos.
        if (searchParams.get('channel')) {
             if (session.user.role === 'ADMIN' || session.user.role === 'CONSORCIO_ADMIN' || session.user.role === 'SUPER_ADMIN') {
                channelFilter = searchParams.get('channel')!;
             }
        }

        // Agregación para obtener la última conversación por unidad y canal
        const conversations = await Message.aggregate([
            {
                $match: { channel: channelFilter } // Filtrar por canal
            },
            {
                $sort: { createdAt: -1 } // Ordenar por fecha descendente primero
            },
            {
                $group: {
                    _id: '$unitId', // Agrupar por unidad
                    lastMessage: { $first: '$content' },
                    lastMessageAt: { $first: '$createdAt' },
                    lastSender: { $first: '$sender' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ['$isRead', false] }, { $eq: ['$sender', 'USER'] }] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: { lastMessageAt: -1 } // Ordenar las conversaciones por el mensaje más reciente
            }
        ]);

        // Poblar la información de la unidad (Nombre/Número)
        // Como aggregate devuelve objetos planos, hacemos un populate manual o una segunda consulta
        // Poblar la información de la unidad
        const populatedConversations = await Unit.populate(conversations, {
            path: '_id',
            select: 'number contactName condominiumId',
            model: Unit
        });

        // Obtener usuarios activos recientemente (últimos 2 minutos)
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        const activeUsers = await import('@/models/User').then(mod => mod.default.find({
            lastActive: { $gt: twoMinutesAgo },
            role: { $in: ['OWNER', 'TENANT'] }
        }).select('unitNumber condominiumId'));

        // Crear un mapa de unidades activas para búsqueda rápida
        // Clave: condominiumId_unitNumber
        const activeUnitsMap = new Set(activeUsers.map((u: any) => `${u.condominiumId}_${u.unitNumber}`));

        // Formatear la respuesta para el frontend
        const result = populatedConversations.map((c: any) => {
            const unit = c._id;
            const isOnline = unit ? activeUnitsMap.has(`${unit.condominiumId}_${unit.number}`) : false;

            return {
                unitId: unit?._id,
                unitNumber: unit?.number || 'Sin N°',
                contactName: unit?.contactName || 'Vecino',
                lastMessage: c.lastMessage,
                lastMessageAt: c.lastMessageAt,
                unreadCount: c.unreadCount,
                lastSender: c.lastSender,
                isOnline: isOnline
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
