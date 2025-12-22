'use client';

import { useState } from 'react';
import { getPackagesByUnit } from '@/actions/packages';
import { Package, Search, Box, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function BuzonPage() {
    const [unit, setUnit] = useState('');
    const [pin, setPin] = useState('');
    const [packages, setPackages] = useState<any[]>([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!unit || !pin) return;

        setLoading(true);
        setError('');
        setSearched(false);

        const res = await getPackagesByUnit(unit, pin);

        if (res.error) {
            setError(res.error);
        } else {
            setPackages(res.data || []);
            setSearched(true);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <header className="mb-8 flex items-center justify-between">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                    ← Volver
                </Link>
                <h1 className="text-2xl font-black italic uppercase tracking-tighter text-blue-500">Buzón</h1>
            </header>

            <div className="max-w-md mx-auto">
                <div className="bg-gym-gray rounded-3xl p-8 border border-white/5 shadow-lg mb-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                            <Package size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-white">¿Tienes paquetes?</h2>
                        <p className="text-gray-400 text-sm mt-1">Ingresa tu unidad y PIN de seguridad</p>
                    </div>

                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Unidad (ej: 4B)"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:border-blue-500 outline-none transition-all uppercase font-bold tracking-wider text-center"
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="PIN (4 dígitos)"
                                maxLength={4}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-white placeholder:text-gray-600 focus:border-blue-500 outline-none transition-all font-mono tracking-widest text-center"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm font-bold justify-center animate-in fade-in">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !unit || !pin}
                            className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl hover:bg-blue-400 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Search size={20} />
                                    Consultar
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {searched && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider pl-2">Resultados para {unit}</h3>

                        {packages.length === 0 ? (
                            <div className="bg-gym-gray rounded-2xl p-8 text-center border border-white/5 border-dashed">
                                <Box size={40} className="mx-auto text-gray-700 mb-2" />
                                <p className="text-gray-400 font-medium">No hay paquetes pendientes.</p>
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
