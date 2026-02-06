import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'CONSORCIO_ADMIN', 'ADMIN', 'OWNER', 'TENANT'],
        default: 'TENANT',
    },
    condominiumId: {
        type: Schema.Types.ObjectId,
        ref: 'Condominium',
        // Not required for Super Admin
    },
    unitNumber: {
        type: String, // Can be linked to Unit model if needed, but keeping simple for now
    },
    profile: {
        name: String,
        phone: String,
        avatarUrl: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastActive: {
        type: Date,
    },
});

const User = models.User || model('User', UserSchema);

export default User;
