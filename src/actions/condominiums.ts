'use server';

import dbConnect from '@/lib/dbConnect';
import Condominium from '@/models/Condominium';
import { auth } from '@/auth';

export async function getCondominiums() {
    await dbConnect();
    const session = await auth();

    if (session?.user?.role !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized');
    }

    const condominiums = await Condominium.find({}).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(condominiums));
}

export async function createCondominium(data: { name: string; address: string; plan: string }) {
    await dbConnect();
    const session = await auth();

    if (session?.user?.role !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized');
    }

    const newCondo = new Condominium(data);
    await newCondo.save();
    return JSON.parse(JSON.stringify(newCondo));
}

export async function getSuperAdminStats() {
    await dbConnect();
    const session = await auth();

    if (session?.user?.role !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized');
    }

    const totalCondos = await Condominium.countDocuments();
    const totalUsers = await import('@/models/User').then(mod => mod.default.countDocuments());

    return {
        totalCondos,
        totalUsers
    };
}

export async function getCondominiumName(id: string) {
    await dbConnect();
    const condo = await Condominium.findById(id).select('name');
    return condo ? condo.name : 'Condominio OS';
}
