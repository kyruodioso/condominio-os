import { getPendingOrders } from '@/actions/supplierOrderActions';
import SupplierOrderList from '@/components/admin/SupplierOrderList';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersListPage() {
    const orders = await getPendingOrders();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pb-24">
            <header className="mb-8 flex items-center justify-between">
                <Link href="/admin" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider flex items-center gap-1">
                    <ArrowLeft size={16} /> Volver
                </Link>
                <div className="flex gap-4">
                    <Link
                        href="/admin/pedidos/nuevo"
                        className="bg-green-500 text-black px-4 py-2 rounded-xl hover:bg-green-400 font-bold transition-colors shadow-lg shadow-green-500/20 text-sm uppercase tracking-wide"
                    >
                        + Carga Rápida
                    </Link>
                </div>
            </header>

            <div className="flex items-center gap-3 mb-8">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-green-500">
                    Llegada de Proveedores
                </h1>
            </div>

            <SupplierOrderList initialOrders={orders} />
        </div>
    );
}
