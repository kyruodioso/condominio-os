import mongoose, { Schema, model, models } from 'mongoose';

const SettingsSchema = new Schema({
    // Vinculación opcional a un condominio si es multi-tenant, 
    // pero para este caso lo haremos simple (un settings global o por admin).
    // Asumiremos que hay un documento de configuración principal.
    condominiumId: {
        type: Schema.Types.ObjectId,
        ref: 'Condominium',
        // unique: true // Idealmente único por condominio
    },
    adminWorkHours: {
        start: { type: String, default: "09:00" }, // HH:mm
        end: { type: String, default: "18:00" },   // HH:mm
        days: { type: [Number], default: [1, 2, 3, 4, 5] } // 0=Dom, 1=Lun...
    },
    autoReplyMessage: {
        type: String,
        default: "Gracias por tu mensaje. En este momento no estoy disponible. Te responderé a la brevedad dentro de mi horario laboral."
    },
    isAutoReplyEnabled: {
        type: Boolean,
        default: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Settings = models.Settings || model('Settings', SettingsSchema);

export default Settings;
