'use client';

import { useState, useEffect } from 'react';
import { getProviders, deleteProvider } from '@/actions/providers';
import { Truck, Plus, Edit, Trash2, Package2, Loader2 } from 'lucide-react';
import { CreateProviderModal } from './CreateProviderModal';
import { EditProviderModal } from './EditProviderModal';
import { ManageProductsModal } from './ManageProductsModal';

export default function ProvidersManager() {
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProvider, setSelectedProvider] = useState<any>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showProductsModal, setShowProductsModal] = useState(false);

    const loadProviders = async () => {
        setLoading(true);
        const data = await getProviders();
        setProviders(data);
        setLoading(false);
    };

    useEffect(() => {
        loadProviders();
    }, []);

    const handleDelete = async (providerId: string, providerName: string) => {
        if (!confirm(`¿Estás seguro de eliminar el proveedor "${providerName}"? Esto no se puede deshacer.`)) {
            return;
        }

        try {
            await deleteProvider(providerId);
            loadProviders();
        } catch (error: any) {
            alert('Error al eliminar: ' + error.message);
        }
    };

    const handleEditClick = (provider: any) => {
        setSelectedProvider(provider);
        setShowEditModal(true);
    };

    const handleManageProducts = (provider: any) => {
        setSelectedProvider(provider);
        setShowProductsModal(true);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">
                        Gestión de Proveedores
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Administra los proveedores y sus productos para facilitar los pedidos
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                >
                    <Plus size={20} /> Nuevo Proveedor
                </button>
            </div>

            {/* Providers Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={48} className="animate-spin text-green-500" />
                </div>
            ) : providers.length === 0 ? (
                <div className="bg-gym-gray rounded-3xl p-12 border border-white/5 text-center">
                    <Truck size={64} className="mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No hay proveedores registrados</h3>
                    <p className="text-gray-500 mb-6">Comienza creando tu primer proveedor</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-widest inline-flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Plus size={20} /> Crear Proveedor
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {providers.map((provider) => (
                        <div
                            key={provider._id}
                            className="bg-gym-gray rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-all"
                        >
                            {/* Provider Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                                        <Truck className="text-green-500" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{provider.name}</h3>
                                        {provider.description && (
                                            <p className="text-gray-400 text-sm">{provider.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            {(provider.contact?.phone || provider.contact?.email) && (
                                <div className="mb-4 space-y-1">
                                    {provider.contact.phone && (
                                        <p className="text-gray-400 text-sm">📞 {provider.contact.phone}</p>
                                    )}
                                    {provider.contact.email && (
                                        <p className="text-gray-400 text-sm">📧 {provider.contact.email}</p>
                                    )}
                                </div>
                            )}

                            {/* Products Count */}
                            <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm">
                                <Package2 size={16} />
                                <span>{provider.products?.length || 0} productos</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleManageProducts(provider)}
                                    className="flex-1 bg-blue-500/10 text-blue-400 py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Package2 size={16} /> Productos
                                </button>
                                <button
                                    onClick={() => handleEditClick(provider)}
                                    className="bg-white/5 text-gray-300 p-2 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(provider._id, provider.name)}
                                    className="bg-red-500/10 text-red-400 p-2 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateProviderModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        loadProviders();
                    }}
                />
            )}

            {showEditModal && selectedProvider && (
                <EditProviderModal
                    provider={selectedProvider}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedProvider(null);
                    }}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setSelectedProvider(null);
                        loadProviders();
                    }}
                />
            )}

            {showProductsModal && selectedProvider && (
                <ManageProductsModal
                    provider={selectedProvider}
                    onClose={() => {
                        setShowProductsModal(false);
                        setSelectedProvider(null);
                    }}
                    onUpdate={loadProviders}
                />
            )}
        </div>
    );
}
