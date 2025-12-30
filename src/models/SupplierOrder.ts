import mongoose, { Schema, model, models } from 'mongoose';

const SupplierOrderSchema = new Schema({
    unitId: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        required: true,
    },
    provider: {
        type: String,
        required: true,
        // Common providers, but allowing flexibility as string
        enum: ['Ivess', 'Cimes', 'Ayerdi', 'Otro'],
        default: 'Ivess'
    },
    product: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    status: {
        type: String,
        enum: ['Pendiente', 'Entregado'],
        default: 'Pendiente',
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

const SupplierOrder = models.SupplierOrder || model('SupplierOrder', SupplierOrderSchema);

export default SupplierOrder;
