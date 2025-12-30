'use client';

import { useState } from 'react';
import { addProduct, updateProduct, deleteProduct } from '@/actions/providers';
import { X, Plus, Edit, Trash2, Package2, Loader2 } from 'lucide-react';

interface ManageProductsModalProps {
    provider: any;
    onClose: () => void;
    onUpdate: () => void;
}

export function ManageProductsModal({ provider, onClose, onUpdate }: ManageProductsModalProps) {
    const [products, setProducts] = useState(provider.products || []);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
    });

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addProduct(provider._id, formData);
            setFormData({ name: '', description: '', price: 0 });
            setShowAddForm(false);
            onUpdate();
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateProduct(provider._id, editingProduct._id, formData);
            setFormData({ name: '', description: '', price: 0 });
            setEditingProduct(null);
            onUpdate();
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId: string, productName: string) => {
        if (!confirm(`¿Eliminar el producto "${productName}"?`)) return;

        try {
            await deleteProduct(provider._id, productId);
            onUpdate();
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    };

    const startEdit = (product: any) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price || 0,
        });
        setShowAddForm(false);
    };

    const cancelEdit = () => {
        setEditingProduct(null);
        setFormData({ name: '', description: '', price: 0 });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gym-gray border border-white/10 rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                            <Package2 className="text-blue-500" size={24} /> Productos de {provider.name}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">{products.length} productos registrados</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Add Product Button */}
                {!showAddForm && !editingProduct && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="w-full bg-blue-500/10 text-blue-400 border border-blue-500/20 py-3 rounded-xl font-bold uppercase text-sm tracking-widest hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2 mb-6"
                    >
                        <Plus size={20} /> Agregar Producto
                    </button>
                )}

                {/* Add/Edit Form */}
                {(showAddForm || editingProduct) && (
                    <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct} className="bg-black/20 rounded-2xl p-4 mb-6 border border-white/5">
                        <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-widest">
                            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                    Nombre del Producto *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Ej: Soda 2.25L"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                    Precio (opcional)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                Descripción
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Descripción del producto..."
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    cancelEdit();
                                }}
                                className="flex-1 bg-white/5 text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-colors text-sm font-bold uppercase"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-bold uppercase"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" /> Guardando...
                                    </>
                                ) : (
                                    editingProduct ? 'Guardar' : 'Agregar'
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* Products List */}
                <div className="space-y-3">
                    {products.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Package2 size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No hay productos registrados</p>
                        </div>
                    ) : (
                        products.map((product: any) => (
                            <div
                                key={product._id}
                                className="bg-black/20 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="text-white font-bold">{product.name}</h4>
                                        {product.description && (
                                            <p className="text-gray-400 text-sm mt-1">{product.description}</p>
                                        )}
                                        {product.price > 0 && (
                                            <p className="text-green-400 font-mono text-sm mt-2">
                                                ${product.price.toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEdit(product)}
                                            className="bg-white/5 text-gray-300 p-2 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product._id, product.name)}
                                            className="bg-red-500/10 text-red-400 p-2 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full bg-white/5 text-white font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-white/10 transition-colors text-xs mt-6"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}
