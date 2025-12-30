'use client';

import { useState, useEffect } from 'react';
import { getCondoUsers, deleteResident } from '@/actions/users';
import { CreateResidentModal } from '@/components/admin/CreateResidentModal';
import { EditResidentModal } from '@/components/admin/EditResidentModal';
import { DeleteConfirmationModal } from '@/components/admin/DeleteConfirmationModal';
import { Search, Filter, Users as UsersIcon, Pencil, Trash2 } from 'lucide-react';

export default function UsersManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Edit State
    const [editingUser, setEditingUser] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Delete State
    const [deletingUser, setDeletingUser] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        const data = await getCondoUsers('');
        setUsers(data.filter((u: any) => u.role === 'OWNER' || u.role === 'TENANT'));
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDeleteClick = (user: any) => {
        setDeletingUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingUser) return;
        try {
            await deleteResident(deletingUser._id);
            loadUsers();
        } catch (error) {
            console.error('Error deleting resident:', error);
            alert('Error al eliminar el residente');
        }
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.email?.toLowerCase().includes(searchLower) ||
            user.profile?.name?.toLowerCase().includes(searchLower) ||
            user.unitNumber?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <UsersIcon className="text-blue-500" size={24} />
                        Gestión de Residentes
                    </h3>
                    <p className="text-gray-400 text-sm">Total: {users.length} usuarios</p>
                </div>
                <CreateResidentModal onSuccess={loadUsers} />
            </div>

            {/* Search Bar */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-black/20 border border-white/5 rounded-xl flex items-center px-4 py-3">
                    <Search className="text-gray-500 mr-3" size={20} />
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre, email o unidad..." 
                        className="bg-transparent text-white placeholder-gray-500 focus:outline-none w-full text-sm"
                    />
                </div>
                <button className="bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-gray-400 hover:text-white transition-colors">
                    <Filter size={20} />
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <tr>
                                <th className="p-4">Usuario</th>
                                <th className="p-4">Unidad</th>
                                <th className="p-4">Rol</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        Cargando...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        {searchTerm ? 'No se encontraron resultados' : 'No hay residentes registrados.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user: any) => (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-bold text-white">{user.profile?.name || 'Sin Nombre'}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono bg-black/30 px-2 py-1 rounded text-gym-primary font-bold">
                                                {user.unitNumber || '-'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                                user.role === 'OWNER' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                                {user.role === 'OWNER' ? 'Propietario' : 'Inquilino'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-2 text-xs text-green-400 font-bold uppercase tracking-widest">
                                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Activo
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(user)}
                                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <EditResidentModal 
                user={editingUser}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={loadUsers}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                userName={deletingUser?.profile?.name}
            />
        </div>
    );
}
