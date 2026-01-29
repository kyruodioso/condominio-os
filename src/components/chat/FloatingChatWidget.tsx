'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import useSWR from 'swr';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FloatingChatWidget() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [unitId, setUnitId] = useState<string | null>(null);

    // Obtener Unit ID del usuario actual
    useEffect(() => {
        if (session?.user) {
            // @ts-ignore
            if (session.user.unitId) {
                // @ts-ignore
                setUnitId(session.user.unitId);
            } else {
                // Fallback: buscar unidad por API si no está en sesión
                // Por ahora, si no hay unitId, no mostramos el chat
                // Podrías implementar un fetch aquí a /api/user/unit
            }
        }
    }, [session]);

    // Polling de no leídos (solo si tenemos unitId y el chat está cerrado o minimizado)
    const { data: unreadData } = useSWR(
        unitId && (!isOpen || isMinimized) ? `/api/messages/unread?unitId=${unitId}` : null,
        fetcher,
        { refreshInterval: 5000 }
    );

    const unreadCount = unreadData?.count || 0;

    if (!session?.user || !unitId) return null; // No mostrar si no hay usuario o unidad

    // No mostrar en rutas de admin para evitar duplicidad, aunque el layout debería controlar esto
    // if (window.location.pathname.startsWith('/admin')) return null; 

    const pathname = usePathname();
    const isGymPage = pathname?.startsWith('/gym');

    return (
        <>
            {/* Botón Flotante */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    setIsMinimized(false);
                }}
                className={clsx(
                    "fixed right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95",
                    isGymPage ? "bottom-24" : "bottom-6",
                    isOpen && !isMinimized ? "opacity-0 pointer-events-none scale-0" : "bg-gym-primary opacity-100 scale-100"
                )}
            >
                {isOpen && !isMinimized ? (
                    <X className="text-white" size={24} />
                ) : (
                    <MessageCircle className="text-black" size={28} />
                )}

                {/* Badge de No Leídos */}
                {unreadCount > 0 && !isOpen && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0a0a0a] animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Ventana de Chat */}
            <div
                className={clsx(
                    "fixed z-40 transition-all duration-300 ease-in-out shadow-2xl overflow-hidden border border-white/10",
                    // Desktop Styles
                    "md:bottom-24 md:right-6 md:w-[380px] md:rounded-2xl",
                    // Mobile Styles
                    "bottom-0 left-0 right-0 w-full rounded-t-2xl md:rounded-none",
                    isOpen && !isMinimized
                        ? "h-[80vh] md:h-[500px] opacity-100 translate-y-0"
                        : "h-0 opacity-0 translate-y-10 pointer-events-none"
                )}
            >
                <div className="h-full bg-[#1a1a1a] flex flex-col">
                    {/* Header Personalizado del Widget */}
                    <div className="bg-gym-primary p-3 flex justify-between items-center text-black">
                        <div className="flex items-center gap-2">
                            <MessageCircle size={20} />
                            <span className="font-bold text-sm uppercase">Administración</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsMinimized(true)}
                                className="p-1 hover:bg-black/10 rounded"
                            >
                                <Minimize2 size={16} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-black/10 rounded"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Chat Interface Reutilizado */}
                    <div className="flex-1 overflow-hidden relative">
                        {/* Pasamos un prop especial para ocultar el header interno del ChatInterface si quisiéramos, 
                            pero por ahora lo dejamos tal cual o lo ajustamos con CSS */}
                        <div className="absolute inset-0 pb-0">
                            <ChatInterface
                                unitId={unitId}
                                currentUserRole="USER"
                            // Opcional: Podrías modificar ChatInterface para aceptar un prop `hideHeader`
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
