
import dbConnect from '../src/lib/dbConnect';
import User from '../src/models/User';
import bcrypt from 'bcryptjs';

const createSuperAdmin = async () => {
    try {
        await dbConnect();

        const email = 'admin@condominio.com';
        const password = 'admin123'; 
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Usuario ya existe. Actualizando contraseña...');
            existingUser.password = hashedPassword;
            existingUser.role = 'SUPER_ADMIN';
            await existingUser.save();
            console.log('Usuario actualizado.');
        } else {
            const superAdmin = new User({
                email,
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                profile: {
                    name: 'Super Admin',
                },
            });
            await superAdmin.save();
            console.log('Super Admin creado exitosamente.');
        }

        console.log('-----------------------------------');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
};

createSuperAdmin();
