import { getCondominiums, getSuperAdminStats } from '@/actions/condominiums';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Building2, Plus, Users } from 'lucide-react';
import { CreateCondominiumModal } from '@/components/admin/CreateCondominiumModal';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default async function SuperAdminDashboard() {
    const session = await auth();

    if (session?.user?.role !== 'SUPER_ADMIN') {
        redirect('/login');
    }

    const condominiums = await getCondominiums();
    const stats = await getSuperAdminStats();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                            Super Admin
                        </h1>
                        <p className="text-gray-400 text-sm">Gestión de Condominios</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-bold">{session.user.email}</p>
                            <p className="text-xs text-gym-primary">SUPER ADMIN</p>
                        </div>
                        <LogoutButton />
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gym-gray p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest">Condominios</h3>
                            <Building2 className="text-gym-primary" />
                        </div>
                        <p className="text-4xl font-black text-white">{stats.totalCondos}</p>
                    </div>
                    <div className="bg-gym-gray p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest">Total Usuarios</h3>
                            <Users className="text-blue-400" />
                        </div>
                        <p className="text-4xl font-black text-white">{stats.totalUsers}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold uppercase tracking-wide">Lista de Condominios</h2>
                    <CreateCondominiumModal />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {condominiums.map((condo: any) => (
                        <div key={condo._id} className="bg-gym-gray p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-xl text-white mb-1">{condo.name}</h3>
                                    <p className="text-sm text-gray-400">{condo.address}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                    condo.plan === 'Enterprise' ? 'bg-purple-500/20 text-purple-400' :
                                    condo.plan === 'Pro' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-gray-500/20 text-gray-400'
                                }`}>
                                    {condo.plan}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                <span>ID: {condo._id}</span>
                            </div>
                            <div className="mt-6 flex gap-2">
                                <Link href={`/admin/super/condo/${condo._id}`} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-xl text-center text-xs font-bold uppercase tracking-widest transition-colors">
                                    Administrar
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
