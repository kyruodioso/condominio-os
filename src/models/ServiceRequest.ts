import mongoose, { Schema, model, models } from 'mongoose';

const ServiceRequestSchema = new Schema({
    serviceEventId: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceEvent',
        required: true,
    },
    unitId: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    notes: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['Requested', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Requested',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound index to prevent duplicate requests from the same unit for the same event
ServiceRequestSchema.index({ serviceEventId: 1, unitId: 1 }, { unique: true });

const ServiceRequest = models.ServiceRequest || model('ServiceRequest', ServiceRequestSchema);

export default ServiceRequest;
