'use client';

import { useState, useEffect } from 'react';
import { getReservations, bookSum, cancelReservation } from '@/actions/reservations';
import { Calendar as CalendarIcon, Clock, Check, X, Flame, Home, Trash2, Loader2 } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';

export default function SumPage() {
    const { data: session } = useSession();
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [reservations, setReservations] = useState<any[]>([]);

    // Booking State
    const [startTime, setStartTime] = useState('12:00');
    const [endTime, setEndTime] = useState('16:00');
    const [selectedResources, setSelectedResources] = useState<string[]>(['SUM']);

    const [bookingStatus, setBookingStatus] = useState('');
    const [isBooking, setIsBooking] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Generate next 30 days
    const dates = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
    });

    useEffect(() => {
        // Set today as default
        setSelectedDate(new Date().toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (selectedDate) {
            loadData();
        }
    }, [selectedDate]);

    const loadData = async () => {
        const resData = await getReservations(selectedDate, selectedDate);
        setReservations(resData);
    };

    const toggleResource = (resource: string) => {
        setSelectedResources(prev =>
            prev.includes(resource)
                ? prev.filter(r => r !== resource)
                : [...prev, resource]
        );
    };

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedResources.length === 0) {
            setBookingStatus('Error: Debes seleccionar al menos un recurso.');
            return;
        }

        if (startTime >= endTime) {
            setBookingStatus('Error: La hora de inicio debe ser anterior a la de fin.');
            return;
        }

        setIsBooking(true);
        setBookingStatus('Validando...');

        const res = await bookSum({
            date: selectedDate,
            startTime,
            endTime,
            resources: selectedResources
        });

        if (res.success) {
            setBookingStatus('Success');
            setShowSuccessModal(true);
            loadData(); // Refresh list
        } else {
            setBookingStatus('Error: ' + res.error);
        }
        setIsBooking(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pb-24">
            <div className="max-w-6xl mx-auto">
                <Breadcrumbs items={[{ label: 'Reservas SUM & Parrilla' }]} />

                <header className="mb-8">
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                        Reservas
                    </h1>
                    <p className="text-gray-300 text-sm">
                        {/* @ts-ignore */}
                        Unidad {session?.user?.unitNumber || '...'}
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Calendar Column */}
                    <section className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wide flex items-center gap-2">
                                <CalendarIcon className="text-purple-500" size={20} />
                                1. Selecciona Fecha
                            </h2>
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
                                {dates.map((date) => {
                                    const d = new Date(date);
                                    const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
                                    const dayNum = d.getDate();
                                    const isSelected = selectedDate === date;

                                    return (
                                        <button
                                            key={date}
                                            onClick={() => setSelectedDate(date)}
                                            className={clsx(
                                                "rounded-2xl p-3 flex flex-col items-center justify-center border transition-all relative overflow-hidden",
                                                isSelected
                                                    ? "bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-105 z-10"
                                                    : "bg-gym-gray text-gray-400 border-white/5 hover:border-white/20 hover:bg-white/5"
                                            )}
                                        >
                                            <span className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">{dayName}</span>
                                            <span className="text-xl font-black">{dayNum}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Existing Reservations List */}
                        <div>
                            <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wide flex items-center gap-2">
                                <Clock className="text-blue-400" size={20} />
                                Reservas del Día ({new Date(selectedDate).toLocaleDateString()})
                            </h2>
                            <div className="bg-gym-gray rounded-3xl p-6 border border-white/5">
                                {reservations.length === 0 ? (
                                    <p className="text-gray-500 text-center text-sm">No hay reservas para este día. ¡Sé el primero!</p>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="space-y-3">
                                            {reservations.map((res) => {
                                                // @ts-ignore
                                                const isMyReservation = session?.user?.unitNumber && res.unit?.number === session.user.unitNumber;

                                                return (
                                                    <div key={res._id} className={`bg-black/20 p-4 rounded-xl border flex justify-between items-center ${isMyReservation ? 'border-purple-500/30' : 'border-white/5'}`}>
                                                        <div>
                                                            <div className="flex gap-2 mb-1">
                                                                {res.resources.map((r: string) => (
                                                                    <span key={r} className={clsx(
                                                                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                                                                        r === 'SUM' ? "bg-purple-500/20 text-purple-400" : "bg-orange-500/20 text-orange-400"
                                                                    )}>
                                                                        {r}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <p className="text-white font-bold text-sm">
                                                                {res.startTime} - {res.endTime}
                                                            </p>
                                                        </div>
                                                        <div className="text-right flex items-center gap-4">
                                                            <div>
                                                                <p className="text-xs text-gray-400">Unidad</p>
                                                                <p className="text-sm font-bold text-white">{res.unit?.number || '?'}</p>
                                                            </div>
                                                            {isMyReservation && (
                                                                <button
                                                                    onClick={async () => {
                                                                        if (confirm('¿Cancelar esta reserva?')) {
                                                                            await cancelReservation(res._id);
                                                                            loadData();
                                                                        }
                                                                    }}
                                                                    className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                                                    title="Cancelar Reserva"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                )}
                                    </div>
                        </div>
                    </section>

                    {/* Booking Form Column */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wide flex items-center gap-2">
                            <Check className="text-green-500" size={20} />
                            2. Nueva Reserva
                        </h2>
                        <div className="bg-gym-gray rounded-3xl p-6 border border-white/5 sticky top-6">
                            <form onSubmit={handleBook} className="space-y-6">
                                {/* Resources */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Recursos</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => toggleResource('SUM')}
                                            className={clsx(
                                                "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                                selectedResources.includes('SUM')
                                                    ? "bg-purple-500/20 border-purple-500 text-purple-400"
                                                    : "bg-black/20 border-white/10 text-gray-400 hover:bg-white/5"
                                            )}
                                        >
                                            <Home size={24} />
                                            <span className="font-bold text-sm">SUM</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleResource('Parrilla')}
                                            className={clsx(
                                                "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                                selectedResources.includes('Parrilla')
                                                    ? "bg-orange-500/20 border-orange-500 text-orange-400"
                                                    : "bg-black/20 border-white/10 text-gray-400 hover:bg-white/5"
                                            )}
                                        >
                                            <Flame size={24} />
                                            <span className="font-bold text-sm">Parrilla</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Desde</label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Hasta</label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {bookingStatus && bookingStatus.includes('Error') && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
                                        {bookingStatus}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isBooking || selectedResources.length === 0}
                                    className="w-full bg-white text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-wide"
                                >
                                    {isBooking ? 'Procesando...' : 'Confirmar Reserva'}
                                </button>
                            </form>
                        </div>
                    </section>
                </div>

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-gym-gray rounded-3xl p-8 max-w-sm w-full border border-white/10 shadow-2xl relative text-center">
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white"
                            >
                                <X size={24} />
                            </button>

                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-black shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                <Check size={40} strokeWidth={4} />
                            </div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">¡Reserva Exitosa!</h3>
                            <p className="text-gray-400 text-sm mb-6">
                                Tu reserva ha sido registrada correctamente.
                            </p>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
