'use client';

import { SessionProvider } from 'next-auth/react';
import Navbar from './Navbar';
import FloatingChatWidget from '@/components/chat/FloatingChatWidget';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <Navbar />
            {children}
            <FloatingChatWidget />
        </SessionProvider>
    );
}
