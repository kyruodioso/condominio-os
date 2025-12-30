'use client';

import { useState } from 'react';
import { createOrder } from '@/actions/supplierOrderActions';
import { useRouter } from 'next/navigation';
import { Package2, Building2, Truck, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminOrderForm({ units }: { units: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        unitId: '',
        provider: 'Ivess',
        product: 'Soda',
        customProduct: '',
        quantity: 1,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (!formData.unitId) {
            setMessage('Error: Selecciona una unidad');
            setLoading(false);
            return;
        }

        const res = await createOrder({
            unitId: formData.unitId,
            provider: formData.provider,
            product: formData.product === 'Otro' ? formData.customProduct : formData.product,
            quantity: Number(formData.quantity),
        });

        if (res.success) {
            setMessage('Pedido guardado correctamente');
            // Reset only unit and quantity to allow rapid entry for same provider/product
            setFormData(prev => ({ ...prev, unitId: '', quantity: 1, customProduct: '', product: 'Soda' }));
        } else {
            setMessage('Error: ' + res.error);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Unit Select */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                    <Building2 size={14} />
                    Unidad
                </label>
                <select
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white text-lg focus:outline-none focus:border-green-500 transition-colors uppercase font-bold"
                    value={formData.unitId}
                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                >
                    <option value="" className="bg-gym-gray">Selecciona Unidad</option>
                    {units.map((u) => (
                        <option key={u._id} value={u._id} className="bg-gym-gray">{u.number}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Provider Select */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                        <Truck size={14} />
                        Proveedor
                    </label>
                    <select
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                        value={formData.provider}
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    >
                        <option value="Ivess" className="bg-gym-gray">Ivess</option>
                        <option value="Cimes" className="bg-gym-gray">Cimes</option>
                        <option value="Ayerdi" className="bg-gym-gray">Ayerdi</option>
                        <option value="Otro" className="bg-gym-gray">Otro</option>
                    </select>
                </div>

                {/* Product Select */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                        <Package2 size={14} />
                        Producto
                    </label>
                    <select
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                        value={formData.product}
                        onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    >
                        <option value="Soda" className="bg-gym-gray">Soda</option>
                        <option value="Bidón 12L" className="bg-gym-gray">Bidón 12L</option>
                        <option value="Bidón 20L" className="bg-gym-gray">Bidón 20L</option>
                        <option value="Pack Agua" className="bg-gym-gray">Pack Agua</option>
                        <option value="Otro" className="bg-gym-gray">Otro (Escribir abajo)</option>
                    </select>
                    {formData.product === 'Otro' && (
                        <input
                            type="text"
                            placeholder="Especifique el producto..."
                            required
                            className="mt-3 w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                            value={formData.customProduct}
                            onChange={(e) => setFormData({ ...formData, customProduct: e.target.value })}
                        />
                    )}
                </div>
            </div>

            {/* Quantity */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Cantidad
                </label>
                <input
                    type="number"
                    min="1"
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white text-lg font-bold focus:outline-none focus:border-green-500 transition-colors"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                    message.includes('Error') 
                        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                        : 'bg-green-500/10 border-green-500/20 text-green-400'
                }`}>
                    {message.includes('Error') ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <span className="font-medium">{message}</span>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white font-bold uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Guardando...
                    </>
                ) : (
                    <>
                        <CheckCircle size={20} />
                        Guardar Pedido
                    </>
                )}
            </button>
        </form>
    );
}
