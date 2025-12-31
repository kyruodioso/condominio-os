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
        const unitId = searchParams.get('unitId');

        const targetSender = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN' ? 'USER' : 'ADMIN';

        let query: any = {
            sender: targetSender,
            isRead: false
        };

        if (unitId) {
            query.unitId = unitId;
        } else if (targetSender === 'ADMIN') {
            // Si soy usuario (espero mensajes de ADMIN) y no paso unitId, 
            // idealmente debería sacarlo de mi sesión, pero por ahora retornamos 0 si no se provee
            // O mejor, si el front no lo manda, intentamos sacarlo de la sesión si quisiéramos ser robustos.
            // Pero mantengamos la lógica actual: si no unitId y soy user -> 0.
            return NextResponse.json({ count: 0 });
        }
        // Si soy ADMIN y no hay unitId, la query queda abierta a todos los unitId (global count)

        const count = await Message.countDocuments(query);

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error counting unread:', error);
        return NextResponse.json({ count: 0 });
    }
}
