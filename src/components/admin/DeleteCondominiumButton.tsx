'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { deleteCondominium } from '@/actions/condominiums';
import { useRouter } from 'next/navigation';

interface DeleteCondominiumButtonProps {
    id: string;
    name: string;
}

export function DeleteCondominiumButton({ id, name }: DeleteCondominiumButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteCondominium(id);
            if (result.success) {
                setShowConfirm(false);
                router.refresh();
            } else {
                alert('Error al eliminar: ' + result.error);
            }
        } catch (error) {
            alert('Ocurrió un error inesperado');
        } finally {
            setIsDeleting(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-gym-gray border border-red-500/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">¿Eliminar Condominio?</h3>
                        <p className="text-gray-400 text-sm">
                            Estás a punto de eliminar <span className="text-white font-bold">"{name}"</span>.
                        </p>
                        <p className="text-red-400 text-xs mt-2 font-bold bg-red-500/10 p-2 rounded-lg">
                            ESTA ACCIÓN ES IRREVERSIBLE. SE BORRARÁN TODOS LOS DATOS (USUARIOS, RESERVAS, ETC).
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold text-sm transition-colors"
                            disabled={isDeleting}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    Eliminar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors border border-red-500/10"
            title="Eliminar Condominio"
        >
            <Trash2 size={18} />
        </button>
    );
}
