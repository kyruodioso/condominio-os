'use client';

import { useState } from 'react';
import { createOrder, authenticateUnit, getUnitOrders, deleteOrder } from '@/actions/supplierOrderActions';
import { Truck, Lock, AlertCircle, Search, Trash2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Order {
    _id: string;
    provider: string;
    product: string;
    quantity: number;
    createdAt: string;
}

export default function ResidentOrderForm() {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUnit, setCurrentUnit] = useState<{ _id: string; number: string } | null>(null);
    const [unitInput, setUnitInput] = useState('');
    const [pin, setPin] = useState('');

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

    // Login Handler
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (!unitInput) {
            setMessage('Ingresa tu unidad');
            setLoading(false);
            return;
        }

        const res = await authenticateUnit(unitInput, pin);
        if (res.success && res.unit) {
            setCurrentUnit(res.unit);
            setIsAuthenticated(true);
            loadOrders(res.unit._id, pin);
        } else {
            setMessage(res.error || 'Credenciales inválidas');
        }
        setLoading(false);
    };

    const loadOrders = async (unitId: string, userPin: string) => {
        const orders = await getUnitOrders(unitId, userPin);
        setMyOrders(orders);
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const res = await createOrder({
            unitId: currentUnit!._id,
            pin: pin,
            provider: formData.provider,
            product: formData.product === 'Otro' ? formData.customProduct : formData.product,
            quantity: Number(formData.quantity),
        });

        if (res.success) {
            setMessage('Pedido agregado a la lista.');
            setFormData(prev => ({ ...prev, quantity: 1, customProduct: '', product: 'Soda' }));
            loadOrders(currentUnit!._id, pin);
        } else {
            setMessage('Error: ' + res.error);
        }
        setLoading(false);
    };

    const handleDelete = async (orderId: string) => {
        if (!confirm('¿Borrar este pedido?')) return;
        const res = await deleteOrder(orderId, currentUnit!._id, pin);
        if (res.success) {
            loadOrders(currentUnit!._id, pin);
        } else {
            alert(res.error);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setPin('');
        setUnitInput('');
        setCurrentUnit(null);
        setMyOrders([]);
        setMessage('');
    };

    // --- RENDER: LOGIN VIEW ---
    if (!isAuthenticated) {
        return (
            <div className="p-6">
                <header className="mb-8 flex items-center justify-between">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                        ← Volver
                    </Link>
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter text-green-500">Pedidos</h1>
                </header>

                <div className="max-w-md mx-auto">
                    <div className="bg-gym-gray rounded-3xl p-8 border border-white/5 shadow-lg mb-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                                <Truck size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-white">Hacer Pedido</h2>
                            <p className="text-gray-400 text-sm mt-1">Ingresa tu unidad y PIN</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Unidad (ej: 4B)"
                                    value={unitInput}
                                    onChange={(e) => setUnitInput(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:border-green-500 outline-none transition-all uppercase font-bold tracking-wider text-center"
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="PIN (4 dígitos)"
                                    maxLength={4}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-white placeholder:text-gray-600 focus:border-green-500 outline-none transition-all font-mono tracking-widest text-center"
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            </div>

                            {message && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm font-bold justify-center animate-in fade-in">
                                    <AlertCircle size={16} />
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !unitInput || !pin}
                                className="w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-400 transition-colors disabled:opacity-50 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Ingresar
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: DASHBOARD VIEW ---
    return (
        <div className="p-6 max-w-2xl mx-auto">
            <header className="mb-8 flex items-center justify-between">
                <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider flex items-center gap-1">
                    <ArrowLeft size={16} /> Salir
                </button>
                <div className="text-right">
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter text-green-500">Unidad {currentUnit?.number}</h1>
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
