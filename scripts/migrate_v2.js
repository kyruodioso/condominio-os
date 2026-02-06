const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { resolve } = require('path');

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/condominio_db';

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const migrate = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Migrate Users: ADMIN -> STAFF
        const userResult = await mongoose.connection.collection('users').updateMany(
            { role: 'ADMIN' },
            { $set: { role: 'STAFF' } }
        );
        console.log(`Updated ${userResult.modifiedCount} users from ADMIN to STAFF.`);

        // 2. Migrate Condominiums: Set default planType to FREE if missing
        const condoResult = await mongoose.connection.collection('condominiums').updateMany(
            { planType: { $exists: false } },
            { $set: { planType: 'FREE' } }
        );
        console.log(`Updated ${condoResult.modifiedCount} condominiums with default PlanType FREE.`);

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

migrate();
