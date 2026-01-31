'use client';

import { useState, useEffect } from 'react';
import { getPackagesByUnit, markAsPickedUp } from '@/actions/packages';
import { Package, AlertCircle, Check } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/LoadingSpinner';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

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
            // Optimistic update
            setPackages(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            alert('Error al marcar como retirado');
        }
    };

    return (
        <div className="min-h-screen text-white p-6 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Breadcrumbs */}
                <Breadcrumbs items={[
                    { label: 'Buzón' }
                ]} />

                <header className="mb-8 relative z-10">
                    <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600 mb-2 drop-shadow-md">
                        Buzón de Paquetes
                    </h1>
                    <p className="text-gray-300 text-sm font-medium pl-1">
                        {/* @ts-ignore */}
                        Unidad {session?.user?.unitNumber || '...'}
                    </p>
                </header>

                <div className="max-w-md mx-auto">
                    {loading ? (
                        <SkeletonList items={3} />
                    ) : error ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center backdrop-blur-md">
                            <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
                            <p className="text-red-400 font-bold">{error}</p>
                            <button onClick={loadPackages} className="mt-4 text-sm text-white underline hover:text-red-300 transition-colors">Intentar de nuevo</button>
                        </div>
                    ) : packages.length === 0 ? (
                        <div className="glass-panel rounded-3xl p-8">
                            <EmptyState
                                icon={Package}
                                title="No hay paquetes pendientes"
                                description="Cuando llegue correspondencia para tu unidad, aparecerá aquí."
                                iconColor="text-blue-500"
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-blue-500/10 rounded-2xl p-6 mb-6 border border-blue-500/20 text-center backdrop-blur-sm"
                            >
                                <h2 className="text-xl font-bold text-white mb-1">Tu Buzón</h2>
                                <p className="text-blue-300 text-sm">
                                    Tienes {packages.length} paquete(s) esperando.
                                </p>
                            </motion.div>

                            <AnimatePresence>
                                {packages.map((pkg, i) => (
                                    <motion.div
                                        key={pkg._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass-card rounded-2xl p-5 border-blue-500/20 flex items-center justify-between hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                                    >
                                        <div>
                                            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Pendiente de retiro</p>
                                            <h4 className="font-bold text-white text-lg group-hover:text-blue-200 transition-colors">{pkg.recipientName}</h4>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Llegó: {new Date(pkg.entryDate).toLocaleDateString('es-AR')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handlePickup(pkg._id)}
                                                className="p-3 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition-colors shadow-lg shadow-green-500/10"
                                                title="Marcar como retirado"
                                            >
                                                <Check size={20} />
                                            </motion.button>
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                                                <Package size={20} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
