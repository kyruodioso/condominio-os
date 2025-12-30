import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMaintenanceTask extends Document {
    title: string;
    description?: string;
    status: 'Pendiente' | 'En Progreso' | 'Finalizada';
    priority: 'Baja' | 'Media' | 'Alta';
    createdAt: Date;
    scheduledDate?: Date;
    completedAt?: Date;
}

const MaintenanceTaskSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['Pendiente', 'En Progreso', 'Finalizada'],
        default: 'Pendiente'
    },
    priority: {
        type: String,
        enum: ['Baja', 'Media', 'Alta'],
        default: 'Media'
    },
    createdAt: { type: Date, default: Date.now },
    scheduledDate: { type: Date },
    completedAt: { type: Date },
    condominiumId: {
        type: Schema.Types.ObjectId,
        ref: 'Condominium',
        required: true,
    },
});

// Removed pre-save hook to avoid potential conflicts/errors. 
// Logic for completedAt is handled in server actions.

const MaintenanceTask: Model<IMaintenanceTask> = mongoose.models.MaintenanceTask || mongoose.model<IMaintenanceTask>('MaintenanceTask', MaintenanceTaskSchema);

export default MaintenanceTask;
