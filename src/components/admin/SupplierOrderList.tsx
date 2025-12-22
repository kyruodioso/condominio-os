'use client';

import { useState } from 'react';
import { markAsDelivered } from '@/actions/supplierOrderActions';
import { CheckCircle, Package } from 'lucide-react';

interface Order {
    _id: string;
    unitId: { number: string } | null;
    provider: string;
    product: string;
    quantity: number;
    status: string;
}

export default function SupplierOrderList({ initialOrders }: { initialOrders: Order[] }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // Group orders by provider
    const groupedOrders = orders.reduce((acc, order) => {
        if (!acc[order.provider]) {
            acc[order.provider] = [];
        }
        acc[order.provider].push(order);
        return acc;
    }, {} as Record<string, Order[]>);

    const handleDeliver = async (orderId: string) => {
        setLoadingId(orderId);
        const res = await markAsDelivered(orderId);
        if (res.success) {
            // Remove from list locally to feel instant
            setOrders(prev => prev.filter(o => o._id !== orderId));
        } else {
            alert('Error al marcar como entregado');
        }
        setLoadingId(null);
    };

    if (orders.length === 0) {
        return (
            <div className="bg-gym-gray rounded-3xl p-12 text-center border border-white/5 border-dashed">
                <Package size={48} className="mx-auto text-gray-700 mb-4" />
                <p className="text-gray-400 text-xl font-medium">No hay pedidos pendientes.</p>
                <p className="text-gray-600 text-sm mt-2">¡Buen trabajo! Todo entregado.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {Object.entries(groupedOrders).map(([provider, providerOrders]) => (
                <div key={provider} className="bg-gym-gray rounded-3xl overflow-hidden border border-white/5 shadow-lg">
                    <div className="bg-white/5 px-6 py-4 flex justify-between items-center border-b border-white/5">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{provider}</h2>
                        <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {providerOrders.length} pedidos
                        </span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {providerOrders.map((order) => (
                            <div key={order._id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-black/30 rounded-xl p-3 min-w-[80px] text-center border border-white/5">
                                            <span className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider">Unidad</span>
                                            <span className="text-2xl font-black text-green-500">
                                                {order.unitId?.number || '???'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-2xl font-bold text-white">
                                                {order.quantity} <span className="text-gray-600 text-lg font-normal">x</span> {order.product}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeliver(order._id)}
                                    disabled={loadingId === order._id}
                                    className="ml-4 bg-green-500/20 text-green-400 px-6 py-4 rounded-xl border border-green-500/50 font-bold text-sm uppercase tracking-wider hover:bg-green-500 hover:text-black hover:border-green-500 active:scale-95 transition-all shadow-lg shadow-green-500/10 flex items-center gap-2"
                                >
                                    {loadingId === order._id ? (
                                        <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle size={20} />
                                            Entregado
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
