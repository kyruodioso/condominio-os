import { auth } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await auth();
        if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Buscar configuración existente o devolver valores por defecto
        // Asumimos que buscamos la configuración global o la del condominio del admin
        // Para simplificar, buscamos el primer documento o creamos uno default en memoria
        let settings = await Settings.findOne();

        if (!settings) {
            // Retornar defaults si no existe en DB aún
            return NextResponse.json({
                adminWorkHours: { start: "09:00", end: "18:00", days: [1, 2, 3, 4, 5] },
                autoReplyMessage: "Gracias por tu mensaje. En este momento no estoy disponible. Te responderé a la brevedad dentro de mi horario laboral.",
                isAutoReplyEnabled: true
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await auth();
        if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        
        // Upsert: Actualizar si existe, crear si no
        // Usamos findOneAndUpdate con upsert: true
        const settings = await Settings.findOneAndUpdate(
            {}, // Filtro vacío para encontrar el único documento (o podrías filtrar por condominioId)
            { 
                $set: {
                    adminWorkHours: body.adminWorkHours,
                    autoReplyMessage: body.autoReplyMessage,
                    isAutoReplyEnabled: body.isAutoReplyEnabled,
                    updatedAt: new Date()
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error saving settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
