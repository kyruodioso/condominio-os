import mongoose, { Schema, model, models } from 'mongoose';

const ReportSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    unitNumber: {
        type: String,
        required: true,
        uppercase: true,
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved'],
        default: 'pending',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    maintenanceTaskId: {
        type: Schema.Types.ObjectId,
        ref: 'MaintenanceTask',
    },
});

const Report = models.Report || model('Report', ReportSchema);

export default Report;
