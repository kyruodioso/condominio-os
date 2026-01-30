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
        .sort({ date: 1, startTime: 1 })
        .lean();

    return reservations.map((r: any) => ({
        ...r,
        _id: r._id.toString(),
        unit: r.unit ? { ...r.unit, _id: r.unit._id.toString() } : null,
    }));
}

interface BookingData {
    date: string;
    startTime: string;
    endTime: string;
    resources: string[];
}

export async function bookSum(data: BookingData) {
    await dbConnect();
    const session = await auth();

    if (!session?.user) {
        return { success: false, error: 'Debes iniciar sesión para hacer una reserva.' };
    }

    // @ts-ignore
    const unitId = session.user.unitId;
    // @ts-ignore
    const condominiumId = session.user.condominiumId;

    if (!unitId || !condominiumId) {
        return { success: false, error: 'No se encontró información de tu unidad.' };
    }

    if (!data.resources || data.resources.length === 0) {
        return { success: false, error: 'Debes seleccionar al menos un recurso (SUM o Parrilla).' };
    }

    if (data.startTime >= data.endTime) {
        return { success: false, error: 'La hora de inicio debe ser anterior a la hora de fin.' };
    }

    // Check availability
    // Find all reservations for this date and condo
    const existingReservations = await Reservation.find({
        condominiumId: condominiumId,
        date: data.date
    });

    for (const res of existingReservations) {
        // Check if resources overlap
        const commonResources = res.resources.filter((r: string) => data.resources.includes(r));

        if (commonResources.length > 0) {
            // Check if time overlaps
            // (StartA < EndB) && (EndA > StartB)
            if (data.startTime < res.endTime && data.endTime > res.startTime) {
                const unit = await Unit.findById(res.unit);
                const unitName = unit ? `Unidad ${unit.number}` : 'otra unidad';
                const resourcesStr = commonResources.join(' y ');
                return {
                    success: false,
                    error: `El recurso ${resourcesStr} ya está reservado por ${unitName} de ${res.startTime} a ${res.endTime}.`
                };
            }
        }
    }

    // Create Reservation
    try {
        await Reservation.create({
            unit: unitId,
            condominiumId: condominiumId,
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            resources: data.resources
        });
        revalidatePath('/sum');
        revalidatePath('/admin/reservas');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: `Error al crear la reserva: ${err.message}` };
    }
}

export async function cancelReservation(id: string) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return { success: false, error: 'Reserva no encontrada' };
        }

        // Check ownership
        // Only the unit owner or an Admin can delete (for now just unit owner as per requirement)
        // @ts-ignore
        const userUnitId = session.user.unitId?.toString();

        if (reservation.unit.toString() !== userUnitId && session.user.role !== 'ADMIN') {
            return { success: false, error: 'No tienes permiso para cancelar esta reserva' };
        }

        // Optional: Block cancellation if it's in the past?
        // Let's rely on frontend for that visual cue, backend just deletes.

        await Reservation.findByIdAndDelete(id);

        revalidatePath('/sum');
        revalidatePath('/admin/reservas');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
