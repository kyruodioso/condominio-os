'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function StartupAnimation() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Get user name from session or email
    const userName = session?.user?.name || session?.user?.email?.split('@')[0];

    // Don't show validation if on login page or not authenticated (and finished loading)
    const isLoginPage = pathname === '/login' || pathname?.startsWith('/login/');

    // If we are on login page, strictly don't render
    if (isLoginPage) return null;

    // If we are unauthenticated (and not loading), don't render
    if (status === 'unauthenticated') return null;

    // Optional: If you want to wait for the name to be ready before showing "User", you might wait on loading,
    // but usually we want to cover the loading screen, so we render even if loading.
    // However, if we render while loading on the LOGIN page, it would flash. 
    // But we already checked isLoginPage above.


    useEffect(() => {
        // Attempt to play sound with a slight delay to ensure DOM is ready
        const playSound = async () => {
            if (audioRef.current) {
                try {
                    audioRef.current.volume = 0.4;
                    await audioRef.current.play();
                } catch (e) {
                    console.log("Autoplay blocked/failed, waiting for interaction:", e);
                    // We add a specific listener for the first interaction to play the sound
                    const playOnInteraction = () => {
                        if (audioRef.current) {
                            audioRef.current.play().catch(err => console.error("Retry failed", err));
                            window.removeEventListener('click', playOnInteraction);
                            window.removeEventListener('keydown', playOnInteraction);
                        }
                    };
                    window.addEventListener('click', playOnInteraction);
                    window.addEventListener('keydown', playOnInteraction);
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
                        <span className="text-black font-black text-7xl select-none">
                            {userName ? userName.charAt(0).toUpperCase() : 'C'}
                        </span>
                    </div>
                    {/* Reflection/Shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-[2rem] pointer-events-none" />
                </div>

                {/* Text Animation */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] overflow-hidden">
                        <span className="block text-2xl sm:text-3xl text-gray-400 mb-2 animate-[slideUp_0.8s_ease-out_forwards]">Bienvenido,</span>
                        <span className="block text-gym-primary animate-[slideUp_0.8s_ease-out_0.2s_forwards]">
                            {userName || 'Usuario'}
                        </span>
                    </h1>

                    {/* Loading Bar / Status */}
                    <div className="flex flex-col items-center gap-2 mt-8">
                        <div className="h-1 w-48 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gym-primary w-full animate-[progress_3s_ease-in-out_forwards] origin-left" />
                        </div>
                        <p className="text-gray-400 text-xs tracking-[0.2em] uppercase font-medium animate-pulse">
                            Cargando tu panel...
                        </p>
                    </div>
                </div>
            </div>

            {/* Windows 95 Startup Sound */}
            <audio
                ref={audioRef}
                src="/sounds/win95-startup.mp3"
                preload="auto"
            />

            {/* Invisible button to capture click and play sound if needed (browsers block autoplay) */}
            <button
                onClick={() => {
                    if (audioRef.current) audioRef.current.play().catch(e => console.error(e));
                }}
                className="absolute inset-0 w-full h-full z-20 cursor-default focus:outline-none"
                aria-label="Play sound"
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
