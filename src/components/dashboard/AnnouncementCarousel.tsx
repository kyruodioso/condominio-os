'use client';

import { useState, useEffect } from 'react';
import { Info, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface Announcement {
    _id: string;
    title: string;
    message: string;
    type: 'Info' | 'Alerta';
    createdAt: string;
}

export const AnnouncementCarousel = ({ announcements }: { announcements: Announcement[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotate every 5 seconds if there's more than one announcement
    useEffect(() => {
        if (announcements.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % announcements.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [announcements.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
    };

    if (announcements.length === 0) {
        return (
            <div className="bg-gym-gray rounded-2xl p-8 text-center border border-white/5 flex flex-col items-center justify-center h-full min-h-[200px]">
                <Info className="text-gray-600 mb-2" size={32} />
                <p className="text-gray-500 text-sm font-medium">No hay anuncios activos.</p>
            </div>
        );
    }

    const current = announcements[currentIndex];
    const isAlert = current.type === 'Alerta';

    return (
        <div className="relative h-full min-h-[250px] group">
            <div
                className={clsx(
                    "h-full rounded-3xl p-8 border transition-all duration-500 flex flex-col justify-between relative overflow-hidden",
                    isAlert
                        ? "bg-gradient-to-br from-red-900/20 to-black border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]"
                        : "bg-gradient-to-br from-gym-gray to-black border-white/10"
                )}
            >
                {/* Background Icon */}
                <div className="absolute -right-6 -bottom-6 opacity-[0.05] rotate-12 transition-transform duration-700 transform group-hover:scale-110">
                    {isAlert ? <AlertTriangle size={180} /> : <Info size={180} />}
                </div>

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between mb-4">
                    <span className={clsx(
                        "text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-2",
                        isAlert ? "bg-red-500 text-white" : "bg-blue-500/20 text-blue-400"
                    )}>
                        {isAlert ? <AlertTriangle size={12} /> : <Info size={12} />}
                        {current.type}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                        {new Date(current.createdAt).toLocaleDateString()}
                    </span>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-black text-white mb-3 leading-tight">
                        {current.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                        {current.message}
                    </p>
                </div>

                {/* Progress Indicators */}
                {announcements.length > 1 && (
                    <div className="relative z-10 flex items-center justify-center gap-2 mt-6">
                        {announcements.map((_, idx) => (
                            <div
                                key={idx}
                                className={clsx(
                                    "h-1 rounded-full transition-all duration-300",
                                    idx === currentIndex
                                        ? (isAlert ? "w-8 bg-red-500" : "w-8 bg-blue-400")
                                        : "w-2 bg-white/20"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation Buttons (Visible on Hover) */}
            {announcements.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 backdrop-blur-sm border border-white/10"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 backdrop-blur-sm border border-white/10"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}
        </div>
    );
};
