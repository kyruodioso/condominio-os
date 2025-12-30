import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Condominium from '@/models/Condominium';
import { CreateAdminModal } from '@/components/admin/CreateAdminModal';
import { EditAdminModal } from '@/components/admin/EditAdminModal';
import { DeleteAdminModal } from '@/components/admin/DeleteAdminModal';
import { getCondoUsers } from '@/actions/users';
import { ArrowLeft, Building2, Users, Shield } from 'lucide-react';
import Link from 'next/link';

export default async function CondominiumDetails({ params }: { params: { id: string } }) {
    const session = await auth();

    if (session?.user?.role !== 'SUPER_ADMIN') {
        redirect('/login');
    }

    await dbConnect();
    const condominium = await Condominium.findById(params.id);
    
    if (!condominium) {
        return <div>Condominio no encontrado</div>;
    }

    const users = await getCondoUsers(params.id);
    const admins = users.filter((u: any) => u.role === 'ADMIN');

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <div className="max-w-7xl mx-auto">
                <Link href="/admin/super" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm font-bold uppercase tracking-widest">
                    <ArrowLeft size={16} /> Volver
                </Link>

                <header className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 className="text-gym-primary" size={32} />
                            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                                {condominium.name}
                            </h1>
                        </div>
                        <p className="text-gray-400 text-sm ml-11">{condominium.address}</p>
                    </div>
                    <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-1">Plan Actual</span>
                        <span className="text-gym-primary font-bold">{condominium.plan}</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Admins Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
                                <Shield className="text-blue-400" size={20} /> Administradores
                            </h2>
                            <CreateAdminModal condominiumId={params.id} />
                        </div>

                        <div className="grid gap-4">
                            {admins.length === 0 ? (
                                <div className="bg-gym-gray p-8 rounded-3xl border border-white/5 text-center">
                                    <p className="text-gray-500">No hay administradores asignados.</p>
                                </div>
                            ) : (
                                admins.map((admin: any) => (
                                    <div key={admin._id} className="bg-gym-gray p-6 rounded-3xl border border-white/5 flex justify-between items-center hover:border-white/10 transition-colors">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white">{admin.profile?.name || 'Sin Nombre'}</h3>
                                            <p className="text-sm text-gray-400">{admin.email}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                                Admin
                                            </span>
                                            <div className="flex gap-2">
                                                <EditAdminModal admin={admin} />
                                                <DeleteAdminModal admin={admin} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Stats / Info */}
                    <div className="space-y-6">
                        <div className="bg-gym-gray p-6 rounded-3xl border border-white/5">
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">Resumen</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Total Usuarios</span>
                                    <span className="font-bold text-white">{users.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Administradores</span>
                                    <span className="font-bold text-blue-400">{admins.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Residentes</span>
                                    <span className="font-bold text-gym-primary">{users.length - admins.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
