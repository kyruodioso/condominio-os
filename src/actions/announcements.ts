'use server';

import dbConnect from '@/lib/dbConnect';
import Announcement from '@/models/Announcement';

export async function getActiveAnnouncements() {
    await dbConnect();

    // Find announcements that haven't expired yet
    const announcements = await Announcement.find({
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

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.daysToLive);

    const newAnnouncement = await Announcement.create({
        title: data.title,
        message: data.message,
        type: data.type,
        expiresAt
    });

    return JSON.parse(JSON.stringify(newAnnouncement));
}
