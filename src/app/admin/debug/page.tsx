import { auth } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    let dbStatus = 'Unknown';
    let sessionStatus = 'Unknown';
    let sessionData = null;
    let error = null;

    try {
        // Test DB
        await dbConnect();
        const state = mongoose.connection.readyState;
        dbStatus = state === 1 ? 'Connected (1)' : `Disconnected (${state})`;

        // Test Auth
        const session = await auth();
        sessionStatus = session ? 'Authenticated' : 'No Session';
        sessionData = session;

    } catch (e: any) {
        error = e.message;
        console.error('Debug Page Error:', e);
    }

    return (
        <div className="p-10 text-white space-y-6">
            <h1 className="text-3xl font-bold text-yellow-500">System Debug</h1>
            
            <div className="bg-gray-900 p-6 rounded-xl border border-white/10">
                <h2 className="text-xl font-bold mb-4">Database</h2>
                <p>Status: <span className={dbStatus.includes('Connected') ? 'text-green-400' : 'text-red-400'}>{dbStatus}</span></p>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl border border-white/10">
                <h2 className="text-xl font-bold mb-4">Authentication</h2>
                <p>Status: <span className={sessionStatus === 'Authenticated' ? 'text-green-400' : 'text-red-400'}>{sessionStatus}</span></p>
                <pre className="mt-4 bg-black p-4 rounded text-xs overflow-auto max-h-60">
                    {JSON.stringify(sessionData, null, 2)}
                </pre>
            </div>

            {error && (
                <div className="bg-red-900/20 p-6 rounded-xl border border-red-500">
                    <h2 className="text-xl font-bold text-red-500 mb-4">Error Detected</h2>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}
