'use client';

import { useState, useEffect } from 'react';
import { getUnits, createUnit, deleteUnit } from '@/actions/units';
import { Trash2, Plus, User, Key } from 'lucide-react';
import Link from 'next/link';

export default function UnitsAdminPage() {
    const [units, setUnits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form
    const [number, setNumber] = useState('');
    const [pin, setPin] = useState('');
    const [contact, setContact] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        loadUnits();
    }, []);

    const loadUnits = async () => {
        const data = await getUnits();
        setUnits(data);
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 4) {
            setStatus('El PIN debe tener 4 dígitos');
            return;
        }

        const res = await createUnit({ number, accessPin: pin, contactName: contact });
        if (res.success) {
            setStatus('Unidad creada correctamente');
            setNumber('');
            setPin('');
            setContact('');
            loadUnits();
        } else {
            setStatus('Error: ' + res.error);
        }
        setTimeout(() => setStatus(''), 3000);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar esta unidad?')) {
            await deleteUnit(id);
            loadUnits();
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <header className="mb-8 flex items-center justify-between max-w-4xl mx-auto">
                <Link href="/buzon/admin" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                    ← Volver al Panel
                </Link>
                <h1 className="text-2xl font-black italic uppercase tracking-tighter text-gray-500">Gestión de Unidades</h1>
            </header>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create Form */}
                <section className="bg-gym-gray rounded-3xl p-6 border border-white/5 h-fit">
                    <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wide flex items-center gap-2">
                        <Plus className="text-gym-primary" size={20} />
                        Nueva Unidad
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase ml-2">Número Depto</label>
                            <input
                                type="text"
                                placeholder="Ej: 4B"
                                required
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary uppercase"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase ml-2">PIN de Acceso (4 dígitos)</label>
                            <input
                                type="text"
                                placeholder="Ej: 1234"
                                required
                                maxLength={4}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary tracking-widest font-mono"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase ml-2">Contacto (Opcional)</label>
                            <input
                                type="text"
                                placeholder="Nombre del Propietario"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary"
                            />
                        </div>
                        <button type="submit" className="w-full bg-gym-primary text-black font-bold py-3 rounded-xl hover:bg-white transition-colors">
                            Crear Unidad
                        </button>
                        {status && <p className={`text-sm text-center ${status.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{status}</p>}
                    </form>
                </section>

                {/* Units List */}
                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2">
                        <User className="text-blue-500" size={20} />
                        Unidades Registradas ({units.length})
                    </h2>

                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Cargando...</div>
                    ) : units.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                            No hay unidades registradas.
                        </div>
                    ) : (
                        <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {units.map((u) => (
                                <div key={u._id} className="bg-gym-gray p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/20 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-black text-white">{u.number}</span>
                                            <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded text-gray-400 flex items-center gap-1">
                                                <Key size={10} /> {u.accessPin}
                                            </span>
                                        </div>
                                        {u.contactName && <p className="text-sm text-gray-500">{u.contactName}</p>}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(u._id)}
                                        className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
