'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Dumbbell, Coffee, LogOut, Truck } from 'lucide-react';
import clsx from 'clsx';
import { useUserStore } from '@/store/useUserStore';

export const BottomNav = () => {
    const pathname = usePathname();
    const router = useRouter();
    const logout = useUserStore((state) => state.logout);

    const navItems = [
        { name: 'Perfil', href: '/gym', icon: User },
        { name: 'Entreno', href: '/gym/workout', icon: Dumbbell },
        { name: 'Relax', href: '/gym/relax', icon: Coffee },
        { name: 'Servicios', href: '/gym/servicios', icon: Truck },
    ];

    const handleLogout = () => {
        if (confirm('¿Terminar sesión y salir?')) {
            logout();
            router.push('/');
        }
    };

    // Don't show nav if no profile (login screen)
    // We can check this by seeing if we are on home and have no profile, 
    // but the ProfileForm is rendered on Home if !hasProfile.
    // However, the BottomNav is in layout, so it's always there.
    // Let's just show it, but maybe the logout button only makes sense if logged in.
    // For simplicity, let's just add it.

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gym-gray border-t border-gym-dark pb-6 pt-3 px-6 h-20 flex justify-around items-center z-50 shadow-lg shadow-black/50">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={clsx(
                            "flex flex-col items-center gap-1 transition-all duration-200 active:scale-95",
                            isActive ? "text-gym-primary" : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-medium uppercase tracking-wider">{item.name}</span>
                    </Link>
                );
            })}

            <button
                onClick={handleLogout}
                className="flex flex-col items-center gap-1 text-red-500/70 hover:text-red-500 transition-all duration-200 active:scale-95"
            >
                <LogOut size={26} strokeWidth={2} />
                <span className="text-[10px] font-medium uppercase tracking-wider">Salir</span>
            </button>
        </nav>
    );
};
