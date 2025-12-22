'use server';

import dbConnect from '@/lib/dbConnect';
import Report from '@/models/Report';
import Unit from '@/models/Unit';
import MaintenanceTask from '@/models/MaintenanceTask';
import { revalidatePath } from 'next/cache';

export async function createReport(data: {
    title: string;
    description: string;
    unitNumber: string;
    pin: string;
    priority: string;
}) {
    await dbConnect();

    try {
        // Verify Unit and PIN
        const unit = await Unit.findOne({
            number: data.unitNumber.toUpperCase(),
            accessPin: data.pin
        });

        if (!unit) {
            return { success: false, error: 'Unidad o PIN incorrectos' };
        }

        await Report.create({
            title: data.title,
            description: data.description,
            unitNumber: data.unitNumber,
            priority: data.priority,
        });

        revalidatePath('/admin/reportes');
        return { success: true };
    } catch (error: any) {
        console.error('Error creating report:', error);
        return { success: false, error: 'Error al crear el reporte' };
    }
}

export async function getReports() {
    await dbConnect();
    const reports = await Report.find({}).sort({ createdAt: -1 }).lean();
    return reports.map((r: any) => ({
        ...r,
        _id: r._id.toString(),
        createdAt: r.createdAt.toISOString()
    }));
}

export async function updateReportStatus(id: string, status: string) {
    await dbConnect();
    try {
        const report = await Report.findById(id);
        if (!report) return { success: false, error: 'Report not found' };

        // Logic to sync with Maintenance Tasks
        if (status === 'in_progress' && !report.maintenanceTaskId) {
            // Map priority
            const priorityMap: Record<string, string> = {
                'low': 'Baja',
                'medium': 'Media',
                'high': 'Alta'
            };

            const newTask = await MaintenanceTask.create({
                title: `Reporte ${report.unitNumber}: ${report.title}`,
                description: report.description,
                priority: priorityMap[report.priority] || 'Media',
                status: 'En Progreso',
                scheduledDate: new Date(), // Set for today
            });

            report.maintenanceTaskId = newTask._id;
        } else if (status === 'resolved' && report.maintenanceTaskId) {
            await MaintenanceTask.findByIdAndUpdate(report.maintenanceTaskId, {
                status: 'Finalizada',
                completedAt: new Date()
            });
        }

        report.status = status;
        await report.save();

        revalidatePath('/admin/reportes');
        revalidatePath('/admin/tareas'); // Revalidate tasks as well
        revalidatePath('/mantenimiento');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
