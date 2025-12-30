'use client';

import { useState } from 'react';
import { createCondominium } from '@/actions/condominiums';
import { Plus, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateCondominiumModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        plan: 'Free'
    });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await createCondominium(formData);
            
            if (result.success) {
                setIsOpen(false);
                setFormData({ name: '', address: '', plan: 'Free' });
                router.refresh();
            } else {
                console.error('Error creating condominium:', result.error);
                alert('Error al crear el condominio: ' + result.error);
            }
        } catch (error) {
            console.error('Error creating condominium:', error);
            alert('Error al crear el condominio');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="bg-gym-primary text-black px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
            >
                <Plus size={16} /> Nuevo Condominio
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gym-gray border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide">Nuevo Condominio</h2>
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
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-primary transition-colors"
                                    placeholder="Ej: Edificio Central"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-primary transition-colors"
                                    placeholder="Ej: Av. Principal 123"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                    Plan
                                </label>
                                <select
                                    value={formData.plan}
                                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-primary transition-colors appearance-none"
                                >
                                    <option value="Free">Free</option>
                                    <option value="Pro">Pro</option>
                                    <option value="Enterprise">Enterprise</option>
                                </select>
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
                                    className="flex-1 bg-gym-primary text-black font-bold uppercase tracking-widest py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" /> Creando...
                                        </>
                                    ) : (
                                        'Crear'
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
