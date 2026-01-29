'use server';

import dbConnect from '@/lib/dbConnect';
import Package from '@/models/Package';
import { auth } from '@/auth';

import Unit from '@/models/Unit';

export async function getPackagesByUnit() {
    await dbConnect();
    const session = await auth();

    if (!session?.user) {
        return { error: 'No autorizado' };
    }

    // @ts-ignore
    const unitNumber = session.user.unitNumber;
    // @ts-ignore
    const condominiumId = session.user.condominiumId;

    if (!unitNumber) {
        return { error: 'No se encontró información de tu unidad' };
    }

    // 2. Fetch Packages
    const query: any = {
        unit: unitNumber.toUpperCase().trim(),
        isPickedUp: false
    };

    if (condominiumId) {
        query.condominiumId = condominiumId;
    }

    const packages = await Package.find(query)
        .sort({ entryDate: -1 })
        .lean();

    return {
        success: true,
        data: packages.map((p: any) => ({
            ...p,
            _id: p._id.toString(),
            entryDate: p.entryDate.toISOString(),
        }))
    };
}

export async function addPackage(data: { unit: string; recipientName: string }) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        throw new Error('Unauthorized');
    }

    const newPackage = await Package.create({
        unit: data.unit,
        recipientName: data.recipientName,
        condominiumId: session.user.condominiumId
    });

    return JSON.parse(JSON.stringify(newPackage));
}

import { revalidatePath } from 'next/cache';

export async function markAsPickedUp(id: string) {
    await dbConnect();
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    await Package.findByIdAndUpdate(id, { isPickedUp: true });
    revalidatePath('/buzon');
    revalidatePath('/admin');
}
