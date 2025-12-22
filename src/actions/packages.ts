'use server';

import dbConnect from '@/lib/dbConnect';
import Package from '@/models/Package';

import Unit from '@/models/Unit';

export async function getPackagesByUnit(unitNum: string, pin: string) {
    await dbConnect();

    // 1. Verify Unit & PIN
    const unit = await Unit.findOne({ number: unitNum.toUpperCase().trim() });

    if (!unit) {
        return { error: 'Unidad no encontrada' };
    }

    if (unit.accessPin !== pin) {
        return { error: 'PIN incorrecto' };
    }

    // 2. Fetch Packages
    const packages = await Package.find({
        unit: unitNum.toUpperCase().trim(),
        isPickedUp: false
    })
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

    const newPackage = await Package.create({
        unit: data.unit,
        recipientName: data.recipientName
    });

    return JSON.parse(JSON.stringify(newPackage));
}

export async function markAsPickedUp(id: string) {
    await dbConnect();
    await Package.findByIdAndUpdate(id, { isPickedUp: true });
}
