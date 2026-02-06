import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminChatLayout from '@/components/admin/AdminChatLayout';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AdminMessagesPage() {
    const session = await auth();

    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN' && session?.user?.role !== 'STAFF' && session?.user?.role !== 'CONSORCIO_ADMIN') {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex items-center gap-4">
                    <Link href="/admin" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                            Centro de Mensajes
                        </h1>
                        <p className="text-gray-400 text-sm">Comunicación directa con residentes</p>
                    </div>
                </header>

                <AdminChatLayout />
            </div>
        </div>
    );
}
