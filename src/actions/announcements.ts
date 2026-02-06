'use server';

import dbConnect from '@/lib/dbConnect';
import Announcement from '@/models/Announcement';
import { auth } from '@/auth';

import { can, PERMISSIONS, PlanType } from '@/lib/permissions';

export async function getActiveAnnouncements() {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        return [];
    }

    // Find announcements that haven't expired yet and belong to the user's condominium
    const announcements = await Announcement.find({
        condominiumId: session.user.condominiumId,
        expiresAt: { $gte: new Date() }
    })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(); // Convert to plain JS objects

    // Serialize dates for Client Components
    return announcements.map((a: any) => ({
        ...a,
        _id: a._id.toString(),
        expiresAt: a.expiresAt.toISOString(),
        createdAt: a.createdAt.toISOString(),
    }));
}

export async function createAnnouncement(data: { title: string; message: string; type: 'Info' | 'Alerta'; daysToLive: number }) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        throw new Error('No condominium ID found. User must be associated with a condominium.');
    }

    const planType = (session.user.planType || PlanType.FREE) as PlanType;
    if (!can(session.user, PERMISSIONS.MANAGE_ANNOUNCEMENTS, planType)) {
        throw new Error('Unauthorized. Tu plan o rol no permite crear anuncios.');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.daysToLive);

    const newAnnouncement = await Announcement.create({
        title: data.title,
        message: data.message,
        type: data.type,
        condominiumId: session.user.condominiumId,
        expiresAt
    });

    return JSON.parse(JSON.stringify(newAnnouncement));
}

export async function deleteAnnouncement(id: string) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        throw new Error('Unauthorized');
    }

    const planType = (session.user.planType || PlanType.FREE) as PlanType;
    if (!can(session.user, PERMISSIONS.MANAGE_ANNOUNCEMENTS, planType)) {
        throw new Error('Unauthorized');
    }

    await Announcement.findByIdAndDelete(id);

    // Revalidate paths where announcements might be shown
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/');
    revalidatePath('/admin');
}
