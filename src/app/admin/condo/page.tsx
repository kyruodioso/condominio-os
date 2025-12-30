import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Users, Home, Megaphone, Hammer, Package, ArrowLeft, Truck } from 'lucide-react';
import Link from 'next/link';

export default async function CondoAdminDashboard() {
    const session = await auth();

    if (session?.user?.role !== 'ADMIN') {
        redirect('/login');
    }

    const { getCondominiumName } = await import('@/actions/condominiums');
    const condoName = session?.user?.condominiumId 
        ? await getCondominiumName(session.user.condominiumId) 
        : 'Condominio OS';

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <Link 
                    href="/admin" 
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm font-bold uppercase tracking-widest"
                >
                    <ArrowLeft size={16} /> Volver a Panel Principal
                </Link>

                <header className="mb-8">
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        {condoName}
                    </h1>
                    <p className="text-gray-400 text-sm">Panel de Administración</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gym-gray p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest">Unidades</h3>
                            <Home className="text-gym-primary" />
                        </div>
                        <p className="text-4xl font-black text-white">-</p>
                    </div>
                    <div className="bg-gym-gray p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest">Residentes</h3>
                            <Users className="text-blue-400" />
                        </div>
                        <p className="text-4xl font-black text-white">-</p>
                    </div>
                    <div className="bg-gym-gray p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest">Paquetes</h3>
                            <Package className="text-yellow-400" />
                        </div>
                        <p className="text-4xl font-black text-white">-</p>
                    </div>
                    <div className="bg-gym-gray p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest">Mantenimiento</h3>
                            <Hammer className="text-red-400" />
                        </div>
                        <p className="text-4xl font-black text-white">-</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/admin/condo/users" className="bg-gym-gray p-8 rounded-3xl border border-white/5 hover:border-white/20 transition-all group">
                        <h3 className="font-bold text-xl text-white mb-2">Gestionar Usuarios</h3>
                        <p className="text-gray-400 text-sm mb-4">Crear, editar y eliminar residentes y personal.</p>
                        <span className="text-gym-primary text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform inline-block">
                            Ir a Usuarios →
                        </span>
                    </Link>
                    <Link href="/admin/condo/announcements" className="bg-gym-gray p-8 rounded-3xl border border-white/5 hover:border-white/20 transition-all group">
                        <h3 className="font-bold text-xl text-white mb-2">Publicar Anuncios</h3>
                        <p className="text-gray-400 text-sm mb-4">Crear noticias y alertas para la cartelera.</p>
                        <span className="text-blue-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform inline-block">
                            Ir a Anuncios →
                        </span>
                    </Link>
                    <Link href="/admin/condo/providers" className="bg-gym-gray p-8 rounded-3xl border border-white/5 hover:border-white/20 transition-all group">
                        <h3 className="font-bold text-xl text-white mb-2 flex items-center gap-2">
                            <Truck className="text-green-500" size={24} />
                            Gestionar Proveedores
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">Administrar proveedores y sus productos.</p>
                        <span className="text-green-500 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform inline-block">
                            Ir a Proveedores →
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
