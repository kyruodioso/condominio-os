'use client';

import { useState, useEffect } from 'react';
import { getPackagesByUnit } from '@/actions/packages';
import { Package, Box, AlertCircle } from 'lucide-react';
import Link from 'next/link';
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

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <header className="mb-8 flex items-center justify-between">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                    ← Volver
                </Link>
                <div className="text-right">
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter text-blue-500">Buzón</h1>
                    {/* @ts-ignore */}
                    <p className="text-xs text-gray-400">Unidad {session?.user?.unitNumber || '...'}</p>
                </div>
            </header>

            <div className="max-w-md mx-auto">
                {loading ? (
                    <div className="text-center py-12">
                         <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                         <p className="text-gray-400">Buscando paquetes...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                        <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
                        <p className="text-red-400 font-bold">{error}</p>
                        <button onClick={loadPackages} className="mt-4 text-sm text-white underline">Intentar de nuevo</button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-blue-500/10 rounded-2xl p-6 mb-6 border border-blue-500/20 text-center">
                             <h2 className="text-xl font-bold text-white mb-1">Tu Buzón</h2>
                             <p className="text-blue-300 text-sm">
                                {packages.length === 0 
                                    ? "No tienes paquetes pendientes de retiro." 
                                    : `Tienes ${packages.length} paquete(s) esperando.`}
                             </p>
                        </div>

                        {packages.length === 0 ? (
                            <div className="bg-gym-gray rounded-2xl p-8 text-center border border-white/5 border-dashed opacity-50">
                                <Box size={40} className="mx-auto text-gray-700 mb-2" />
                                <p className="text-gray-400 font-medium">Todo limpio por aquí.</p>
                            </div>
                        ) : (
                            packages.map((pkg) => (
                                <div key={pkg._id} className="bg-gym-gray rounded-2xl p-5 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Pendiente de retiro</p>
                                        <h4 className="font-bold text-white text-lg">{pkg.recipientName}</h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Llegó: {new Date(pkg.entryDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                        <Package size={20} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
