'use client';

import { useState } from 'react';
import { createServiceEvent } from '@/actions/services';
import { Plus, X, Loader2, Calendar, DollarSign, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateServiceModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        deadline: '',
        price: '0',
        providerName: '',
        requiresQuantity: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await createServiceEvent({
                title: formData.title,
                description: formData.description,
                date: new Date(formData.date),
                deadline: new Date(formData.deadline),
                price: parseFloat(formData.price),
                providerName: formData.providerName,
                requiresQuantity: formData.requiresQuantity
            });

            if (result.success) {
                setIsOpen(false);
                setFormData({
                    title: '',
                    description: '',
                    date: '',
                    deadline: '',
                    price: '0',
                    providerName: '',
                    requiresQuantity: false,
                });
                router.refresh();
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Error al crear servicio');
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
                <Plus size={16} /> Nuevo Servicio
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gym-gray border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide">Nuevo Servicio</h2>
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
                                    Título
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-primary transition-colors"
                                    placeholder="Ej: Limpieza de Vidrios"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                        Fecha del Evento
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="datetime-local"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-gym-primary transition-colors text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                        Fecha Límite (Inscripción)
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="datetime-local"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-gym-primary transition-colors text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                        Precio (Opcional)
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-gym-primary transition-colors"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                        Proveedor (Opcional)
                                    </label>
                                    <div className="relative">
                                        <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            value={formData.providerName}
                                            onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-gym-primary transition-colors"
                                            placeholder="Ej: Agua Ivess"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gym-primary transition-colors min-h-[80px]"
                                    placeholder="Detalles sobre el servicio..."
                                    required
                                />
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                <div>
                                    <span className="block text-sm font-bold text-white mb-1">¿Requiere Cantidad?</span>
                                    <p className="text-xs text-gray-400">Activar para permitir que los usuarios seleccionen cuántas unidades necesitan (Ej: bidones de agua).</p>
                                </div>
                                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input
                                        type="checkbox"
                                        name="toggle"
                                        id="toggle"
                                        checked={formData.requiresQuantity}
                                        onChange={(e) => setFormData({ ...formData, requiresQuantity: e.target.checked })}
                                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer duration-200 ease-in-out peer checked:right-0 right-6"
                                    />
                                    <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer peer-checked:bg-gym-primary"></label>
                                </div>
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
            <style jsx>{`
                .toggle-checkbox:checked {
                    right: 0;
                    border-color: #ccff00;
                }
                .toggle-checkbox {
                    right: 50%;
                    border-color: white;
                }
            `}</style>
        </>
    );
}
