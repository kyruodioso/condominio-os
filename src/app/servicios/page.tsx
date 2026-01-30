import { getUpcomingServices } from '@/actions/services';
import { ServiceList } from '@/components/services/ServiceList';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Truck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const { services, userRequests } = await getUpcomingServices();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pb-24">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
                <header>
                    <div className="flex items-center gap-3 mb-2">
                        <Truck className="text-gym-primary" size={32} />
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                            Servicios Disponibles
                        </h1>
                    </div>
                    <p className="text-gray-400 text-sm max-w-2xl">
                        Inscríbete en los próximos servicios disponibles para tu edificio (Limpieza de vidrios, Reparto de agua, etc.).
                    </p>
                </header>

                <ServiceList services={services} userRequests={userRequests} />
            </div>
        </div>
    );
}
