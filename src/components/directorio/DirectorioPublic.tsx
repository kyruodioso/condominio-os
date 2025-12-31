'use client';

import { useState, useEffect } from 'react';
import { getProviders } from '@/actions/providers';
import { Truck, Phone, Mail, MapPin, Package2, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DirectorioPublic() {
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProvider, setSelectedProvider] = useState<any>(null);

    useEffect(() => {
        loadProviders();
    }, []);

    const loadProviders = async () => {
        setLoading(true);
        const data = await getProviders();
        setProviders(data.filter((p: any) => p.isActive));
        setLoading(false);
    };

    const filteredProviders = providers.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pb-24">
            <header className="mb-8 flex items-center justify-between">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                    ← Volver
                </Link>
                <div className="text-right">
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter text-green-500">Directorio</h1>
                    <p className="text-xs text-gray-400">Proveedores y Servicios</p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto">
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar proveedor o servicio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gym-gray border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={48} className="animate-spin text-green-500" />
                    </div>
                ) : filteredProviders.length === 0 ? (
                    <div className="bg-gym-gray rounded-3xl p-12 border border-white/5 text-center">
                        <Truck size={64} className="mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-bold text-gray-400 mb-2">
                            {searchTerm ? 'No se encontraron resultados' : 'No hay proveedores disponibles'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Pronto habrá servicios disponibles'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProviders.map((provider) => (
                            <div
                                key={provider._id}
                                onClick={() => setSelectedProvider(provider)}
                                className="bg-gym-gray rounded-3xl p-6 border border-white/5 hover:border-green-500/30 transition-all cursor-pointer group"
                            >
                                {/* Provider Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                        <Truck className="text-green-500" size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white text-lg group-hover:text-green-400 transition-colors">
                                            {provider.name}
                                        </h3>
                                        {provider.description && (
                                            <p className="text-gray-400 text-xs line-clamp-1">{provider.description}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Preview */}
                                {provider.contact?.phone && (
                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                        <Phone size={14} />
                                        <span>{provider.contact.phone}</span>
                                    </div>
                                )}

                                {/* Products Count */}
                                {provider.products && provider.products.length > 0 && (
                                    <div className="flex items-center gap-2 text-green-400 text-sm mt-3 pt-3 border-t border-white/5">
                                        <Package2 size={14} />
                                        <span className="font-bold">{provider.products.length} producto(s) disponible(s)</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Provider Detail Modal */}
            {selectedProvider && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in"
                    onClick={() => setSelectedProvider(null)}
                >
                    <div 
                        className="bg-gym-gray rounded-3xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/10">
                            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center">
                                <Truck className="text-green-500" size={32} />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-black text-white mb-1">{selectedProvider.name}</h2>
                                {selectedProvider.description && (
                                    <p className="text-gray-400">{selectedProvider.description}</p>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedProvider(null)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Contact Information */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Contacto</h3>
                            <div className="space-y-2">
                                {selectedProvider.contact?.phone && (
                                    <a 
                                        href={`tel:${selectedProvider.contact.phone}`}
                                        className="flex items-center gap-3 p-3 bg-black/20 rounded-xl hover:bg-black/40 transition-colors group"
                                    >
                                        <Phone className="text-green-500 group-hover:scale-110 transition-transform" size={20} />
                                        <span className="text-white">{selectedProvider.contact.phone}</span>
                                    </a>
                                )}
                                {selectedProvider.contact?.email && (
                                    <a 
                                        href={`mailto:${selectedProvider.contact.email}`}
                                        className="flex items-center gap-3 p-3 bg-black/20 rounded-xl hover:bg-black/40 transition-colors group"
                                    >
                                        <Mail className="text-blue-500 group-hover:scale-110 transition-transform" size={20} />
                                        <span className="text-white">{selectedProvider.contact.email}</span>
                                    </a>
                                )}
                                {selectedProvider.contact?.address && (
                                    <div className="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
                                        <MapPin className="text-purple-500 mt-0.5" size={20} />
                                        <span className="text-white">{selectedProvider.contact.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Products/Services */}
                        {selectedProvider.products && selectedProvider.products.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Productos y Servicios</h3>
                                <div className="space-y-2">
                                    {selectedProvider.products
                                        .filter((p: any) => p.isActive)
                                        .map((product: any, index: number) => (
                                            <div 
                                                key={index}
                                                className="p-4 bg-black/20 rounded-xl border border-white/5"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white mb-1">{product.name}</h4>
                                                        {product.description && (
                                                            <p className="text-gray-400 text-sm">{product.description}</p>
                                                        )}
                                                    </div>
                                                    {product.price > 0 && (
                                                        <span className="text-green-400 font-bold text-lg ml-4">
                                                            ${product.price.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
