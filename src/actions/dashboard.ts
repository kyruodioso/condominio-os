'use server';

import dbConnect from '@/lib/dbConnect';
import Package from '@/models/Package';
import Report from '@/models/Report';
import MaintenanceTask from '@/models/MaintenanceTask';
import User from '@/models/User';
import { auth } from '@/auth';

export async function getDashboardStats() {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        return {
            packagesToday: 0,
            pendingReports: 0,
            activeTasks: 0,
            totalResidents: 0
        };
    }

    const condoId = session.user.condominiumId;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    try {
        const [packagesToday, pendingReports, activeTasks, totalResidents] = await Promise.all([
            Package.countDocuments({ 
                condominiumId: condoId, 
                createdAt: { $gte: startOfDay } 
            }),
            Report.countDocuments({ 
                condominiumId: condoId, 
                status: { $in: ['pending', 'in_progress'] } 
            }),
            MaintenanceTask.countDocuments({ 
                condominiumId: condoId, 
                status: { $in: ['Pendiente', 'En Progreso'] } 
            }),
            User.countDocuments({ 
                condominiumId: condoId, 
                role: { $in: ['OWNER', 'TENANT'] } 
            })
        ]);

        return {
            packagesToday,
            pendingReports,
            activeTasks,
            totalResidents
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            packagesToday: 0,
            pendingReports: 0,
            activeTasks: 0,
            totalResidents: 0
        };
    }
}
