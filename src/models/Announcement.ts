import mongoose, { Schema, model, models } from 'mongoose';

const AnnouncementSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Info', 'Alerta'],
        default: 'Info',
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    condominiumId: {
        type: Schema.Types.ObjectId,
        ref: 'Condominium',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Announcement = models.Announcement || model('Announcement', AnnouncementSchema);

export default Announcement;
