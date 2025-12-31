'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function HeartbeatManager() {
    const { data: session } = useSession();

    useEffect(() => {
        if (!session) return;

        const sendHeartbeat = () => {
            fetch('/api/user/heartbeat', { method: 'POST', keepalive: true }).catch(() => {});
        };

        // Send immediately on mount
        sendHeartbeat();

        // Send every 60 seconds
        const interval = setInterval(sendHeartbeat, 60000);

        return () => clearInterval(interval);
    }, [session]);

    return null;
}
