'use client';

import { useState, useEffect } from 'react';
import { getReservations, bookSum } from '@/actions/reservations';
import { Calendar as CalendarIcon, Clock, Check, X } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';

export default function SumPage() {
    const { data: session } = useSession();
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [reservations, setReservations] = useState<any[]>([]);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [bookingStatus, setBookingStatus] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    // Generate next 30 days
    const dates = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
    });

    useEffect(() => {
        // Set today as default
        setSelectedDate(new Date().toISOString().split('T')[0]);
        loadData();
    }, []);

    const loadData = async () => {
        const today = new Date().toISOString().split('T')[0];
        const future = new Date();
        future.setDate(future.getDate() + 30);

        const resData = await getReservations(today, future.toISOString().split('T')[0]);
        setReservations(resData);
    };

    const isSlotTaken = (date: string, slot: string) => {
        return reservations.some(r => r.date === date && r.timeSlot === slot);
    };

    const handleSlotClick = (slot: string) => {
        if (isSlotTaken(selectedDate, slot)) return;
        setSelectedSlot(slot);
        setShowModal(true);
        setBookingStatus('');
    };

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsBooking(true);
        setBookingStatus('Validando...');

        const res = await bookSum({
            date: selectedDate,
            timeSlot: selectedSlot
        });

        if (res.success) {
            setBookingStatus('Success');
            setTimeout(() => {
                setShowModal(false);
                loadData(); // Refresh calendar
            }, 1500);
        } else {
            setBookingStatus('Error: ' + res.error);
        }
        setIsBooking(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pb-24">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumbs */}
                <Breadcrumbs items={[
                    { label: 'SUM' }
                ]} />

                <header className="mb-8">
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                        Salón de Usos Múltiples
                    </h1>
                    <p className="text-gray-300 text-sm">
                        {/* @ts-ignore */}
                        Reservas para Unidad {session?.user?.unitNumber || '...'}
                    </p>
                </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Calendar Column */}
                <section className="lg:col-span-2">
                    <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wide flex items-center gap-2">
                        <CalendarIcon className="text-purple-500" size={20} />
                        Selecciona una Fecha
                    </h2>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
                        {dates.map((date) => {
                            const d = new Date(date);
                            const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
                            const dayNum = d.getDate();
                            const isSelected = selectedDate === date;

                            // Check occupancy for indicators
                            const lunchTaken = isSlotTaken(date, 'Almuerzo');
                            const dinnerTaken = isSlotTaken(date, 'Cena');

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

                                    {/* Dots for availability */}
                                    <div className="flex gap-1 mt-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${lunchTaken ? 'bg-red-500' : 'bg-green-500'}`} />
                                        <div className={`w-1.5 h-1.5 rounded-full ${dinnerTaken ? 'bg-red-500' : 'bg-green-500'}`} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Slots Column */}
                <section>
                    <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wide flex items-center gap-2">
                        <Clock className="text-purple-500" size={20} />
                        Turnos Disponibles
                    </h2>
                    <div className="bg-gym-gray rounded-3xl p-6 border border-white/5">
                        <p className="text-center text-gray-400 text-sm mb-6 font-medium">
                            Para el {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>

                        <div className="space-y-4">
                            {['Almuerzo', 'Cena'].map((slot) => {
                                const taken = isSlotTaken(selectedDate, slot);
                                return (
                                    <button
                                        key={slot}
                                        disabled={taken}
                                        onClick={() => handleSlotClick(slot)}
                                        className={clsx(
                                            "w-full p-4 rounded-2xl border flex items-center justify-between transition-all group",
                                            taken
                                                ? "bg-red-500/5 border-red-500/20 opacity-50 cursor-not-allowed"
                                                : "bg-black/20 border-white/10 hover:border-purple-500 hover:bg-purple-500/10"
                                        )}
                                    >
                                        <div>
                                            <h3 className={clsx("font-bold text-lg", taken ? "text-red-400" : "text-white group-hover:text-purple-400")}>
                                                {slot}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {slot === 'Almuerzo' ? '12:00 - 16:00' : '20:00 - 00:00'}
                                            </p>
                                        </div>
                                        {taken ? (
                                            <span className="text-xs font-bold bg-red-500/20 text-red-500 px-3 py-1 rounded-full uppercase">Reservado</span>
                                        ) : (
                                            <span className="text-xs font-bold bg-green-500/20 text-green-500 px-3 py-1 rounded-full uppercase group-hover:bg-green-500 group-hover:text-black transition-colors">Libre</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>

            {/* Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gym-gray rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Confirmar Reserva</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            {selectedSlot} del {new Date(selectedDate).toLocaleDateString()}
                        </p>

                        {bookingStatus === 'Success' ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black">
                                    <Check size={32} strokeWidth={4} />
                                </div>
                                <h4 className="text-xl font-bold text-white">¡Reserva Exitosa!</h4>
                                <p className="text-gray-400 text-sm mt-2">Disfruta del SUM.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleBook} className="space-y-4">
                                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 mb-4">
                                    <p className="text-sm text-purple-200">
                                        Estás reservando para la <span className="font-bold text-white">Unidad {/* @ts-ignore */}{session?.user?.unitNumber}</span>.
                                    </p>
                                </div>

                                {bookingStatus && bookingStatus.includes('Error') && (
                                    <p className="text-red-500 text-sm text-center font-bold bg-red-500/10 p-2 rounded-lg">{bookingStatus}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isBooking}
                                    className="w-full bg-purple-500 text-white font-bold py-3 rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 mt-4"
                                >
                                    {isBooking ? 'Procesando...' : 'Confirmar Reserva'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
