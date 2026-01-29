'use client';

import { useState, useEffect } from 'react';
import { getPackagesByUnit, markAsPickedUp } from '@/actions/packages';
import { Package, AlertCircle, Check } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/LoadingSpinner';
import { useSession } from 'next-auth/react';

export default function BuzonPage() {
    const { data: session } = useSession();
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        setLoading(true);
        setError('');

        const res = await getPackagesByUnit();

        if (res.error) {
            setError(res.error);
        } else {
            setPackages(res.data || []);
        }

        setLoading(false);
    };

    const handlePickup = async (id: string) => {
        if (!confirm('¿Confirmas que ya retiraste este paquete?')) return;

        try {
            await markAsPickedUp(id);
            // Optimistic update or reload
            setPackages(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            alert('Error al marcar como retirado');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumbs */}
                <Breadcrumbs items={[
                    { label: 'Buzón' }
                ]} />

                <header className="mb-8">
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600 mb-2">
                        Buzón de Paquetes
                    </h1>
                    <p className="text-gray-300 text-sm">
                        {/* @ts-ignore */}
                        Unidad {session?.user?.unitNumber || '...'}
                    </p>
                </header>

                <div className="max-w-md mx-auto">
                    {loading ? (
                        <SkeletonList items={3} />
                    ) : error ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                            <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
                            <p className="text-red-400 font-bold">{error}</p>
                            <button onClick={loadPackages} className="mt-4 text-sm text-white underline">Intentar de nuevo</button>
                        </div>
                    ) : packages.length === 0 ? (
                        <EmptyState
                            icon={Package}
                            title="No hay paquetes pendientes"
                            description="Cuando llegue correspondencia para tu unidad, aparecerá aquí. El encargado registrará cada entrega y recibirás una notificación."
                            iconColor="text-blue-500"
                        />
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-blue-500/10 rounded-2xl p-6 mb-6 border border-blue-500/20 text-center">
                                <h2 className="text-xl font-bold text-white mb-1">Tu Buzón</h2>
                                <p className="text-blue-300 text-sm">
                                    Tienes {packages.length} paquete(s) esperando.
                                </p>
                            </div>

                            {packages.map((pkg) => (
                                <div key={pkg._id} className="bg-gym-gray rounded-2xl p-5 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] flex items-center justify-between hover:border-blue-500/50 transition-colors">
                                    <div>
                                        <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Pendiente de retiro</p>
                                        <h4 className="font-bold text-white text-lg">{pkg.recipientName}</h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Llegó: {new Date(pkg.entryDate).toLocaleDateString('es-AR')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handlePickup(pkg._id)}
                                            className="p-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition-all"
                                            title="Marcar como retirado"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                            <Package size={20} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
