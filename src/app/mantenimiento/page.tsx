'use client';

import { MaintenanceCalendar } from '@/components/maintenance/MaintenanceCalendar';
import { MaintenanceList } from '@/components/maintenance/MaintenanceList';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <header className="mb-8 flex items-center justify-between max-w-7xl mx-auto w-full">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider flex items-center gap-1">
                    <ArrowLeft size={16} /> Volver
                </Link>
                <h1 className="text-2xl font-black italic uppercase tracking-tighter text-orange-500">Mantenimiento</h1>
            </header>

            <div className="max-w-7xl mx-auto w-full">
                <div className="bg-gym-gray rounded-3xl p-8 border border-white/5 shadow-lg">
                    <div className="text-center mb-8 lg:hidden">
                        <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
                            <CalendarDays size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Calendario de Tareas</h2>
                        <p className="text-gray-400 text-sm mt-1">Consulta las tareas programadas por día.</p>
                    </div>

                    <MaintenanceCalendar />
                </div>

                <div className="mt-8">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                        Resumen de Actividad
                    </h2>
                    <div className="bg-gym-gray rounded-3xl p-8 border border-white/5 shadow-lg">
                        <MaintenanceList />
                    </div>
                </div>
            </div>
        </div>
    );
}
