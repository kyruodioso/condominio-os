'use server';

import dbConnect from '@/lib/dbConnect';
import Report from '@/models/Report';
import User from '@/models/User';
import Unit from '@/models/Unit';
import MaintenanceTask from '@/models/MaintenanceTask';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createReport(data: {
    title: string;
    description: string;
    priority: string;
}) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.email) {
        return { success: false, error: 'No autenticado' };
    }

    try {
        // Get user
        const user = await User.findOne({ email: session.user.email });
        
        if (!user) {
            return { success: false, error: 'Usuario no encontrado' };
        }

        if (!user.unitNumber) {
            return { success: false, error: 'Usuario no tiene una unidad asignada. Por favor contacta al administrador.' };
        }

        const normalizedUnitNumber = user.unitNumber.trim();
        
        // Find the unit by number (case-insensitive)
        const unit = await Unit.findOne({ 
            number: { $regex: new RegExp(`^${normalizedUnitNumber}$`, 'i') },
            condominiumId: user.condominiumId
        });

        if (!unit) {
            return { 
                success: false, 
                error: `La unidad '${normalizedUnitNumber}' no existe en el sistema. Por favor contacta al administrador para que la registre.` 
            };
        }

        await Report.create({
            title: data.title,
            description: data.description,
            unitNumber: unit.number,
            unitId: unit._id,
            condominiumId: user.condominiumId,
            priority: data.priority,
            createdBy: user._id,
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
    const session = await auth();

    if (!session?.user?.condominiumId) {
        return [];
    }

    const reports = await Report.find({ 
        condominiumId: session.user.condominiumId 
    })
    .populate({ path: 'unitId', select: 'number', strictPopulate: false })
    .populate({ path: 'createdBy', select: 'email', strictPopulate: false })
    .sort({ createdAt: -1 })
    .lean();

    return reports.map((r: any) => ({
        ...r,
        _id: r._id.toString(),
        unitId: r.unitId ? { ...r.unitId, _id: r.unitId._id.toString() } : null,
        createdBy: r.createdBy ? { ...r.createdBy, _id: r.createdBy._id.toString() } : null,
        createdAt: r.createdAt.toISOString()
    }));
}

export async function updateReportStatus(id: string, status: string) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        return { success: false, error: 'No autorizado' };
    }

    try {
        const report = await Report.findOne({
            _id: id,
            condominiumId: session.user.condominiumId
        }).populate({ path: 'unitId', select: 'number', strictPopulate: false });

        if (!report) return { success: false, error: 'Report not found' };

        // Logic to sync with Maintenance Tasks
        if (status === 'in_progress' && !report.maintenanceTaskId) {
            // Map priority
            const priorityMap: Record<string, string> = {
                'low': 'Baja',
                'medium': 'Media',
                'high': 'Alta'
            };

            const unitNumber = report.unitId?.number || 'N/A';

            const newTask = await MaintenanceTask.create({
                title: `Reporte ${unitNumber}: ${report.title}`,
                description: report.description,
                priority: priorityMap[report.priority] || 'Media',
                status: 'En Progreso',
                condominiumId: session.user.condominiumId,
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
