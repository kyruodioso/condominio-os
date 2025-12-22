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
        required: true,
        minlength: 4,
        maxlength: 4,
    },
    contactName: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Unit = models.Unit || model('Unit', UnitSchema);

export default Unit;
