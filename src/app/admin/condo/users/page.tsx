import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getCondoUsers } from '@/actions/users';
import { CreateResidentModal } from '@/components/admin/CreateResidentModal';
import { ArrowLeft, Users, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default async function CondoUsersPage() {
    const session = await auth();

    if (session?.user?.role !== 'ADMIN') {
        redirect('/login');
    }

    // Pass empty string as we handle ID in server action for ADMIN role
    const users = await getCondoUsers('');
    const residents = users.filter((u: any) => u.role === 'OWNER' || u.role === 'TENANT');

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <div className="max-w-7xl mx-auto">
                <Link href="/admin/condo" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm font-bold uppercase tracking-widest">
                    <ArrowLeft size={16} /> Volver al Panel
                </Link>

                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                            Usuarios
                        </h1>
                        <p className="text-gray-400 text-sm">Gestión de Residentes</p>
                    </div>
                    <CreateResidentModal />
                </header>

                {/* Filters / Search (Visual only for now) */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 bg-gym-gray border border-white/5 rounded-xl flex items-center px-4 py-3">
                        <Search className="text-gray-500 mr-3" size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre o unidad..." 
                            className="bg-transparent text-white placeholder-gray-500 focus:outline-none w-full text-sm"
                        />
                    </div>
                    <button className="bg-gym-gray border border-white/5 rounded-xl px-4 py-3 text-gray-400 hover:text-white transition-colors">
                        <Filter size={20} />
                    </button>
                </div>

                <div className="bg-gym-gray rounded-3xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <tr>
                                    <th className="p-6">Usuario</th>
                                    <th className="p-6">Unidad</th>
                                    <th className="p-6">Rol</th>
                                    <th className="p-6">Estado</th>
                                    <th className="p-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {residents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            No hay residentes registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    residents.map((user: any) => (
                                        <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-6">
                                                <div>
                                                    <p className="font-bold text-white">{user.profile?.name || 'Sin Nombre'}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="font-mono bg-black/30 px-2 py-1 rounded text-gym-primary">
                                                    {user.unitNumber || '-'}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                                    user.role === 'OWNER' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                    {user.role === 'OWNER' ? 'Propietario' : 'Inquilino'}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <span className="flex items-center gap-2 text-xs text-green-400 font-bold uppercase tracking-widest">
                                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Activo
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <button className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                                                    Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
