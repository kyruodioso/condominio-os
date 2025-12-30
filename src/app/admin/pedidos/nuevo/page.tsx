import { getUnits } from '@/actions/units';
import AdminOrderForm from '@/components/admin/AdminOrderForm';
import { ArrowLeft, Truck } from 'lucide-react';
import Link from 'next/link';

export default async function AdminNewOrderPage() {
    const units = await getUnits();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <Link 
                    href="/admin/pedidos/lista" 
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm font-bold uppercase tracking-widest"
                >
                    <ArrowLeft size={16} /> Volver a Lista
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center">
                        <Truck className="text-green-500" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                            Nuevo Pedido
                        </h1>
                        <p className="text-gray-400 text-sm">Carga rápida de pedidos para residentes</p>
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-gym-gray rounded-3xl p-8 border border-white/5 shadow-2xl">
                    <AdminOrderForm units={units} />
                </div>
            </div>
        </div>
    );
}
