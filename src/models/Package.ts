import mongoose, { Schema, model, models } from 'mongoose';

const PackageSchema = new Schema({
    unit: {
        type: String,
        required: true,
        uppercase: true, // Normalize units like '4b' to '4B'
        trim: true,
    },
    recipientName: {
        type: String,
        required: true,
    },
    entryDate: {
        type: Date,
        default: Date.now,
    },
    isPickedUp: {
        type: Boolean,
        default: false,
    },
    condominiumId: {
        type: Schema.Types.ObjectId,
        ref: 'Condominium',
        required: true,
    },
});

const Package = models.Package || model('Package', PackageSchema);

export default Package;
