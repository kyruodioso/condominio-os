'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { createReport } from '@/actions/reports';
import { AlertTriangle, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ReportesPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        const res = await createReport(formData);

        if (res.success) {
            setSuccess(true);
            setFormData({
                title: '',
                description: '',
                priority: 'medium'
            });
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } else {
            setError(res.error || 'Error al enviar el reporte');
        }

        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
                <Loader2 size={48} className="animate-spin text-yellow-500" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <header className="mb-8 flex items-center justify-between">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                    ← Volver
                </Link>
                <h1 className="text-2xl font-black italic uppercase tracking-tighter text-yellow-500">Reportes</h1>
            </header>

            <div className="max-w-md mx-auto">
                <div className="bg-gym-gray rounded-3xl p-8 border border-white/5 shadow-lg mb-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500">
                            <AlertTriangle size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Reportar un Problema</h2>
                        <p className="text-gray-400 text-sm mt-1">Notifica a la administración sobre incidencias</p>
                        {session.user?.email && (
                            <p className="text-gym-primary text-xs mt-2 font-bold">
                                Reportando como: {session.user.email}
                            </p>
                        )}
                    </div>

                    {success ? (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
                            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">¡Reporte Enviado!</h3>
                            <p className="text-gray-400 text-sm">El encargado ha sido notificado. Serás redirigido en breve.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block pl-2">Asunto</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Ej: Luz pasillo quemada"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:border-yellow-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block pl-2">Prioridad</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-all appearance-none"
                                >
                                    <option value="low">Baja</option>
                                    <option value="medium">Media</option>
                                    <option value="high">Alta</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block pl-2">Descripción</label>
                                <textarea
                                    name="description"
                                    placeholder="Detalla el problema..."
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:border-yellow-500 outline-none transition-all resize-none"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm font-bold justify-center animate-in fade-in">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Enviar Reporte
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
