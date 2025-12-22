import { getUnits } from '@/actions/units';
import AdminOrderForm from '@/components/admin/AdminOrderForm';

export default async function AdminNewOrderPage() {
    const units = await getUnits();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Carga Rápida de Pedidos</h1>
            <div className="max-w-md bg-white rounded-xl shadow-md p-6">
                <AdminOrderForm units={units} />
            </div>
        </div>
    );
}
