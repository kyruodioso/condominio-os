import mongoose, { Schema, model, models } from 'mongoose';

const UnitSchema = new Schema({
    number: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    accessPin: {
        type: String,
        required: false, // PIN is now obsolete
    },
    contactName: {
        type: String,
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
    coefficient: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
});

const Unit = models.Unit || model('Unit', UnitSchema);

export default Unit;
