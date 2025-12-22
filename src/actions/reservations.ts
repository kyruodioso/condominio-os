'use server';

import dbConnect from '@/lib/dbConnect';
import Reservation from '@/models/Reservation';
import Unit from '@/models/Unit';
import { revalidatePath } from 'next/cache';

export async function getReservations(startDate?: string, endDate?: string) {
    await dbConnect();

    const query: any = {};
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

export async function bookSum(data: { unitId: string; pin: string; date: string; timeSlot: string }) {
    await dbConnect();

    // 1. Validate Unit and PIN
    const unit = await Unit.findById(data.unitId);
    if (!unit) {
        return { success: false, error: 'Unidad no encontrada' };
    }

    if (unit.accessPin !== data.pin) {
        return { success: false, error: 'PIN incorrecto' };
    }

    // 2. Check availability
    const existing = await Reservation.findOne({ date: data.date, timeSlot: data.timeSlot });
    if (existing) {
        return { success: false, error: 'Turno ya reservado' };
    }

    // 3. Create Reservation
    try {
        await Reservation.create({
            unit: unit._id,
            date: data.date,
            timeSlot: data.timeSlot
        });
        revalidatePath('/sum');
        revalidatePath('/admin/reservas');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'Error al reservar' };
    }
}
