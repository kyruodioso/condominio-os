'use server';

import dbConnect from '@/lib/dbConnect';
import Provider from '@/models/Provider';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getProviders() {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.condominiumId) {
        return [];
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

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
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

    if (!session?.user?.condominiumId || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
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

    if (!session?.user?.condominiumId || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
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

    if (!session?.user?.condominiumId || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
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

    if (!session?.user?.condominiumId || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
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

    if (!session?.user?.condominiumId || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
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
