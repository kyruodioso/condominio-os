import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProvidersManager from '@/components/admin/ProvidersManager';

export default async function ProvidersPage() {
    const session = await auth();

    if (session?.user?.role !== 'ADMIN') {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <Breadcrumbs items={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Proveedores' }
                ]} />

                <ProvidersManager />
            </div>
        </div>
    );
}
