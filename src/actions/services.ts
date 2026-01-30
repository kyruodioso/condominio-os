'use server';

import dbConnect from '@/lib/dbConnect';
import ServiceEvent from '@/models/ServiceEvent';
import ServiceRequest from '@/models/ServiceRequest';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

// --- SERVICE EVENTS (Admin) ---

export async function createServiceEvent(data: {
    title: string;
    description: string;
    date: Date;
    deadline: Date;
    price?: number;
    providerName?: string;
    requiresQuantity?: boolean;
}) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.id || session.user.role === 'TENANT') {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const event = await ServiceEvent.create({
            ...data,
            condominiumId: session.user.condominiumId,
        });

        revalidatePath('/admin/services');
        revalidatePath('/services');
        return { success: true, data: JSON.parse(JSON.stringify(event)) };
    } catch (error: any) {
        console.error('Error creating service event:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteServiceEvent(id: string) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.id || session.user.role === 'TENANT') {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        // Delete all associated requests first
        await ServiceRequest.deleteMany({ serviceEventId: id });
        await ServiceEvent.findByIdAndDelete(id);

        revalidatePath('/admin/services');
        revalidatePath('/services');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAdminServices() {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) return [];

    const services = await ServiceEvent.find({
        condominiumId: session.user.condominiumId
    }).sort({ date: 1 }).lean();

    return JSON.parse(JSON.stringify(services));
}

export async function getServiceRequests(serviceId: string) {
    await dbConnect();
    const session = await auth();

    // Import related models to populate
    const Unit = (await import('@/models/Unit')).default;
    const User = (await import('@/models/User')).default;

    if (!session?.user?.id) return [];

    const requests = await ServiceRequest.find({ serviceEventId: serviceId })
        .populate({ path: 'unitId', model: Unit, select: 'number contactName' })
        .populate({ path: 'userId', model: User, select: 'profile email' })
        .lean();

    return JSON.parse(JSON.stringify(requests));
}

// --- USER ACTIONS ---

export async function getUpcomingServices() {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) return { services: [], userRequests: [] };

    const now = new Date();
    // Fetch 'Open' events that haven't passed their deadline yet (or date), 
    // depending on business rule. Usually deadline.
    // Showing all open events for now, sorted by date.

    const services = await ServiceEvent.find({
        condominiumId: session.user.condominiumId,
        status: 'Open',
        date: { $gte: now }
    }).sort({ date: 1 }).lean();

    // Also fetch user's requests to know what they signed up for
    let userRequests: any[] = [];
    if (session.user.unitId) {
        userRequests = await ServiceRequest.find({
            unitId: session.user.unitId,
            serviceEventId: { $in: services.map((s: any) => s._id) }
        }).lean();
    }

    return {
        services: JSON.parse(JSON.stringify(services)),
        userRequests: JSON.parse(JSON.stringify(userRequests))
    };
}

export async function registerForService(
    serviceEventId: string,
    quantity: number = 1,
    notes?: string
) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.unitId) {
        return { success: false, error: 'No Unit assigned to user' };
    }

    try {
        // Validation: Check deadline
        const event = await ServiceEvent.findById(serviceEventId);
        if (!event) return { success: false, error: 'Event not found' };

        if (new Date() > new Date(event.deadline)) {
            return { success: false, error: 'Deadline passed' };
        }

        const request = await ServiceRequest.create({
            serviceEventId,
            unitId: session.user.unitId,
            userId: session.user.id,
            quantity,
            notes,
            status: 'Requested'
        });

        revalidatePath('/services');
        return { success: true };
    } catch (error: any) {
        // Catch duplicate key error for unique index
        if (error.code === 11000) {
            return { success: false, error: 'Already registered' };
        }
        return { success: false, error: error.message };
    }
}

export async function cancelRegistration(requestId: string) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    try {
        const request = await ServiceRequest.findById(requestId);
        if (!request) return { success: false, error: 'Request not found' };

        // Ensure user owns the request
        if (request.userId.toString() !== session.user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        // Optional: Check deadline before cancelling? Usually okay to cancel.

        await ServiceRequest.findByIdAndDelete(requestId);
        revalidatePath('/services');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
