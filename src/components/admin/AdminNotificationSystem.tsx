'use client';

import { useState, useEffect } from 'react';
import { checkNewEvents } from '@/actions/notifications';
import { X, Bell, Truck, Calendar, Hammer, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface Notification {
    id: string;
    type: 'order' | 'reservation' | 'task';
    message: string;
    link: string;
}

export default function AdminNotificationSystem() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [lastCheck, setLastCheck] = useState<string>(new Date().toISOString());

    // Sound effect (optional, simple beep)
    const playSound = () => {
        try {
            const audio = new Audio('/notification.mp3'); // We don't have this file, but browser might block it anyway. 
            // Let's skip audio for now or use a very simple beep if requested.
        } catch (e) { }
    };

    useEffect(() => {
        const interval = setInterval(async () => {
            const now = new Date().toISOString();
            const events = await checkNewEvents(lastCheck);

            const newNotifs: Notification[] = [];

            events.orders.forEach((o: any) => newNotifs.push({ id: Math.random().toString(), ...o }));
            events.reservations.forEach((r: any) => newNotifs.push({ id: Math.random().toString(), ...r }));
            events.tasks.forEach((t: any) => newNotifs.push({ id: Math.random().toString(), ...t }));

            if (newNotifs.length > 0) {
                setNotifications(prev => [...prev, ...newNotifs]);
                setLastCheck(now);
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [lastCheck]);

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
            {notifications.map((n) => (
                <div
                    key={n.id}
                    className={clsx(
                        "pointer-events-auto bg-gray-900 border-l-4 text-white p-4 rounded-r-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-right duration-300",
                        n.type === 'order' ? "border-green-500" :
                            n.type === 'reservation' ? "border-purple-500" : "border-orange-500"
                    )}
                >
                    <div className={clsx(
                        "p-2 rounded-full shrink-0",
                        n.type === 'order' ? "bg-green-500/20 text-green-500" :
                            n.type === 'reservation' ? "bg-purple-500/20 text-purple-500" : "bg-orange-500/20 text-orange-500"
                    )}>
                        {n.type === 'order' && <Truck size={18} />}
                        {n.type === 'reservation' && <Calendar size={18} />}
                        {n.type === 'task' && <Hammer size={18} />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm uppercase tracking-wide mb-1">
                            {n.type === 'order' ? 'Nuevo Pedido' :
                                n.type === 'reservation' ? 'Nueva Reserva' : 'Mantenimiento'}
                        </h4>
                        <p className="text-sm text-gray-300 leading-tight mb-2">{n.message}</p>
                        <Link
                            href={n.link}
                            onClick={() => removeNotification(n.id)}
                            className="text-xs font-bold underline decoration-dotted hover:text-white text-gray-400 flex items-center gap-1"
                        >
                            Ver Detalles <ExternalLink size={10} />
                        </Link>
                    </div>

                    <button
                        onClick={() => removeNotification(n.id)}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}
