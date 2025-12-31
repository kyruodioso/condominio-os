'use client';

import { useState } from 'react';
import { testServerAction } from '@/actions/test';

export default function TestActionPage() {
    const [status, setStatus] = useState('Idle');
    const [result, setResult] = useState('');

    const runTest = async () => {
        setStatus('Running...');
        try {
            const res = await testServerAction('Hello from client');
            setResult(JSON.stringify(res));
            setStatus('Success');
        } catch (e: any) {
            console.error(e);
            setStatus('Error: ' + e.message);
        }
    };

    return (
        <div className="p-10 text-white">
            <h1 className="text-3xl font-bold mb-4">Server Action Test</h1>
            <button 
                onClick={runTest}
                className="bg-blue-500 px-4 py-2 rounded font-bold"
            >
                Run Test Action
            </button>
            <div className="mt-4">
                <p>Status: {status}</p>
                <pre className="bg-gray-900 p-4 mt-2 rounded">{result}</pre>
            </div>
        </div>
    );
}
