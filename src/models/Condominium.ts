import mongoose, { Schema, model, models } from 'mongoose';

const CondominiumSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    planType: {
        type: String,
        enum: ['FREE', 'PRO'],
        default: 'FREE',
    },
    maxUnits: {
        type: Number,
        default: 50,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Condominium = models.Condominium || model('Condominium', CondominiumSchema);

export default Condominium;
