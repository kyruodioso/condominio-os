'use client';

import { useState } from 'react';
import { useWOD } from '@/hooks/useWOD';
import { useUserStore } from '@/store/useUserStore';
import { Dumbbell, Flame, Footprints, Timer, Gauge, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export const DailyRoutine = () => {
    const { wod, loading } = useWOD();
    const { getBMI } = useUserStore();
    const { status } = getBMI();
    const [mode, setMode] = useState<'wod' | 'treadmill'>('wod');

    // Treadmill Logic
    const getTreadmillPlan = () => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('sobrepeso') || lowerStatus.includes('obesidad')) {
            return {
                goal: 'Quema de Grasa (Zona 2)',
                time: '45-60 min',
                speed: '5.5 - 6.5 km/h',
                incline: '2 - 4%',
                distance: '4.5 - 6.0 km',
                description: 'Mantén un ritmo constante donde puedas hablar pero te falte un poco el aire. Ideal para oxidar grasas.'
            };
        } else if (lowerStatus.includes('bajo')) {
            return {
                goal: 'Salud Cardiovascular',
                time: '15-20 min',
                speed: '4.5 - 5.5 km/h',
                incline: '0 - 1%',
                distance: '1.5 - 2.0 km',
                description: 'Caminata ligera para activar circulación sin quemar excesivas calorías necesarias para ganar peso.'
            };
        } else {
            return {
                goal: 'Mantenimiento Activo',
                time: '30-40 min',
                speed: '6.0 - 7.0 km/h',
                incline: '1 - 2%',
                distance: '3.0 - 4.5 km',
                description: 'Ritmo moderado para mantener el corazón fuerte y la resistencia base.'
            };
        }
    };

    const treadmillPlan = getTreadmillPlan();

    if (loading || !wod) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-gym-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 animate-pulse">Preparando la zona de guerra...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-500">
            {/* Header with Toggle */}
            <div className="bg-gym-gray p-2 rounded-full border border-white/5 flex relative">
                <button
                    onClick={() => setMode('wod')}
                    className={clsx(
                        "flex-1 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all relative z-10",
                        mode === 'wod' ? "text-black" : "text-gray-500 hover:text-white"
                    )}
                >
                    Fuerza / WOD
                </button>
                <button
                    onClick={() => setMode('treadmill')}
                    className={clsx(
                        "flex-1 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all relative z-10",
                        mode === 'treadmill' ? "text-black" : "text-gray-500 hover:text-white"
                    )}
                >
                    Cinta / Cardio
                </button>

                {/* Sliding Background */}
                <div
                    className={clsx(
                        "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gym-primary rounded-full transition-all duration-300",
                        mode === 'treadmill' ? "left-[calc(50%+2px)] bg-gym-secondary" : "left-1 bg-gym-primary"
                    )}
                />
            </div>

            {mode === 'wod' ? (
                <>
                    {/* WOD Content */}
                    <div className="bg-gradient-to-br from-gym-primary to-gym-secondary p-6 rounded-3xl text-black shadow-lg shadow-gym-primary/20 relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
                            <Dumbbell size={100} />
                        </div>
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">WOD</h2>
                            <span className="text-xs font-bold bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                {new Date().toLocaleDateString()}
                            </span>
                        </div>
                        <p className="font-bold opacity-80 relative z-10">NO PAIN NO GAIN</p>
                    </div>

                    {/* Cardio Section */}
                    <div className="bg-gym-gray rounded-3xl p-6 border border-white/5">
                        <div className="flex items-center gap-3 mb-4 text-gym-secondary">
                            <Flame size={24} className="animate-pulse" />
                            <h3 className="font-bold text-lg uppercase tracking-wide">Calentamiento</h3>
                        </div>
                        <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                            <p className="text-white font-medium text-lg">{wod.cardio}</p>
                        </div>
                    </div>

                    {/* Exercises Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2 text-gym-primary mb-2">
                            <Dumbbell size={24} />
                            <h3 className="font-bold text-lg uppercase tracking-wide">Rutina Principal</h3>
                        </div>

                        {wod.exercises.map((ex, idx) => (
                            <div key={ex.id} className="bg-gym-gray rounded-3xl p-5 border border-white/5 relative overflow-hidden group hover:border-gym-primary/50 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-9xl font-black leading-none -mt-8 -mr-4 select-none pointer-events-none">
                                    {idx + 1}
                                </div>

                                <div className="relative z-10">
                                    <h4 className="text-xl font-bold text-white mb-2">{ex.name}</h4>
                                    {ex.description && (
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">{ex.description}</p>
                                    )}


                                    <div className="flex gap-3">
                                        <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                                            <span className="text-gym-primary font-bold text-lg">{ex.sets}</span>
                                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Series</span>
                                        </div>
                                        <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                                            <span className="text-gym-secondary font-bold text-lg">{ex.reps}</span>
                                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Reps</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    {/* Treadmill Plan */}
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-6 rounded-3xl text-black shadow-lg shadow-blue-500/20 relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
                            <Footprints size={120} />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-1">CINTA</h2>
                            <p className="font-bold opacity-80 uppercase tracking-widest text-xs mb-4">Plan Personalizado</p>

                            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                <p className="text-white font-bold text-lg mb-1">{treadmillPlan.goal}</p>
                                <p className="text-xs text-white/80 leading-relaxed">{treadmillPlan.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gym-gray p-5 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center">
                            <Timer className="text-blue-400 mb-2" size={32} />
                            <span className="text-3xl font-black text-white">{treadmillPlan.time.split(' ')[0]}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Minutos</span>
                        </div>
                        <div className="bg-gym-gray p-5 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center">
                            <Footprints className="text-blue-400 mb-2" size={32} />
                            <span className="text-3xl font-black text-white">{treadmillPlan.distance.split(' ')[0]}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Kilómetros</span>
                        </div>
                        <div className="bg-gym-gray p-5 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center">
                            <Gauge className="text-blue-400 mb-2" size={32} />
                            <span className="text-xl font-black text-white">{treadmillPlan.speed}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Velocidad</span>
                        </div>
                        <div className="bg-gym-gray p-5 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center">
                            <ChevronRight className="text-blue-400 mb-2 -rotate-45" size={32} />
                            <span className="text-xl font-black text-white">{treadmillPlan.incline}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Inclinación</span>
                        </div>
                    </div>

                    <div className="bg-gym-gray rounded-3xl p-6 border border-white/5">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Flame className="text-red-500" size={20} />
                            Tips para tu sesión
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-sm text-gray-400">
                                <span className="text-blue-500 font-bold">•</span>
                                Mantén la espalda recta y la mirada al frente.
                            </li>
                            <li className="flex gap-3 text-sm text-gray-400">
                                <span className="text-blue-500 font-bold">•</span>
                                No te sujetes de los pasamanos si es posible.
                            </li>
                            <li className="flex gap-3 text-sm text-gray-400">
                                <span className="text-blue-500 font-bold">•</span>
                                Hidrátate cada 10-15 minutos.
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
