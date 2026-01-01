'use client';

import { SessionProvider } from 'next-auth/react';
import Navbar from './Navbar';
import FloatingChatWidget from '@/components/chat/FloatingChatWidget';
import HeartbeatManager from '@/components/auth/HeartbeatManager';
import NotificationListener from '@/components/notifications/NotificationListener';
import { ToastProvider } from '@/contexts/ToastContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ToastProvider>
                <HeartbeatManager />
                <NotificationListener />
                <Navbar />
                {children}
                <FloatingChatWidget />
            </ToastProvider>
        </SessionProvider>
    );
}
