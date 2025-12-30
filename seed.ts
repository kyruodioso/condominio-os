import dbConnect from './src/lib/dbConnect';
import User from './src/models/User';
import bcrypt from 'bcryptjs';

const seedSuperAdmin = async () => {
    try {
        await dbConnect();

        const email = 'superadmin@condominioos.com';
        const password = 'supersecretpassword'; // Change this!
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Super Admin already exists');
            return;
        }

        const superAdmin = new User({
            email,
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            profile: {
                name: 'Super Admin',
            },
        });

        await superAdmin.save();
        console.log('Super Admin created successfully');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    } catch (error) {
        console.error('Error seeding Super Admin:', error);
    } finally {
        process.exit();
    }
};

seedSuperAdmin();
