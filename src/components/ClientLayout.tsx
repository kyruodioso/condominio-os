'use client';

import { SessionProvider } from 'next-auth/react';
import Navbar from './Navbar';
import FloatingChatWidget from '@/components/chat/FloatingChatWidget';
import HeartbeatManager from '@/components/auth/HeartbeatManager';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <HeartbeatManager />
            <Navbar />
            {children}
            <FloatingChatWidget />
        </SessionProvider>
    );
}
