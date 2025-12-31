import { auth } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';
import Unit from '@/models/Unit'; // Asegúrate de que este modelo exista y esté exportado correctamente
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await auth();
        
        if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Agregación para obtener la última conversación por unidad
        const conversations = await Message.aggregate([
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
        const populatedConversations = await Unit.populate(conversations, {
            path: '_id',
            select: 'number contactName', // Ajusta estos campos según tu modelo Unit
            model: Unit
        });

        // Formatear la respuesta para el frontend
        const result = populatedConversations.map((c: any) => ({
            unitId: c._id._id,
            unitNumber: c._id.number || 'Sin N°',
            contactName: c._id.contactName || 'Vecino',
            lastMessage: c.lastMessage,
            lastMessageAt: c.lastMessageAt,
            unreadCount: c.unreadCount,
            lastSender: c.lastSender
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
