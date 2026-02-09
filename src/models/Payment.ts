import mongoose, { Schema, model, models } from 'mongoose';

const PaymentSchema = new Schema({
    condominiumId: {
        type: Schema.Types.ObjectId,
        ref: 'Condominium',
        required: true,
    },
    unitId: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        required: true,
    },
    amount: {
        type: Schema.Types.Decimal128,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['TRANSFERENCIA', 'EFECTIVO', 'CHEQUE', 'OTRO'],
        default: 'TRANSFERENCIA',
    },
    referenceNumber: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'REJECTED'],
        default: 'PENDING',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Payment = models.Payment || model('Payment', PaymentSchema);

export default Payment;
