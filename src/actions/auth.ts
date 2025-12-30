'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function changePassword(data: { 
    currentPassword: string; 
    newPassword: string;
}) {
    const session = await auth();

    if (!session?.user?.email) {
        throw new Error('No autenticado');
    }

    await dbConnect();

    // Find user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(data.currentPassword, user.password);
    if (!isValidPassword) {
        throw new Error('Contraseña actual incorrecta');
    }

    // Validate new password
    if (data.newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return { success: true, message: 'Contraseña actualizada exitosamente' };
}
