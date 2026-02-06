'use server';

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import Unit from '@/models/Unit';

export async function createCondoAdmin(data: { email: string; name: string; condominiumId: string }) {
    await dbConnect();
    const session = await auth();

    if (session?.user?.role !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized');
    }

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash('123456', 10); // Default password

    const newUser = new User({
        email: data.email,
        password: hashedPassword,
        role: 'ADMIN',
        condominiumId: data.condominiumId,
        profile: {
            name: data.name,
        },
    });

    await newUser.save();
    return JSON.parse(JSON.stringify(newUser));
}

export async function updateCondoAdmin(userId: string, data: { email: string; name: string }) {
    await dbConnect();
    const session = await auth();

    if (session?.user?.role !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (user.role !== 'ADMIN') {
        throw new Error('User is not an admin');
    }

    // Check if email is being changed and if it already exists
    if (data.email !== user.email) {
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            throw new Error('Email already exists');
        }
    }

    user.email = data.email;
    user.profile.name = data.name;

    await user.save();
    return JSON.parse(JSON.stringify(user));
}

export async function deleteCondoAdmin(userId: string) {
    await dbConnect();
    const session = await auth();

    if (session?.user?.role !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (user.role !== 'ADMIN') {
        throw new Error('User is not an admin');
    }

    await User.findByIdAndDelete(userId);
    return { success: true };
}

export async function getCondoUsers(condominiumId: string) {
    await dbConnect();
    const session = await auth();

    if (session?.user?.role !== 'SUPER_ADMIN' && session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    // If ADMIN, force condominiumId to be their own
    const targetCondoId = session.user.role === 'ADMIN' ? session.user.condominiumId : condominiumId;

    if (!targetCondoId) {
        throw new Error('Condominium ID required');
    }

    const users = await User.find({ condominiumId: targetCondoId }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(users));
}



export async function createResident(data: { email: string; name: string; unitNumber: string; role: 'OWNER' | 'TENANT' | 'ADMIN' | 'CONSORCIO_ADMIN'; password?: string }) {
    await dbConnect();
    const session = await auth();

    if (!session || !session.user) {
        throw new Error('Unauthorized');
    }

    const currentUserRole = session.user.role;
    const currentPlan = session.user.planType || 'FREE';
    const targetRole = data.role;

    // Check permissions
    if (currentUserRole !== 'ADMIN' && currentUserRole !== 'CONSORCIO_ADMIN') {
        throw new Error('Unauthorized');
    }

    // Logic for creating hierarchical roles
    if (targetRole === 'CONSORCIO_ADMIN') {
        if (currentPlan !== 'PRO') throw new Error('Cannot create CONSORCIO_ADMIN in FREE plan');
        if (currentUserRole !== 'CONSORCIO_ADMIN') throw new Error('Only CONSORCIO_ADMIN can create another CONSORCIO_ADMIN');
    }

    if (targetRole === 'ADMIN' && currentPlan === 'PRO') {
        if (currentUserRole !== 'CONSORCIO_ADMIN') throw new Error('Only CONSORCIO_ADMIN can create Staff (ADMIN)');
    }

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password || '123456', 10);

    // Ensure Unit exists
    const normalizedUnitNumber = data.unitNumber.trim().toUpperCase();
    let unit = await Unit.findOne({
        number: normalizedUnitNumber,
        condominiumId: session.user.condominiumId
    });

    if (!unit) {
        unit = await Unit.create({
            number: normalizedUnitNumber,
            condominiumId: session.user.condominiumId,
            contactName: data.name,
            accessPin: '0000' // Dummy pin
        });
    }

    const newUser = new User({
        email: data.email,
        password: hashedPassword,
        role: data.role,
        condominiumId: session.user.condominiumId,
        unitNumber: normalizedUnitNumber,
        profile: {
            name: data.name,
        },
    });

    await newUser.save();
    return JSON.parse(JSON.stringify(newUser));
}

export async function updateResident(userId: string, data: { email: string; name: string; unitNumber: string; role: 'OWNER' | 'TENANT' }) {
    await dbConnect();
    const session = await auth();

    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Verify user belongs to the same condominium
    if (user.condominiumId.toString() !== session.user.condominiumId) {
        throw new Error('Unauthorized access to user');
    }

    // Check if email is being changed and if it already exists
    if (data.email !== user.email) {
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            throw new Error('Email already exists');
        }
    }

    // Ensure Unit exists if changed
    const normalizedUnitNumber = data.unitNumber.trim().toUpperCase();
    if (normalizedUnitNumber !== user.unitNumber) {
        let unit = await Unit.findOne({
            number: normalizedUnitNumber,
            condominiumId: session.user.condominiumId
        });

        if (!unit) {
            unit = await Unit.create({
                number: normalizedUnitNumber,
                condominiumId: session.user.condominiumId,
                contactName: data.name,
                accessPin: '0000' // Dummy pin to satisfy potential old schema validation
            });
        }
    }

    user.email = data.email;
    user.profile.name = data.name;
    user.unitNumber = normalizedUnitNumber;
    user.role = data.role;

    await user.save();
    return JSON.parse(JSON.stringify(user));
}

export async function deleteResident(userId: string) {
    await dbConnect();
    const session = await auth();

    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Verify user belongs to the same condominium
    if (user.condominiumId.toString() !== session.user.condominiumId) {
        throw new Error('Unauthorized access to user');
    }

    await User.findByIdAndDelete(userId);
    return { success: true };
}
