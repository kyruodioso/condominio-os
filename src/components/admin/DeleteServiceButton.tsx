'use client';

import { Trash2 } from 'lucide-react';
import { deleteServiceEvent } from '@/actions/services';

export default function DeleteServiceButton({ id }: { id: string }) {
    const handleDelete = async () => {
        if (confirm('¿Estás seguro de eliminar este servicio? Se borrarán todas las inscripciones.')) {
            const result = await deleteServiceEvent(id);
            if (result.success) {
                window.location.href = '/admin/servicios';
            } else {
                alert('Error al eliminar: ' + (result.error || 'Unknown error'));
            }
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-red-500/20 transition-colors flex items-center gap-2"
        >
            <Trash2 size={16} /> Eliminar
        </button>
    );
}
