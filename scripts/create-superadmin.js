
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'OWNER', 'TENANT'], default: 'TENANT' },
    profile: {
        name: { type: String, required: true },
        phone: String,
    },
    condominiumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominium' },
    unitNumber: String,
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const createSuperAdmin = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI no está definida en .env.local');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB');

        const email = 'admin@condominio.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('Usuario ya existe. Actualizando...');
            existingUser.password = hashedPassword;
            existingUser.role = 'SUPER_ADMIN';
            await existingUser.save();
            console.log('Usuario actualizado a SUPER_ADMIN.');
        } else {
            const superAdmin = new User({
                email,
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                profile: { name: 'Super Admin' }
            });
            await superAdmin.save();
            console.log('Super Admin creado exitosamente.');
        }

        console.log(`Credenciales: ${email} / ${password}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

createSuperAdmin();
