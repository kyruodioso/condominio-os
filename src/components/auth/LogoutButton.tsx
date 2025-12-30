'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-xs font-bold uppercase tracking-widest bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded-xl"
        >
            <LogOut size={14} />
            Salir
        </button>
    );
}
