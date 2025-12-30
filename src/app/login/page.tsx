'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Dumbbell } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Credenciales inválidas');
            } else {
                // Fetch session to determine redirect
                const sessionRes = await fetch('/api/auth/session');
                const session = await sessionRes.json();
                
                // Redirect based on role
                if (session?.user?.role === 'SUPER_ADMIN') {
                    router.push('/admin/super');
                } else if (session?.user?.role === 'ADMIN') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
                router.refresh();
            }
        } catch (err) {
            setError('Ocurrió un error al iniciar sesión');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="bg-gym-gray p-8 rounded-3xl border border-white/5 w-full max-w-md shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gym-primary rounded-full flex items-center justify-center mx-auto mb-4 text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]">
                        <Dumbbell size={32} />
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                        Condominio OS
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">Inicia sesión para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gym-primary transition-colors"
                            placeholder="admin@ejemplo.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gym-primary transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gym-primary text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                    >
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
}
