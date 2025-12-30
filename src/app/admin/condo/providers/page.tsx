import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProvidersManager from '@/components/admin/ProvidersManager';

export default async function ProvidersPage() {
    const session = await auth();

    if (session?.user?.role !== 'ADMIN') {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <Link 
                    href="/admin/condo" 
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm font-bold uppercase tracking-widest"
                >
                    <ArrowLeft size={16} /> Volver
                </Link>

                <ProvidersManager />
            </div>
        </div>
    );
}
