import { getAdminServices } from '@/actions/services';
import { CreateServiceModal } from '@/components/admin/CreateServiceModal';
import Link from 'next/link';
import { Briefcase, Calendar, Clock, DollarSign, Truck, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage() {
    const services = await getAdminServices();

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                        Servicios y Pedidos
                    </h1>
                    <p className="text-gray-400 text-sm">Gestiona limpiezas de vidrios, reparto de agua y otros.</p>
                </div>
                <CreateServiceModal />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-gym-gray rounded-3xl border border-white/5">
                        <Briefcase className="mx-auto text-gray-600 mb-4" size={48} />
                        <h3 className="text-white font-bold text-lg mb-2">No hay servicios activos</h3>
                        <p className="text-gray-400 text-sm">Crea un nuevo servicio para comenzar.</p>
                    </div>
                ) : (
                    services.map((service: any) => (
                        <div key={service._id} className="bg-gym-gray p-6 rounded-3xl border border-white/5 hover:border-gym-primary/30 transition-all group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-gym-primary transition-colors">
                                    {service.title}
                                </h3>
                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${service.status === 'Open' ? 'bg-green-500/20 text-green-400' :
                                        service.status === 'Closed' ? 'bg-gray-500/20 text-gray-400' :
                                            'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {service.status === 'Open' ? 'Abierto' : service.status === 'Closed' ? 'Cerrado' : 'Finalizado'}
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm mb-6 flex-grow line-clamp-2">
                                {service.description}
                            </p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-gray-300 text-sm">
                                    <Calendar size={16} className="text-gym-primary" />
                                    <span>{format(new Date(service.date), "d 'de' MMMM, HH:mm", { locale: es })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400 text-xs">
                                    <Clock size={16} className="text-red-400" />
                                    <span>Cierra: {format(new Date(service.deadline), "d MMM, HH:mm", { locale: es })}</span>
                                </div>
                                {(service.price > 0 || service.providerName) && (
                                    <div className="flex gap-4 pt-2 border-t border-white/5">
                                        {service.price > 0 && (
                                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                                <DollarSign size={14} className="text-green-400" />
                                                ${service.price}
                                            </div>
                                        )}
                                        {service.providerName && (
                                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                                                <Truck size={14} />
                                                {service.providerName}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Link
                                href={`/admin/servicios/${service._id}`}
                                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest py-3 rounded-xl text-xs text-center transition-colors flex items-center justify-center gap-2 group-hover:bg-gym-primary group-hover:text-black"
                            >
                                <Users size={16} /> Ver Inscritos
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
