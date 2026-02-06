'use client';

import { useState } from 'react';
import { createCondoAdmin } from '@/actions/users';
import { Plus, X, Loader2, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateAdminModal({ condominiumId, planType = 'FREE' }: { condominiumId: string; planType?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'STAFF' as 'STAFF' | 'CONSORCIO_ADMIN',
    });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createCondoAdmin({ ...formData, condominiumId });
            setIsOpen(false);
            setFormData({ name: '', email: '', role: 'STAFF' });
            router.refresh();
        } catch (error) {
            console.error('Error creating admin:', error);
            alert('Error al crear el administrador');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
                <Plus size={16} /> Nuevo Admin
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gym-gray border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <Shield className="text-blue-400" size={24} /> Nuevo Administrador
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-400 transition-colors"
                                    placeholder="Ej: Juan Pérez"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-400 transition-colors"
                                    placeholder="admin@condominio.com"
                                    required
                                />
                            </div>

                            {planType === 'PRO' && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                        Rol Administrativo
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'STAFF' | 'CONSORCIO_ADMIN' })}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-400 transition-colors"
                                    >
                                        <option value="STAFF">Staff / Encargado</option>
                                        <option value="CONSORCIO_ADMIN">Admin. Consorcio</option>
                                    </select>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        {formData.role === 'CONSORCIO_ADMIN'
                                            ? 'Acceso total a finanzas, proveedores y gestión.'
                                            : 'Gestión operativa (Reservas, Residentes, Paquetes).'}
                                    </p>
                                </div>
                            )}

                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                                <p className="text-blue-400 text-xs text-center">
                                    Contraseña por defecto: <span className="font-mono font-bold">123456</span>
                                </p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 bg-white/5 text-white font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-white/10 transition-colors text-xs"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-blue-500 text-white font-bold uppercase tracking-widest py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" /> Creando...
                                        </>
                                    ) : (
                                        'Crear Admin'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
