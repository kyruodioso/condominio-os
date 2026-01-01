'use client';

import { useSession } from 'next-auth/react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { User, Lock, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';
import Link from 'next/link';
import Tooltip from '@/components/ui/Tooltip';

export default function Navbar() {
    const { data: session, status } = useSession();
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Don't show navbar on login page or if not authenticated
    if (status === 'loading' || !session || typeof window !== 'undefined' && window.location.pathname === '/login') {
        return null;
    }

    // Determine dashboard URL based on role
    const getDashboardUrl = () => {
        if (session.user.role === 'SUPER_ADMIN') return '/admin/super';
        if (session.user.role === 'ADMIN') return '/admin';
        return '/';
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 bg-gym-gray/95 backdrop-blur-md border-b border-white/10 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left side - App name/logo */}
                        <Link href={getDashboardUrl()} className="flex items-center gap-3 group cursor-pointer">
                            <div className="w-10 h-10 bg-gym-primary rounded-xl flex items-center justify-center text-black font-black text-lg shadow-[0_0_15px_rgba(204,255,0,0.3)] group-hover:scale-110 transition-transform">
                                C
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-sm font-black italic uppercase tracking-tighter text-white group-hover:text-gym-primary transition-colors">
                                    Condominio OS
                                </h1>
                                <p className="text-xs text-gray-300">
                                    {session.user.role === 'SUPER_ADMIN' && 'Super Administrador'}
                                    {session.user.role === 'ADMIN' && 'Administrador'}
                                    {session.user.role === 'OWNER' && 'Propietario'}
                                    {session.user.role === 'TENANT' && 'Inquilino'}
                                </p>
                            </div>
                        </Link>

                        {/* Desktop Right side - User info and actions */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-xl border border-white/5">
                                <div className="w-8 h-8 bg-gym-primary/20 rounded-full flex items-center justify-center">
                                    <User size={16} className="text-gym-primary" />
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white leading-tight">
                                        {session.user.email?.split('@')[0] || 'Usuario'}
                                    </p>
                                    <p className="text-xs text-gray-300 leading-tight">
                                        {session.user.email}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Home Button with Tooltip */}
                            <Tooltip content="Panel Principal">
                                <Link
                                    href={getDashboardUrl()}
                                    className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 hover:border-gym-primary/50 group"
                                >
                                    <Home size={18} className="text-gray-300 group-hover:text-gym-primary transition-colors" />
                                </Link>
                            </Tooltip>
                            
                            {/* Change Password Button with Tooltip */}
                            <Tooltip content="Cambiar Contraseña">
                                <button
                                    onClick={() => setShowChangePassword(true)}
                                    className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 hover:border-gym-primary/50 group"
                                >
                                    <Lock size={18} className="text-gray-300 group-hover:text-gym-primary transition-colors" />
                                </button>
                            </Tooltip>

                            <LogoutButton />
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-3 min-w-[44px] min-h-[44px] rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-white/10 bg-gym-gray/98 backdrop-blur-md">
                        <div className="px-4 py-4 space-y-3">
                            {/* User info */}
                            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                                <div className="w-10 h-10 bg-gym-primary/20 rounded-full flex items-center justify-center">
                                    <User size={20} className="text-gym-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white">
                                        {session.user.email?.split('@')[0] || 'Usuario'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {session.user.role === 'SUPER_ADMIN' && 'Super Administrador'}
                                        {session.user.role === 'ADMIN' && 'Administrador'}
                                        {session.user.role === 'OWNER' && 'Propietario'}
                                        {session.user.role === 'TENANT' && 'Inquilino'}
                                    </p>
                                </div>
                            </div>

                            {/* Mobile menu items */}
                            <Link
                                href={getDashboardUrl()}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Home size={18} className="text-gym-primary" />
                                <span className="text-sm font-bold text-white">Panel Principal</span>
                            </Link>

                            <button
                                onClick={() => {
                                    setShowChangePassword(true);
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Lock size={18} className="text-gym-primary" />
                                <span className="text-sm font-bold text-white">Cambiar Contraseña</span>
                            </button>

                            <div className="pt-3 border-t border-white/10">
                                <LogoutButton />
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Change Password Modal */}
            {showChangePassword && (
                <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
            )}
        </>
    );
}
