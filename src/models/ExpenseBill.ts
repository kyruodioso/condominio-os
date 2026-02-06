import mongoose, { Schema, model, models } from 'mongoose';

const ExpenseBillSchema = new Schema({
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
    period: { // Format "YYYY-MM"
        type: String,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'OVERDUE'],
        default: 'PENDING',
    },
    issueDate: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
    },
    paymentDate: {
        type: Date,
    },
    items: [{ // Snapshot of items included in this bill
        description: String,
        amount: Number,
        category: String
    }]
});

// Composite index to prevent duplicates for same unit/period
ExpenseBillSchema.index({ unitId: 1, period: 1 }, { unique: true });

const ExpenseBill = models.ExpenseBill || model('ExpenseBill', ExpenseBillSchema);

export default ExpenseBill;
