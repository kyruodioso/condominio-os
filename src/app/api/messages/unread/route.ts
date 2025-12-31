import { auth } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const unitId = searchParams.get('unitId');

        if (!unitId) return NextResponse.json({ count: 0 });

        // Contar mensajes no leídos donde el remitente es ADMIN (si soy USER)
        // O donde el remitente es USER (si soy ADMIN, aunque este widget es para users)
        
        const targetSender = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN' ? 'USER' : 'ADMIN';

        const count = await Message.countDocuments({
            unitId,
            sender: targetSender,
            isRead: false
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error counting unread:', error);
        return NextResponse.json({ count: 0 });
    }
}
