'use client';

import { useUserStore } from '@/store/useUserStore';
import { Activity } from 'lucide-react';

export const BMIChart = () => {
    const { getBMI } = useUserStore();
    const { value, status, color } = getBMI();

    // Calculate percentage for gauge (15 to 40 range)
    const percentage = Math.min(Math.max(((value - 15) / (40 - 15)) * 100, 0), 100);

    return (
        <div className="bg-gym-gray rounded-3xl p-6 relative overflow-hidden shadow-lg border border-white/5">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Activity size={120} />
            </div>

            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Tu Estado Físico</h3>
            <div className="flex items-baseline gap-2 mb-1">
                <span className="text-6xl font-black text-white tracking-tighter">{value}</span>
                <span className="text-gray-500 font-bold">IMC</span>
            </div>

            <div className={`text-lg font-bold mb-6 ${color} flex items-center gap-2`}>
                <div className={`w-2 h-2 rounded-full bg-current animate-pulse`} />
                {status}
            </div>

            {/* Gauge Bar */}
            <div className="relative h-3 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                    className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-blue-500 via-gym-primary to-red-500 opacity-80"
                />
                {/* Mask to show only relevant part? No, just a full gradient bar is better context */}

                {/* Indicator */}
                <div
                    className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_15px_white] z-10 transition-all duration-1000 ease-out rounded-full"
                    style={{ left: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between text-[10px] text-gray-600 mt-2 font-mono font-bold">
                <span>15</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
            </div>
        </div>
    );
};
