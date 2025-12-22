'use server';

import dbConnect from '@/lib/dbConnect';
import SupplierOrder from '@/models/SupplierOrder';
import Reservation from '@/models/Reservation';
import MaintenanceTask from '@/models/MaintenanceTask';

export async function checkNewEvents(lastCheckISO: string) {
    await dbConnect();
    const lastCheck = new Date(lastCheckISO);

    try {
        const newOrders = await SupplierOrder.find({
            createdAt: { $gt: lastCheck }
        }).populate('unitId', 'number').lean();

        const newReservations = await Reservation.find({
            createdAt: { $gt: lastCheck }
        }).populate('unit', 'number').lean();

        const newTasks = await MaintenanceTask.find({
            createdAt: { $gt: lastCheck },
            priority: 'Alta' // Only notify high priority tasks maybe? Or all. Let's do all for now.
        }).lean();

        return {
            orders: newOrders.map((o: any) => ({
                type: 'order',
                message: `Nuevo pedido: ${o.quantity}x ${o.product} (${o.unitId?.number})`,
                link: '/admin/pedidos/lista'
            })),
            reservations: newReservations.map((r: any) => ({
                type: 'reservation',
                message: `Nueva reserva SUM: ${r.unit?.number} - ${new Date(r.date).toLocaleDateString()}`,
                link: '/admin/reservas'
            })),
            tasks: newTasks.map((t: any) => ({
                type: 'task',
                message: `Nueva tarea: ${t.title} (${t.priority})`,
                link: '/admin/tareas'
            }))
        };
    } catch (error) {
        console.error(error);
        return { orders: [], reservations: [], tasks: [] };
    }
}
