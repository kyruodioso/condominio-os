import mongoose, { Schema, model, models } from 'mongoose';

const ServiceEventSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    price: {
        type: Number,
        default: 0,
    },
    providerName: {
        type: String,
    },
    requiresQuantity: {
        type: Boolean,
        default: false,
    },
    condominiumId: {
        type: Schema.Types.ObjectId,
        ref: 'Condominium',
        required: true,
    },
    status: {
        type: String,
        enum: ['Open', 'Closed', 'Completed'],
        default: 'Open',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const ServiceEvent = models.ServiceEvent || model('ServiceEvent', ServiceEventSchema);

export default ServiceEvent;
