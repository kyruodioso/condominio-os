'use client';

import { useState, useEffect } from 'react';
import { createOrder, getUnitOrders, deleteOrder } from '@/actions/supplierOrderActions';
import { Truck, Trash2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Order {
    _id: string;
    provider: string;
    product: string;
    quantity: number;
    createdAt: string;
}

export default function ResidentOrderForm() {
    const { data: session } = useSession();
    
    // Form State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        provider: 'Ivess',
        product: 'Soda',
        customProduct: '',
        quantity: 1,
    });

    // Data State
    const [myOrders, setMyOrders] = useState<Order[]>([]);

    // @ts-ignore
    const unitId = session?.user?.unitId;
    // @ts-ignore
    const unitNumber = session?.user?.unitNumber; // Assuming unitNumber is also in session or we can fetch it, but let's use what we have.
    // Actually, unitNumber might not be in session directly if we didn't put it there. 
    // But we can just show "Mi Unidad" if we don't have the number, or fetch it.
    // In auth.ts we saw: `user.unitNumber` is on the user object.
    
    useEffect(() => {
        if (unitId) {
            loadOrders(unitId);
        }
    }, [unitId]);

    const loadOrders = async (uid: string) => {
        const orders = await getUnitOrders(uid);
        setMyOrders(orders);
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!unitId) return;
        
        setLoading(true);
        setMessage('');

        const res = await createOrder({
            unitId: unitId,
            provider: formData.provider,
            product: formData.product === 'Otro' ? formData.customProduct : formData.product,
            quantity: Number(formData.quantity),
        });

        if (res.success) {
            setMessage('Pedido agregado a la lista.');
            setFormData(prev => ({ ...prev, quantity: 1, customProduct: '', product: 'Soda' }));
            loadOrders(unitId);
        } else {
            setMessage('Error: ' + res.error);
        }
        setLoading(false);
    };

    const handleDelete = async (orderId: string) => {
        if (!confirm('¿Borrar este pedido?')) return;
        if (!unitId) return;

        const res = await deleteOrder(orderId, unitId);
        if (res.success) {
            loadOrders(unitId);
        } else {
            alert(res.error);
        }
    };

    if (!session || !unitId) {
        return (
            <div className="p-10 text-center text-gray-500">
                <p>Cargando información de la unidad...</p>
                <p className="text-xs mt-2">Si esto tarda, asegúrate de haber iniciado sesión como residente.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <header className="mb-8 flex items-center justify-between">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider flex items-center gap-1">
                    <ArrowLeft size={16} /> Volver
                </Link>
                <div className="text-right">
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter text-green-500">
                        {/* @ts-ignore */}
                        Unidad {session.user.unitNumber || '...'}
                    </h1>
                    <p className="text-xs text-gray-400">Gestionando Pedidos</p>
                </div>
            </header>

            <div className="space-y-8">
                {/* New Order Form */}
                <div className="bg-gym-gray rounded-3xl p-6 border border-white/5">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Plus size={20} className="text-green-500" />
                        Nuevo Pedido
                    </h3>

                    <form onSubmit={handleSubmitOrder} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proveedor</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-green-500 outline-none"
                                    value={formData.provider}
                                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                >
                                    <option value="Ivess">Ivess</option>
                                    <option value="Cimes">Cimes</option>
                                    <option value="Ayerdi">Ayerdi</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cantidad</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-green-500 outline-none"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Producto</label>
                            <select
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-green-500 outline-none"
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
                                    placeholder="Especifique producto..."
                                    required
                                    className="mt-2 w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-green-500 outline-none"
                                    value={formData.customProduct}
                                    onChange={(e) => setFormData({ ...formData, customProduct: e.target.value })}
                                />
                            )}
                        </div>

                        {message && (
                            <div className={`p-3 rounded-xl text-sm font-bold text-center ${message.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-400 transition-colors disabled:opacity-50 shadow-lg shadow-green-500/20"
                        >
                            {loading ? 'Guardando...' : 'AGREGAR A LA LISTA'}
                        </button>
                    </form>
                </div>

                {/* My Orders List */}
                <div>
                    <h3 className="font-bold text-white mb-4 pl-2">Mis Pedidos Pendientes</h3>
                    {myOrders.length === 0 ? (
                        <div className="bg-gym-gray rounded-2xl p-8 text-center border border-white/5 border-dashed">
                            <p className="text-gray-500 font-medium">No tienes pedidos pendientes.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myOrders.map((order) => (
                                <div key={order._id} className="bg-gym-gray p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-green-500/30 transition-colors">
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-white">{order.quantity}</span>
                                            <span className="text-lg font-medium text-gray-300">{order.product}</span>
                                        </div>
                                        <span className="text-xs font-bold text-green-500 uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded">{order.provider}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(order._id)}
                                        className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
