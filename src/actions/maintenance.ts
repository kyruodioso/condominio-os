'use server';

import dbConnect from '@/lib/dbConnect';
import MaintenanceTask from '@/models/MaintenanceTask';
import { revalidatePath } from 'next/cache';

export async function createTask(formData: FormData) {
    await dbConnect();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;
    const scheduledDateStr = formData.get('scheduledDate') as string;

    console.log('Creating task:', { title, priority, scheduledDateStr });

    try {
        const newTask = await MaintenanceTask.create({
            title,
            description,
            priority,
            scheduledDate: scheduledDateStr ? new Date(scheduledDateStr) : undefined,
        });
        console.log('Task created successfully:', newTask._id);
        revalidatePath('/admin/tareas');
        revalidatePath('/mantenimiento');
        return { success: true };
    } catch (error) {
        console.error('Error creating task:', error);
        return { success: false, error: 'Failed to create task' };
    }
}

export async function updateTaskStatus(id: string, newStatus: string) {
    await dbConnect();

    try {
        const updateData: any = { status: newStatus };
        if (newStatus === 'Finalizada') {
            updateData.completedAt = new Date();
        } else {
            updateData.completedAt = null;
        }

        await MaintenanceTask.findByIdAndUpdate(id, updateData);
        revalidatePath('/admin/tareas');
        revalidatePath('/mantenimiento');
        return { success: true };
    } catch (error) {
        console.error('Error updating task status:', error);
        return { success: false, error: 'Failed to update task status' };
    }
}

export async function deleteTask(id: string) {
    await dbConnect();

    try {
        await MaintenanceTask.findByIdAndDelete(id);
        revalidatePath('/admin/tareas');
        revalidatePath('/mantenimiento');
        return { success: true };
    } catch (error) {
        console.error('Error deleting task:', error);
        return { success: false, error: 'Failed to delete task' };
    }
}

export async function getDailyTasks() {
    await dbConnect();

    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        console.log('Fetching daily tasks...');
        const tasks = await MaintenanceTask.find({
            $or: [
                { status: { $in: ['Pendiente', 'En Progreso'] } },
                { status: 'Finalizada', completedAt: { $gte: startOfDay } }
            ]
        }).sort({ priority: -1, createdAt: -1 }).lean();

        console.log(`Found ${tasks.length} tasks.`);

        const serialize = (task: any) => ({
            ...task,
            _id: task._id.toString(),
            createdAt: task.createdAt?.toISOString(),
            completedAt: task.completedAt?.toISOString(),
            scheduledDate: task.scheduledDate?.toISOString(),
        });

        const serializedTasks = tasks.map(serialize);

        return {
            todo: serializedTasks.filter((t: any) => t.status === 'Pendiente'),
            inProgress: serializedTasks.filter((t: any) => t.status === 'En Progreso'),
            done: serializedTasks.filter((t: any) => t.status === 'Finalizada'),
        };
    } catch (error) {
        console.error('Error fetching daily tasks:', error);
        return { todo: [], inProgress: [], done: [] };
    }
}

export async function getWeeklyTasks(startDate: Date, endDate: Date) {
    await dbConnect();
    try {
        const tasks = await MaintenanceTask.find({
            scheduledDate: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ scheduledDate: 1 }).lean();

        return tasks.map((task: any) => ({
            ...task,
            _id: task._id.toString(),
            createdAt: task.createdAt?.toISOString(),
            completedAt: task.completedAt?.toISOString(),
            scheduledDate: task.scheduledDate?.toISOString(),
        }));
    } catch (error) {
        console.error('Error fetching weekly tasks:', error);
        return [];
    }
}

export async function getAllTasks() {
    await dbConnect();
    try {
        const tasks = await MaintenanceTask.find({}).sort({ createdAt: -1 }).lean();
        return tasks.map((task: any) => ({
            ...task,
            _id: task._id.toString(),
            createdAt: task.createdAt?.toISOString(),
            completedAt: task.completedAt?.toISOString(),
            scheduledDate: task.scheduledDate?.toISOString(),
        }));
    } catch (error) {
        console.error('Error fetching all tasks:', error);
        return [];
    }
}

export async function getPublicTasks() {
    return getDailyTasks();
}

export async function getMonthlyTasks(year: number, month: number) {
    await dbConnect();
    try {
        // Month is 0-indexed in JS Date, but let's assume input is 0-indexed too for consistency
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        const tasks = await MaintenanceTask.find({
            scheduledDate: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ scheduledDate: 1 }).lean();

        return tasks.map((task: any) => ({
            ...task,
            _id: task._id.toString(),
            createdAt: task.createdAt?.toISOString(),
            completedAt: task.completedAt?.toISOString(),
            scheduledDate: task.scheduledDate?.toISOString(),
        }));
    } catch (error) {
        console.error('Error fetching monthly tasks:', error);
        return [];
    }
}
