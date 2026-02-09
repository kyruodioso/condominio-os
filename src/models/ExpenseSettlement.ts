import mongoose, { Schema, model, models } from 'mongoose';

const ExpenseSettlementSchema = new Schema({
    condominiumId: {
        type: Schema.Types.ObjectId,
        ref: 'Condominium',
        required: true,
    },
    period: {
        type: String, // Format: "MM-YYYY" e.g., "01-2026"
        required: true,
    },
    totalAmountA: {
        type: Schema.Types.Decimal128,
        default: 0,
    },
    totalAmountB: {
        type: Schema.Types.Decimal128,
        default: 0,
    },
    totalAmountC: {
        type: Schema.Types.Decimal128,
        default: 0,
    },
    reserveFundPercentage: {
        type: Number,
        required: true,
        default: 0,
    },
    status: {
        type: String,
        enum: ['DRAFT', 'CLOSED', 'SENT'],
        default: 'DRAFT',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    closedAt: {
        type: Date,
    },
});

// Calculate total expenses before saving
ExpenseSettlementSchema.methods.calculateTotal = function() {
    // This is a placeholder, actual calculation might happen in logic
    // but useful to have helper methods.
};

const ExpenseSettlement = models.ExpenseSettlement || model('ExpenseSettlement', ExpenseSettlementSchema);

export default ExpenseSettlement;
