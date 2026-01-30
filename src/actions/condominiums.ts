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

export async function createCondominium(data: { name: string; address: string; plan: string; maxUnits?: number }) {
    try {
        await dbConnect();
        const session = await auth();

        if (session?.user?.role !== 'SUPER_ADMIN') {
            return { success: false, error: 'Unauthorized' };
        }

        const newCondo = new Condominium(data);
        await newCondo.save();

        // Try to revalidate, but don't crash if it fails
        try {
            const { revalidatePath } = await import('next/cache');
            revalidatePath('/admin/super');
        } catch (revalError) {
            console.error('Revalidation failed (non-critical):', revalError);
        }

        return { success: true, data: JSON.parse(JSON.stringify(newCondo)) };
    } catch (error: any) {
        console.error('Error creating condominium:', error);
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

export async function deleteCondominium(id: string) {
    try {
        await dbConnect();
        const session = await auth();

        if (session?.user?.role !== 'SUPER_ADMIN') {
            return { success: false, error: 'Unauthorized' };
        }

        // Import all models dynamically to ensure they are registered
        const User = (await import('@/models/User')).default;
        const Unit = (await import('@/models/Unit')).default;
        const Reservation = (await import('@/models/Reservation')).default;
        const MaintenanceTask = (await import('@/models/MaintenanceTask')).default;
        const Announcement = (await import('@/models/Announcement')).default;
        const Message = (await import('@/models/Message')).default;
        const Package = (await import('@/models/Package')).default;
        const Provider = (await import('@/models/Provider')).default;
        const Report = (await import('@/models/Report')).default;
        const SupplierOrder = (await import('@/models/SupplierOrder')).default;
        const Settings = (await import('@/models/Settings')).default;

        // Delete all associated data
        await Promise.all([
            User.deleteMany({ condominiumId: id }),
            Unit.deleteMany({ condominiumId: id }),
            Reservation.deleteMany({ condominiumId: id }),
            MaintenanceTask.deleteMany({ condominiumId: id }),
            Announcement.deleteMany({ condominiumId: id }),
            Message.deleteMany({ condominiumId: id }),
            Package.deleteMany({ condominiumId: id }),
            Provider.deleteMany({ condominiumId: id }),
            Report.deleteMany({ condominiumId: id }),
            SupplierOrder.deleteMany({ condominiumId: id }),
            Settings.deleteMany({ condominiumId: id }),
        ]);

        // Delete the condominium itself
        await Condominium.findByIdAndDelete(id);

        try {
            const { revalidatePath } = await import('next/cache');
            revalidatePath('/admin/super');
        } catch (revalError) {
            console.error('Revalidation failed:', revalError);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting condominium:', error);
        return { success: false, error: error.message || 'Error deleting condominium' };
    }
}
