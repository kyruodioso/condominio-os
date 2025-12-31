'use client';

import { useSession } from 'next-auth/react';
import ProvidersManager from '@/components/admin/ProvidersManager';
import DirectorioPublic from '@/components/directorio/DirectorioPublic';
import { Loader2 } from 'lucide-react';

export default function DirectorioPage() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
                <Loader2 size={48} className="animate-spin text-green-500" />
            </div>
        );
    }

    // Show management interface for admins
    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
                <div className="max-w-7xl mx-auto">
                    <ProvidersManager />
                </div>
            </div>
        );
    }

    // Show public directory for residents
    return <DirectorioPublic />;
}
