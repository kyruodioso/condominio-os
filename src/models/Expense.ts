import mongoose, { Schema, model, models } from 'mongoose';

const ExpenseSchema = new Schema({
    condominiumId: {
        type: Schema.Types.ObjectId,
        ref: 'Condominium',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    provider: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        enum: ['SUELDOS', 'SERVICIOS', 'MANTENIMIENTO', 'SEGUROS', 'ADMINISTRACION', 'BANCARIOS'],
        required: true,
    },
    type: {
        type: String,
        enum: ['GASTO_A', 'GASTO_B', 'GASTO_C', 'PARTICULAR'],
        required: true,
    },
    amount: {
        type: Schema.Types.Decimal128,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['BANCO', 'EFECTIVO'],
        required: true,
    },
    invoiceNumber: {
        type: String,
        trim: true,
    },
    attachmentUrl: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Expense = models.Expense || model('Expense', ExpenseSchema);

export default Expense;
