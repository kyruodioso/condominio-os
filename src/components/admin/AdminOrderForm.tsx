'use client';

import { useState } from 'react';
import { createOrder } from '@/actions/supplierOrderActions';
import { useRouter } from 'next/navigation';

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
            // No PIN needed for admin
        });

        if (res.success) {
            setMessage('Pedido guardado.');
            // Reset only unit and quantity to allow rapid entry for same provider/product
            setFormData(prev => ({ ...prev, unitId: '', quantity: 1, customProduct: '', product: 'Soda' }));
        } else {
            setMessage('Error: ' + res.error);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Unit Select */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Unidad</label>
                <select
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-3 border"
                    value={formData.unitId}
                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                >
                    <option value="">Selecciona Unidad</option>
                    {units.map((u) => (
                        <option key={u._id} value={u._id}>{u.number}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Provider Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Proveedor</label>
                    <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        value={formData.provider}
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    >
                        <option value="Ivess">Ivess</option>
                        <option value="Cimes">Cimes</option>
                        <option value="Ayerdi">Ayerdi</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>

                {/* Product Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Producto</label>
                    <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        value={formData.product}
                        onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    >
                        <option value="Soda">Soda</option>
                        <option value="Bidón 12L">Bidón 12L</option>
                        <option value="Bidón 20L">Bidón 20L</option>
                        <option value="Pack Agua">Pack Agua</option>
                        <option value="Otro">Otro (Escribir abajo)</option>
                    </select>
                    {formData.product === 'Otro' && (
                        <input
                            type="text"
                            placeholder="Especifique..."
                            required
                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            value={formData.customProduct}
                            onChange={(e) => setFormData({ ...formData, customProduct: e.target.value })}
                        />
                    )}
                </div>
            </div>

            {/* Quantity */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                <input
                    type="number"
                    min="1"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-3 border"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
            </div>

            {message && (
                <div className={`p-2 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
            >
                {loading ? 'Guardando...' : 'Guardar Pedido'}
            </button>
        </form>
    );
}
