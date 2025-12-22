'use server';

import dbConnect from '@/lib/dbConnect';
import Unit from '@/models/Unit';
import { revalidatePath } from 'next/cache';

export async function getUnits() {
    await dbConnect();
    const units = await Unit.find({}).sort({ number: 1 }).lean();
    return units.map((u: any) => ({ ...u, _id: u._id.toString() }));
}

export async function createUnit(data: { number: string; accessPin: string; contactName?: string }) {
    await dbConnect();
    try {
        await Unit.create(data);
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
