'use server';

import dbConnect from '@/lib/dbConnect';
import Reservation from '@/models/Reservation';
import Unit from '@/models/Unit';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function getReservations(startDate?: string, endDate?: string) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        return [];
    }

    const query: any = { condominiumId: session.user.condominiumId };
    if (startDate && endDate) {
        query.date = { $gte: startDate, $lte: endDate };
    }

    const reservations = await Reservation.find(query)
        .populate('unit', 'number contactName')
        .sort({ date: 1, timeSlot: 1 })
        .lean();

    return reservations.map((r: any) => ({
        ...r,
        _id: r._id.toString(),
        unit: r.unit ? { ...r.unit, _id: r.unit._id.toString() } : null,
    }));
}

export async function bookSum(data: { date: string; timeSlot: string }) {
    await dbConnect();
    const session = await auth();

    if (!session?.user) {
        return { success: false, error: 'Debes iniciar sesión para hacer una reserva. Por favor inicia sesión e intenta nuevamente.' };
    }

    // @ts-ignore
    const unitId = session.user.unitId;
    // @ts-ignore
    const condominiumId = session.user.condominiumId;

    if (!unitId || !condominiumId) {
        return { success: false, error: 'No se encontró información de tu unidad. Contacta al administrador para verificar tu perfil.' };
    }

    // 1. Validate Unit (Optional check, mainly to get the object if needed, but we have IDs)
    // We trust the session here.

    // 2. Check availability
    const existing = await Reservation.findOne({ 
        condominiumId: condominiumId,
        date: data.date, 
        timeSlot: data.timeSlot 
    });
    
    if (existing) {
        // Get unit name for better error message
        const unit = await Unit.findById(existing.unit);
        const unitName = unit ? `Unidad ${unit.number}` : 'otra unidad';
        return { 
            success: false, 
            error: `El horario ${data.timeSlot} del ${new Date(data.date).toLocaleDateString('es-AR')} ya está reservado por ${unitName}. Por favor selecciona otro horario disponible.` 
        };
    }

    // 3. Create Reservation
    try {
        await Reservation.create({
            unit: unitId,
            condominiumId: condominiumId,
            date: data.date,
            timeSlot: data.timeSlot
        });
        revalidatePath('/sum');
        revalidatePath('/admin/reservas');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: `Error al crear la reserva: ${err.message}. Por favor intenta nuevamente o contacta al administrador.` };
    }
}
