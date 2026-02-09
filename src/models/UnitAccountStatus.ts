import mongoose, { Schema, model, models } from 'mongoose';

const UnitAccountStatusSchema = new Schema({
    settlementId: {
        type: Schema.Types.ObjectId,
        ref: 'ExpenseSettlement',
        required: true,
    },
    unitId: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        required: true,
    },
    ownerName: {
        type: String,
        required: true, // Snapshot current owner name
    },
    coefficient: {
        type: Number,
        required: true, // Snapshot current coefficient
    },
    previousBalance: {
        type: Schema.Types.Decimal128,
        default: 0,
    },
    paymentsAmount: {
        type: Schema.Types.Decimal128,
        default: 0,
    },
    interestAmount: {
        type: Schema.Types.Decimal128,
        default: 0,
    },
    currentPeriodShare: {
        type: Schema.Types.Decimal128,
        default: 0,
    },
    reserveFundAmount: {
        type: Schema.Types.Decimal128,
        default: 0,
    },
    totalToPay: {
        type: Schema.Types.Decimal128,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Composite index to ensure one status per unit per settlement
UnitAccountStatusSchema.index({ settlementId: 1, unitId: 1 }, { unique: true });

const UnitAccountStatus = models.UnitAccountStatus || model('UnitAccountStatus', UnitAccountStatusSchema);

export default UnitAccountStatus;
