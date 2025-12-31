'use client';

import { useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Simple "pop" sound
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'; // Placeholder, usaré uno real abajo

export default function NotificationListener() {
    const { data: session } = useSession();
    const [prevCount, setPrevCount] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Determinar URL de polling
    // Si es admin, polling global. Si es user, polling con unitId.
    const getUrl = () => {
        if (!session?.user) return null;
        // @ts-ignore
        const role = session.user.role;
        
        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            return '/api/messages/unread';
        } else {
            // @ts-ignore
            const unitId = session.user.unitId;
            return unitId ? `/api/messages/unread?unitId=${unitId}` : null;
        }
    };

    const { data } = useSWR(getUrl(), fetcher, { refreshInterval: 5000 });

    useEffect(() => {
        // Solicitar permiso al montar
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Init audio
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Sonido corto agradable
        audioRef.current.volume = 0.5;
    }, []);

    useEffect(() => {
        if (data && typeof data.count === 'number') {
            // Si hay más mensajes que antes
            if (data.count > prevCount) {
                // Solo notificar si no es la carga inicial (prevCount 0 -> N podría ser carga inicial, 
                // pero asumimos que si entras y hay mensajes, quieres saberlo, o quizás no.
                // Para evitar notificar al refrescar la página si ya había mensajes, podríamos guardar en sessionStorage.
                // Por simplicidad: si prevCount > 0 y sube, notificamos. O si prevCount es 0 y sube (primer mensaje).
                // El problema es la carga inicial.
                
                // Estrategia: La primera vez que cargamos data, solo actualizamos prevCount sin notificar.
                // Usamos un ref para saber si es firstLoad.
            }
        }
    }, [data]);

    // Ref para controlar first load
    const isFirstLoad = useRef(true);

    useEffect(() => {
        if (data && typeof data.count === 'number') {
            if (isFirstLoad.current) {
                setPrevCount(data.count);
                isFirstLoad.current = false;
                return;
            }

            if (data.count > prevCount) {
                // Play sound
                audioRef.current?.play().catch(e => console.log('Audio play failed', e));

                // Show notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Condominio OS', {
                        body: 'Tienes nuevos mensajes sin leer',
                        icon: '/icon.png' // Asegúrate de tener un icono o quitar esta línea
                    });
                }
                
                // También podríamos mostrar un Toast in-app aquí si tuviéramos una librería
            }
            
            setPrevCount(data.count);
        }
    }, [data, prevCount]);

    return null; // Componente lógico, no visual
}
