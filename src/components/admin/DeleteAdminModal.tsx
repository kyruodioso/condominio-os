'use client';

import { useState } from 'react';
import { deleteCondoAdmin } from '@/actions/users';
import { Trash2, X, Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeleteAdminModalProps {
    admin: {
        _id: string;
        email: string;
        profile: {
            name: string;
        };
    };
}

export function DeleteAdminModal({ admin }: DeleteAdminModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteCondoAdmin(admin._id);
            setIsOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error('Error deleting admin:', error);
            alert(error?.message || 'Error al eliminar el administrador');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="bg-red-500/10 text-red-400 p-2 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-all"
                title="Eliminar administrador"
            >
                <Trash2 size={16} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gym-gray border border-red-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                <AlertTriangle className="text-red-400" size={24} /> Confirmar Eliminación
                            </h2>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                                <p className="text-red-400 text-sm mb-2">
                                    ¿Estás seguro de que deseas eliminar este administrador?
                                </p>
                                <div className="text-white">
                                    <p className="font-bold">{admin.profile?.name}</p>
                                    <p className="text-gray-400 text-sm">{admin.email}</p>
                                </div>
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl">
                                <p className="text-yellow-400 text-xs text-center">
                                    ⚠️ Esta acción no se puede deshacer
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
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="flex-1 bg-red-500 text-white font-bold uppercase tracking-widest py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" /> Eliminando...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={16} /> Eliminar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
