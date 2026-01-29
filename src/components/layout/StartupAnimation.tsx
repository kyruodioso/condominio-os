'use client';

import { useEffect, useState, useRef } from 'react';

export default function StartupAnimation() {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Check if we've already shown the intro in this session
        // Remove individual storage check if user wants it on EVERY refresh (usually annoying, so session is best)
        const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');

        if (hasSeenIntro) {
            setShouldRender(false);
            return;
        }

        // Mark as seen immediately so it doesn't loop if user navigates away
        sessionStorage.setItem('hasSeenIntro', 'true');

        // Attempt to play sound with a slight delay to ensure DOM is ready
        const playSound = async () => {
            if (audioRef.current) {
                try {
                    audioRef.current.volume = 0.4; // Not too loud
                    await audioRef.current.play();
                } catch (e) {
                    console.log("Autoplay blocked/failed:", e);
                    // Fallback: If autoplay is widely blocked, we might just skip the sound
                    // or specific interactions needed. For a "welcome" screen, we accept partial failure.
                }
            }
        };

        setTimeout(playSound, 500);

        // Sequence:
        // 0s: Mount (Opacity 100)
        // 3.5s: Start Fading Out
        // 4.5s: Unmount
        const fadeTimer = setTimeout(() => {
            setIsVisible(false);
        }, 3500);

        const removeTimer = setTimeout(() => {
            setShouldRender(false);
        }, 4500);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(removeTimer);
        };
    }, []);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
        >
            {/* Glow Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gym-primary/20 rounded-full blur-[120px] animate-pulse" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
                {/* Logo Animation */}
                <div className="relative group perspective-1000">
                    <div className="w-32 h-32 bg-gym-primary rounded-[2rem] flex items-center justify-center shadow-[0_0_60px_rgba(204,255,0,0.6)] animate-[bounce_3s_infinite]">
                        <span className="text-black font-black text-7xl select-none">C</span>
                    </div>
                    {/* Reflection/Shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-[2rem] pointer-events-none" />
                </div>

                {/* Text Animation */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] overflow-hidden">
                        <span className="inline-block animate-[slideUp_0.8s_ease-out_forwards]">Consorcios</span>
                        <span className="text-gym-primary ml-4 inline-block animate-[slideUp_0.8s_ease-out_0.2s_forwards]">LITE</span>
                    </h1>

                    {/* Loading Bar / Status */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-1 w-48 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gym-primary w-full animate-[progress_3s_ease-in-out_forwards] origin-left" />
                        </div>
                        <p className="text-gray-400 text-xs tracking-[0.2em] uppercase font-medium animate-pulse">
                            Iniciando Sistema...
                        </p>
                    </div>
                </div>
            </div>

            {/* Windows 95 Startup Sound */}
            <audio
                ref={audioRef}
                src="https://archive.org/download/Windows95StartupAndShutdownSounds/Windows%2095%20Startup.mp3"
                preload="auto"
            />

            <style jsx global>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes progress {
            0% { transform: scaleX(0); }
            100% { transform: scaleX(1); }
          }
        `}</style>
        </div>
    );
}
