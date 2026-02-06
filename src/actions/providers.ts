'use server';

import dbConnect from '@/lib/dbConnect';
import Provider from '@/models/Provider';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { can, PERMISSIONS, PlanType } from '@/lib/permissions';

export async function getProviders() {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        return [];
    }

    // Note: Everyone authenticated in the condo can SEE providers? 
    // Or normally just staff? The UI calls this in ProvidersManager.
    // Assuming if they have access to the dashboard section, they can fetch.

    // We can add a permission check here too if strictly required, but usually GET is looser or controlled by UI.
    // However, for consistency:
    const planType = (session.user.planType || PlanType.FREE) as PlanType;
    if (!can(session.user, PERMISSIONS.MANAGE_PROVIDERS, planType)) {
        // If they can't manage, maybe they can't even see them in the Manager?
        // But usually "Manage" implies Write access. 
        // If the user request implies STAFF in PRO cannot see them (because hidden in UI), then we might restricting GET too.
        // But let's leave GET open or restrict it?
        // User said: "Módulo Financiero... Endpoints ... return 403".
        // For Providers: "Operativa: Gestión completa...".
        // In PRO, STAFF is restricted from Providers? "Gestión completa de ... Proveedores" is for FREE.
        // In PRO, CONSORCIO_ADMIN manages it.
        // So STAFF in PRO should NOT see/manage access?
        // The UI hides the button. Let's strict it.
        if (session.user.role === 'STAFF' && planType === PlanType.PRO) {
            return []; // Or throw logic error. Let's return empty to stay safe.
        }
    }

    const providers = await Provider.find({
        condominiumId: session.user.condominiumId
    }).sort({ name: 1 }).lean();

    return providers.map((p: any) => ({
        ...p,
        _id: p._id.toString(),
        createdAt: p.createdAt.toISOString(),
    }));
}

export async function createProvider(data: {
    name: string;
    description?: string;
    contact?: {
        phone?: string;
        email?: string;
        address?: string;
    };
}) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        throw new Error('Unauthorized');
    }

    const planType = (session.user.planType || PlanType.FREE) as PlanType;
    if (!can(session.user, PERMISSIONS.MANAGE_PROVIDERS, planType)) {
        throw new Error('Unauthorized');
    }

    const newProvider = await Provider.create({
        ...data,
        condominiumId: session.user.condominiumId,
        products: [],
    });

    revalidatePath('/admin/condo/providers');
    return JSON.parse(JSON.stringify(newProvider));
}

export async function updateProvider(providerId: string, data: {
    name: string;
    description?: string;
    contact?: {
        phone?: string;
        email?: string;
        address?: string;
    };
    isActive?: boolean;
}) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        throw new Error('Unauthorized');
    }

    const planType = (session.user.planType || PlanType.FREE) as PlanType;
    if (!can(session.user, PERMISSIONS.MANAGE_PROVIDERS, planType)) {
        throw new Error('Unauthorized');
    }

    const provider = await Provider.findOne({
        _id: providerId,
        condominiumId: session.user.condominiumId
    });

    if (!provider) {
        throw new Error('Provider not found');
    }

    provider.name = data.name;
    provider.description = data.description || '';
    provider.contact = data.contact || {};
    if (data.isActive !== undefined) {
        provider.isActive = data.isActive;
    }

    await provider.save();
    revalidatePath('/admin/condo/providers');
    return JSON.parse(JSON.stringify(provider));
}

export async function deleteProvider(providerId: string) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        throw new Error('Unauthorized');
    }

    const planType = (session.user.planType || PlanType.FREE) as PlanType;
    if (!can(session.user, PERMISSIONS.MANAGE_PROVIDERS, planType)) {
        throw new Error('Unauthorized');
    }

    const result = await Provider.findOneAndDelete({
        _id: providerId,
        condominiumId: session.user.condominiumId
    });

    if (!result) {
        throw new Error('Provider not found');
    }

    revalidatePath('/admin/condo/providers');
    return { success: true };
}

// Product management within providers
export async function addProduct(providerId: string, product: {
    name: string;
    description?: string;
    price?: number;
}) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        throw new Error('Unauthorized');
    }

    const planType = (session.user.planType || PlanType.FREE) as PlanType;
    if (!can(session.user, PERMISSIONS.MANAGE_PROVIDERS, planType)) {
        throw new Error('Unauthorized');
    }

    const provider = await Provider.findOne({
        _id: providerId,
        condominiumId: session.user.condominiumId
    });

    if (!provider) {
        throw new Error('Provider not found');
    }

    provider.products.push({
        name: product.name,
        description: product.description || '',
        price: product.price || 0,
        isActive: true,
    });

    await provider.save();
    revalidatePath('/admin/condo/providers');
    return JSON.parse(JSON.stringify(provider));
}

export async function updateProduct(providerId: string, productId: string, product: {
    name: string;
    description?: string;
    price?: number;
    isActive?: boolean;
}) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        throw new Error('Unauthorized');
    }

    const planType = (session.user.planType || PlanType.FREE) as PlanType;
    if (!can(session.user, PERMISSIONS.MANAGE_PROVIDERS, planType)) {
        throw new Error('Unauthorized');
    }

    const provider = await Provider.findOne({
        _id: providerId,
        condominiumId: session.user.condominiumId
    });

    if (!provider) {
        throw new Error('Provider not found');
    }

    const prod = provider.products.id(productId);
    if (!prod) {
        throw new Error('Product not found');
    }

    prod.name = product.name;
    prod.description = product.description || '';
    prod.price = product.price || 0;
    if (product.isActive !== undefined) {
        prod.isActive = product.isActive;
    }

    await provider.save();
    revalidatePath('/admin/condo/providers');
    return JSON.parse(JSON.stringify(provider));
}

export async function deleteProduct(providerId: string, productId: string) {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        throw new Error('Unauthorized');
    }

    const planType = (session.user.planType || PlanType.FREE) as PlanType;
    if (!can(session.user, PERMISSIONS.MANAGE_PROVIDERS, planType)) {
        throw new Error('Unauthorized');
    }

    const provider = await Provider.findOne({
        _id: providerId,
        condominiumId: session.user.condominiumId
    });

    if (!provider) {
        throw new Error('Provider not found');
    }

    provider.products.pull(productId);
    await provider.save();

    revalidatePath('/admin/condo/providers');
    return JSON.parse(JSON.stringify(provider));
}
