import mongoose, { Schema, model, models } from 'mongoose';

const ExpenseItemSchema = new Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, default: 'General' },
});

const ExpenseSchema = new Schema({
    condominiumId: {
        type: Schema.Types.ObjectId,
        ref: 'Condominium',
        required: true,
    },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    totalAmount: { type: Number, required: true, default: 0 },
    status: {
        type: String,
        enum: ['DRAFT', 'PUBLISHED'],
        default: 'DRAFT',
    },
    items: [ExpenseItemSchema],
    createdAt: { type: Date, default: Date.now },
    publishedAt: { type: Date },
});

const Expense = models.Expense || model('Expense', ExpenseSchema);

export default Expense;
