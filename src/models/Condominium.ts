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
    plan: {
        type: String,
        enum: ['Free', 'Pro', 'Enterprise'],
        default: 'Free',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Condominium = models.Condominium || model('Condominium', CondominiumSchema);

export default Condominium;
