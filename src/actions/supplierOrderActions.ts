'use server';

import dbConnect from '@/lib/dbConnect';
import SupplierOrder from '@/models/SupplierOrder';
import Unit from '@/models/Unit';
import { revalidatePath } from 'next/cache';

// Verify credentials helper (By Number now)
async function verifyCredentials(unitNumber: string, pin: string) {
    await dbConnect();
    const unit = await Unit.findOne({ number: unitNumber.toUpperCase().trim() });
    if (!unit) return { valid: false, error: 'Unidad no encontrada' };
    if (unit.accessPin !== pin) return { valid: false, error: 'PIN incorrecto' };
    return { valid: true, unit };
}

export async function authenticateUnit(unitNumber: string, pin: string) {
    const check = await verifyCredentials(unitNumber, pin);
    if (!check.valid) return { success: false, error: check.error };

    // Return unit info
    return {
        success: true,
        unit: {
            _id: check.unit._id.toString(),
            number: check.unit.number
        }
    };
}

export async function createOrder(data: { unitId: string; provider: string; product: string; quantity: number; pin?: string }) {
    await dbConnect();

    // If PIN is provided, verify it (Resident view)
    // Note: data.unitId is passed here. If we want to verify by ID we need a different helper or just trust the ID if we already authenticated.
    // However, for extra security in server action, we should verify ownership.
    // But `verifyCredentials` now uses Number.
    // Let's just fetch the unit by ID to verify PIN if provided.

    if (data.pin) {
        const unit = await Unit.findById(data.unitId);
        if (!unit) return { success: false, error: 'Unidad no encontrada' };
        if (unit.accessPin !== data.pin) return { success: false, error: 'PIN incorrecto' };
    }

    try {
        await SupplierOrder.create({
            unitId: data.unitId,
            provider: data.provider,
            product: data.product,
            quantity: data.quantity,
        });
        revalidatePath('/admin/pedidos/lista');
        revalidatePath('/pedidos');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function markAsDelivered(orderId: string) {
    await dbConnect();
    try {
        await SupplierOrder.findByIdAndUpdate(orderId, { status: 'Entregado' });
        revalidatePath('/admin/pedidos/lista');
        revalidatePath('/pedidos');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPendingOrders() {
    await dbConnect();
    try {
        const orders = await SupplierOrder.find({ status: 'Pendiente' })
            .populate('unitId', 'number')
            .sort({ provider: 1, createdAt: 1 })
            .lean();

        return orders.map((order: any) => ({
            ...order,
            _id: order._id.toString(),
            unitId: order.unitId ? { ...order.unitId, _id: order.unitId._id.toString() } : null,
            createdAt: order.createdAt.toISOString(),
        }));
    } catch (error: any) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

export async function getUnitOrders(unitId: string, pin: string) {
    // Verify by ID for this one since we have the ID from state
    await dbConnect();
    const unit = await Unit.findById(unitId);
    if (!unit || unit.accessPin !== pin) return [];

    try {
        const orders = await SupplierOrder.find({ unitId, status: 'Pendiente' })
            .sort({ createdAt: -1 })
            .lean();

        return orders.map((order: any) => ({
            ...order,
            _id: order._id.toString(),
            createdAt: order.createdAt.toISOString(),
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function deleteOrder(orderId: string, unitId: string, pin: string) {
    await dbConnect();
    const unit = await Unit.findById(unitId);
    if (!unit || unit.accessPin !== pin) return { success: false, error: 'Credenciales inválidas' };

    try {
        const order = await SupplierOrder.findOne({ _id: orderId, unitId });
        if (!order) return { success: false, error: 'Pedido no encontrado' };

        if (order.status !== 'Pendiente') return { success: false, error: 'No se puede eliminar un pedido ya entregado' };

        await SupplierOrder.findByIdAndDelete(orderId);
        revalidatePath('/pedidos');
        revalidatePath('/admin/pedidos/lista');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
