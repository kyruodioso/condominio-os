'use client';

import { useState, useEffect } from 'react';
import { getReservations } from '@/actions/reservations';
import { Calendar, Clock, User } from 'lucide-react';
import Link from 'next/link';

export default function ReservationsAdminPage() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        // Fetch all future reservations
        const today = new Date().toISOString().split('T')[0];
        const data = await getReservations(today, '2099-12-31');
        setReservations(data);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <header className="mb-8 flex items-center justify-between max-w-4xl mx-auto">
                <Link href="/buzon/admin" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                    ← Volver al Panel
                </Link>
                <h1 className="text-2xl font-black italic uppercase tracking-tighter text-gray-500">Reservas SUM</h1>
            </header>

            <div className="max-w-4xl mx-auto">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Cargando agenda...</p>
                    </div>
                ) : reservations.length === 0 ? (
                    <div className="bg-gym-gray rounded-3xl p-12 text-center border border-white/5 border-dashed">
                        <Calendar size={48} className="mx-auto text-gray-700 mb-4" />
                        <p className="text-gray-400 font-medium">No hay reservas próximas.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reservations.map((res) => (
                            <div key={res._id} className="bg-gym-gray p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className="bg-black/30 p-4 rounded-2xl text-center min-w-[80px]">
                                        <span className="block text-xs text-gray-500 uppercase font-bold">Fecha</span>
                                        <span className="block text-xl font-black text-white">{res.date.split('-')[2]}/{res.date.split('-')[1]}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            {res.resources.map((r: string) => (
                                                <span key={r} className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${r === 'SUM' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <User size={18} className="text-gray-500" />
                                            Unidad {res.unit?.number || '???'}
                                        </h3>
                                        <p className="text-sm text-gray-400 mb-1">{res.unit?.contactName || 'Sin nombre'}</p>
                                        <p className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded w-fit">
                                            {res.startTime} - {res.endTime}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-gray-600 font-mono">ID: {res._id.slice(-6)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
