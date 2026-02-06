import mongoose, { Schema, model, models } from 'mongoose';

const ExpenseSchema = new Schema({
    condominiumId: {
        type: Schema.Types.ObjectId,
        ref: 'Condominium',
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        default: 'General',
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    attachmentUrl: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // Optional: link to a liquidation batch if we want to group them later
    liquidationId: {
        type: Schema.Types.ObjectId,
        ref: 'Liquidation',
        required: false
    }
});

const Expense = models.Expense || model('Expense', ExpenseSchema);

export default Expense;
