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
    expenseId: {
        type: Schema.Types.ObjectId,
        ref: 'Expense',
        required: true,
    },
    period: { type: String, required: true }, // Format: "MM-YYYY"
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'OVERDUE'],
        default: 'PENDING',
    },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    paymentDate: { type: Date },
});

const ExpenseBill = models.ExpenseBill || model('ExpenseBill', ExpenseBillSchema);

export default ExpenseBill;
