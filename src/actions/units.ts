'use server';

import dbConnect from '@/lib/dbConnect';
import Unit from '@/models/Unit';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function getUnits() {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        return [];
    }

    const units = await Unit.find({ condominiumId: session.user.condominiumId.toString() }).sort({ number: 1 }).lean();
    return units.map((u: any) => ({ ...u, _id: u._id.toString() }));
}

export async function createUnit(data: { number: string; accessPin: string; contactName?: string }) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const Condominium = (await import('@/models/Condominium')).default;
        const condo = await Condominium.findById(session.user.condominiumId);

        if (condo) {
            const currentUnits = await Unit.countDocuments({ condominiumId: session.user.condominiumId });
            // Default to 50 if maxUnits not set
            const maxUnits = condo.maxUnits || 50;

            if (currentUnits >= maxUnits) {
                return { success: false, error: `Se ha alcanzado el límite de ${maxUnits} unidades para este condominio. Contacta a soporte para aumentar tu plan.` };
            }
        }

        await Unit.create({ ...data, condominiumId: session.user.condominiumId.toString() });
        revalidatePath('/admin/units');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteUnit(id: string) {
    await dbConnect();
    await Unit.findByIdAndDelete(id);
    revalidatePath('/admin/units');
}
