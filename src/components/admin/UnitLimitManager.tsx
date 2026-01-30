'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Save, AlertTriangle, CheckSquare, Square, Building } from 'lucide-react';
import { updateCondominiumLimit } from '@/actions/condominiums';
import { deleteUnit } from '@/actions/units';

interface Unit {
    _id: string;
    number: string;
    contactName?: string;
}

interface UnitLimitManagerProps {
    condominiumId: string;
    currentLimit: number;
    initialUnits: Unit[];
}

export function UnitLimitManager({ condominiumId, currentLimit, initialUnits }: UnitLimitManagerProps) {
    const [maxUnits, setMaxUnits] = useState(currentLimit);
    const [units, setUnits] = useState<Unit[]>(initialUnits);
    const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const currentUsage = units.length;
    const isLimitValid = maxUnits >= currentUsage;

    const handleSaveLimit = async () => {
        if (!isLimitValid) {
            alert(`No puedes reducir el límite a ${maxUnits} porque hay ${currentUsage} unidades activas. Elimina unidades primero.`);
            return;
        }

        setIsSaving(true);
        try {
            const result = await updateCondominiumLimit(condominiumId, maxUnits);
            if (result.success) {
                router.refresh();
                alert('Límite actualizado correctamente');
            } else {
                alert('Error al actualizar: ' + result.error);
            }
        } catch (e) {
            alert('Error inesperado');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleSelectUnit = (id: string) => {
        const newSelected = new Set(selectedUnits);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedUnits(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedUnits.size === units.length) {
            setSelectedUnits(new Set());
        } else {
            setSelectedUnits(new Set(units.map(u => u._id)));
        }
    };

    const handleDeleteSelected = async () => {
        if (!confirm(`¿Estás seguro de eliminar las ${selectedUnits.size} unidades seleccionadas? Esta acción no se puede deshacer.`)) return;

        setIsDeleting(true);
        try {
            // Delete sequentially to reuse existing action
            for (const id of Array.from(selectedUnits)) {
                await deleteUnit(id);
            }

            // Update local state
            const remaining = units.filter(u => !selectedUnits.has(u._id));
            setUnits(remaining);
            setSelectedUnits(new Set());
            router.refresh();

        } catch (e) {
            alert('Error al eliminar algunas unidades');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gym-gray p-6 rounded-3xl border border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
                            <Building className="text-gym-primary" size={20} /> Gestión de Unidades
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Uso Actual: <span className={currentUsage > maxUnits ? 'text-red-500 font-bold' : 'text-white font-bold'}>{currentUsage}</span> / {maxUnits}
                        </p>
                    </div>
                </div>

                <div className="flex items-end gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="flex-1">
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            Nuevo Límite
                        </label>
                        <input
                            type="number"
                            value={maxUnits}
                            onChange={(e) => setMaxUnits(parseInt(e.target.value) || 0)}
                            className="w-full bg-gym-gray border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-primary transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleSaveLimit}
                        disabled={isSaving || !isLimitValid}
                        className="bg-gym-primary text-black px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                    >
                        {isSaving ? 'Guardando...' : <><Save size={16} /> Guardar</>}
                    </button>
                </div>

                {!isLimitValid && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                        <AlertTriangle size={18} />
                        Debes eliminar {currentUsage - maxUnits} unidades antes de guardar este límite.
                    </div>
                )}
            </div>

            <div className="bg-gym-gray p-6 rounded-3xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest">Unidades Existentes</h3>
                    {selectedUnits.size > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            disabled={isDeleting}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg font-bold uppercase text-xs tracking-widest transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={16} /> Eliminar ({selectedUnits.size})
                        </button>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border border-white/5">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-white uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="p-4 w-12 text-center">
                                    <button onClick={toggleSelectAll} className="hover:text-gym-primary">
                                        {units.length > 0 && selectedUnits.size === units.length ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </button>
                                </th>
                                <th className="p-4">Unidad</th>
                                <th className="p-4">Contacto</th>
                                <th className="p-4 text-right">ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {units.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">
                                        No hay unidades registradas.
                                    </td>
                                </tr>
                            ) : (
                                units.map((unit) => (
                                    <tr key={unit._id} className={selectedUnits.has(unit._id) ? 'bg-gym-primary/5' : 'hover:bg-white/5 transition-colors'}>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => toggleSelectUnit(unit._id)}
                                                className={selectedUnits.has(unit._id) ? 'text-gym-primary' : 'text-gray-600 hover:text-gray-400'}
                                            >
                                                {selectedUnits.has(unit._id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                            </button>
                                        </td>
                                        <td className="p-4 font-bold text-white">{unit.number}</td>
                                        <td className="p-4">{unit.contactName || '-'}</td>
                                        <td className="p-4 text-right font-mono text-xs">{unit._id.slice(-6)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
