'use server';

import dbConnect from '@/lib/dbConnect';
import Condominium from '@/models/Condominium';
import { auth } from '@/auth';

export async function getCondominiums() {
    try {
        await dbConnect();
        const session = await auth();

        if (session?.user?.role !== 'SUPER_ADMIN') {
            return [];
        }

        const condominiums = await Condominium.find({}).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(condominiums));
    } catch (error) {
        console.error('Error fetching condominiums:', error);
        return [];
    }
}

export async function createCondominium(data: { name: string; address: string; plan: string }) {
    console.log('--- Starting createCondominium ---');
    console.log('Data received:', data);

    try {
        await dbConnect();
        const session = await auth();
        console.log('Session checked:', session?.user?.email);

        if (session?.user?.role !== 'SUPER_ADMIN') {
            console.log('Unauthorized access attempt');
            return { success: false, error: 'Unauthorized' };
        }

        const newCondo = new Condominium(data);
        await newCondo.save();
        console.log('Condominium saved successfully:', newCondo._id);
        
        // Try to revalidate, but don't crash if it fails
        /*
        try {
            const { revalidatePath } = await import('next/cache');
            revalidatePath('/admin/super');
            console.log('Revalidation successful');
        } catch (revalError) {
            console.error('Revalidation failed (non-critical):', revalError);
        }
        */
        console.log('Skipping revalidation to prevent 500 error');

        return { success: true };
    } catch (error: any) {
        console.error('CRITICAL Error creating condominium:', error);
        return { success: false, error: error.message || 'Error creating condominium' };
    }
}

export async function getSuperAdminStats() {
    try {
        await dbConnect();
        const session = await auth();

        if (session?.user?.role !== 'SUPER_ADMIN') {
            return { totalCondos: 0, totalUsers: 0 };
        }

        const totalCondos = await Condominium.countDocuments();
        // Fix dynamic import if it was causing issues, or just keep it if it works. 
        // Better to import at top level if possible, but circular deps might be an issue.
        // Let's keep the dynamic import but handle errors.
        const User = (await import('@/models/User')).default;
        const totalUsers = await User.countDocuments();

        return {
            totalCondos,
            totalUsers
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { totalCondos: 0, totalUsers: 0 };
    }
}

export async function getCondominiumName(id: string) {
    await dbConnect();
    const condo = await Condominium.findById(id).select('name');
    return condo ? condo.name : 'Condominio OS';
}
