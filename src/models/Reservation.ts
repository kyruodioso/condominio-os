import mongoose, { Schema, model, models } from 'mongoose';

const ReservationSchema = new Schema({
    unit: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        required: true,
    },
    date: {
        type: String, // YYYY-MM-DD format
        required: true,
    },
    startTime: {
        type: String, // HH:mm format
        required: true,
    },
    endTime: {
        type: String, // HH:mm format
        required: true,
    },
    resources: {
        type: [String],
        enum: ['SUM', 'Parrilla'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    condominiumId: {
        type: Schema.Types.ObjectId,
        ref: 'Condominium',
        required: true,
    },
});

// We handle overlap validation in the application layer now
// ReservationSchema.index({ condominiumId: 1, date: 1, timeSlot: 1 }, { unique: true });

const Reservation = models.Reservation || model('Reservation', ReservationSchema);

export default Reservation;
