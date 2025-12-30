'use client';

import { useSession } from 'next-auth/react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { User, Lock } from 'lucide-react';
import { useState } from 'react';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';

export default function Navbar() {
    const { data: session, status } = useSession();
    const [showChangePassword, setShowChangePassword] = useState(false);

    // Don't show navbar on login page or if not authenticated
    if (status === 'loading' || !session || typeof window !== 'undefined' && window.location.pathname === '/login') {
        return null;
    }

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 bg-gym-gray/95 backdrop-blur-md border-b border-white/10 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left side - App name/logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gym-primary rounded-xl flex items-center justify-center text-black font-black text-lg shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                                C
                            </div>
                            <div>
                                <h1 className="text-sm font-black italic uppercase tracking-tighter text-white">
                                    Condominio OS
                                </h1>
                                <p className="text-xs text-gray-400">
                                    {session.user.role === 'SUPER_ADMIN' && 'Super Administrador'}
                                    {session.user.role === 'ADMIN' && 'Administrador'}
                                    {session.user.role === 'OWNER' && 'Propietario'}
                                    {session.user.role === 'TENANT' && 'Inquilino'}
                                </p>
                            </div>
                        </div>

                        {/* Right side - User info and actions */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-3 bg-black/20 px-4 py-2 rounded-xl border border-white/5">
                                <div className="w-8 h-8 bg-gym-primary/20 rounded-full flex items-center justify-center">
                                    <User size={16} className="text-gym-primary" />
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white leading-tight">
                                        {session.user.email?.split('@')[0] || 'Usuario'}
                                    </p>
                                    <p className="text-xs text-gray-400 leading-tight">
                                        {session.user.email}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Change Password Button */}
                            <button
                                onClick={() => setShowChangePassword(true)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 hover:border-gym-primary/50 group"
                                title="Cambiar contraseña"
                            >
                                <Lock size={18} className="text-gray-400 group-hover:text-gym-primary transition-colors" />
                            </button>

                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Change Password Modal */}
            {showChangePassword && (
                <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
            )}
        </>
    );
}
