import dbConnect from './src/lib/dbConnect';
import MaintenanceTask from './src/models/MaintenanceTask';

async function test() {
    try {
        console.log('Connecting to DB...');
        await dbConnect();
        console.log('Connected.');

        console.log('Creating test task...');
        const task = await MaintenanceTask.create({
            title: 'Test Task from Script',
            description: 'Testing creation',
            priority: 'Media',
            status: 'Pendiente'
        });
        console.log('Task created:', task);

        console.log('Fetching tasks...');
        const tasks = await MaintenanceTask.find({});
        console.log(`Total tasks: ${tasks.length}`);
        console.log(tasks);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

test();
