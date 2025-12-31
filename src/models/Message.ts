import mongoose, { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema({
    sender: {
        type: String,
        enum: ['ADMIN', 'USER'],
        required: true,
    },
    unitId: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
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
