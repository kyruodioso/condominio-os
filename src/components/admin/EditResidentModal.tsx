'use client';

import { useState, useEffect } from 'react';
import { updateResident } from '@/actions/users';
import { X, Loader2, UserCog } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditResidentModalProps {
    user: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditResidentModal({ user, isOpen, onClose, onSuccess }: EditResidentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        unitNumber: '',
        role: 'OWNER' as 'OWNER' | 'TENANT'
    });
    const router = useRouter();

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.profile?.name || '',
                email: user.email || '',
                unitNumber: user.unitNumber || '',
                role: user.role || 'OWNER'
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateResident(user._id, formData);
            onSuccess();
            onClose();
            router.refresh();
        } catch (error) {
            console.error('Error updating resident:', error);
            alert('Error al actualizar el residente');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gym-gray border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                        <UserCog className="text-gym-primary" size={24} /> Editar Residente
                    </h2>
                    <button 
                        onClick={onClose}
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
                            placeholder="Ej: María González"
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
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-primary transition-colors"
                            placeholder="maria@ejemplo.com"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                Unidad
                            </label>
                            <input
                                type="text"
                                value={formData.unitNumber}
                                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-primary transition-colors"
                                placeholder="Ej: 4B"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                Rol
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'OWNER' | 'TENANT' })}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-primary transition-colors appearance-none"
                            >
                                <option value="OWNER">Propietario</option>
                                <option value="TENANT">Inquilino</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
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
                                    <Loader2 size={16} className="animate-spin" /> Guardando...
                                </>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
