'use server';

import dbConnect from '@/lib/dbConnect';
import Unit from '@/models/Unit';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { can, PERMISSIONS, PlanType } from '@/lib/permissions';

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

    const planType = (session.user.planType || PlanType.FREE) as PlanType;
    if (!can(session.user, PERMISSIONS.MANAGE_UNITS, planType)) {
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
    const session = await auth();

    if (!session?.user?.condominiumId) {
        throw new Error('Unauthorized');
    }

    const planType = (session.user.planType || PlanType.FREE) as PlanType;
    if (!can(session.user, PERMISSIONS.MANAGE_UNITS, planType)) {
        throw new Error('Unauthorized');
    }

    const unit = await Unit.findById(id);
    if (!unit) return;

    // Authorization Check: Unit must belong to user's condominium
    if (unit.condominiumId !== session.user.condominiumId) {
        throw new Error('Unauthorized access to unit');
    }

    await Unit.findByIdAndDelete(id);
    revalidatePath('/admin/units');
}

export async function getUnitsForSuperAdmin(condominiumId: string) {
    await dbConnect();
    const session = await auth();

    if (session?.user?.role !== 'SUPER_ADMIN') {
        return [];
    }

    const units = await Unit.find({ condominiumId }).sort({ number: 1 }).lean();
    return units.map((u: any) => ({ ...u, _id: u._id.toString() }));
}
