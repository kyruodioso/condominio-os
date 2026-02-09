import mongoose, { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema({
    sender: {
        type: String,
        enum: ['ADMIN', 'USER', 'STAFF'],
        required: true,
    },
    unitId: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        required: true,
    },
    content: {
        type: String,
        required: false, // Optional for audio messages
        trim: true,
    },
    type: {
        type: String,
        enum: ['text', 'audio'],
        default: 'text',
    },
    channel: {
        type: String,
        enum: ['ADMINISTRACION', 'ENCARGADO', 'SEGURIDAD', 'MANTENIMIENTO'], // Departments
        default: 'ADMINISTRACION',
    },
    fileUrl: {
        type: String, // URL for audio file
        required: false,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index para búsquedas rápidas por unidad y fecha
MessageSchema.index({ unitId: 1, createdAt: 1 });

const Message = models.Message || model('Message', MessageSchema);

export default Message;
