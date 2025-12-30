import { getActiveAnnouncements } from '@/actions/announcements';
import { getLocalIp } from '@/utils/getLocalIp';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Dumbbell, Package, Info, AlertTriangle, QrCode, Hammer, Truck } from 'lucide-react';
import QRCode from 'react-qr-code';
import { AnnouncementCarousel } from '@/components/dashboard/AnnouncementCarousel';
import { MaintenanceList } from '@/components/maintenance/MaintenanceList';
import { LogoutButton } from '@/components/auth/LogoutButton';

export const dynamic = 'force-dynamic'; // Ensure IP and DB data is fresh

export default async function Dashboard() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    if (session?.user?.role === 'SUPER_ADMIN') {
        redirect('/admin/super');
    }

    if (session?.user?.role === 'ADMIN') {
        redirect('/admin/condo');
    }

    const announcements = await getActiveAnnouncements();
    const localIp = getLocalIp();
    const appUrl = `http://${localIp}:3000`;
    
    // Fetch Condo Name
    const { getCondominiumName } = await import('@/actions/condominiums');
    const condoName = session?.user?.condominiumId 
        ? await getCondominiumName(session.user.condominiumId) 
        : 'Condominio OS';

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pb-24">
            <div className="max-w-7xl mx-auto">
                {/* Header / QR Section */}
                <header className="bg-gym-gray rounded-3xl p-6 mb-8 border border-white/5 flex flex-col md:flex-row items-center justify-between shadow-lg gap-6">
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-2 text-center md:text-left">
                            {condoName}
                        </h1>
                        <p className="text-gray-400 text-sm max-w-[200px] text-center md:text-left mx-auto md:mx-0">
                            Escanea para llevar el sistema en tu móvil.
                        </p>
                        <div className="mt-2 text-[10px] font-mono text-gray-600 bg-black/30 px-2 py-1 rounded w-fit mx-auto md:mx-0">
                            {appUrl}
                        </div>
                    </div>
                    <div className="bg-white p-2 rounded-xl shrink-0 flex flex-col items-center gap-2">
                        <QRCode value={appUrl} size={80} />
                        <LogoutButton />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Announcements & Maintenance (1 Col) */}
                    <section className="space-y-8 lg:col-span-1 h-fit">
                        {/* Announcements */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="text-blue-400" size={20} />
                                <h2 className="text-lg font-bold uppercase tracking-wide">Cartelera</h2>
                            </div>

                            {announcements.length === 0 ? (
                                <div className="bg-gym-gray rounded-2xl p-6 text-center border border-white/5">
                                    <p className="text-gray-500 text-sm">No hay anuncios activos.</p>
                                </div>
                            ) : (
                                <AnnouncementCarousel announcements={announcements} />
                            )}
                        </div>

                        {/* Maintenance Widget Removed - Moved to separate module */}
                    </section>

                    {/* Right: Modules Navigation (2 Cols) */}
                    <section className="space-y-4 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                            <QrCode className="text-gym-primary" size={20} />
                            <h2 className="text-lg font-bold uppercase tracking-wide">Módulos</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Gym Card */}
                            <Link href="/gym" className="group bg-gym-gray p-8 rounded-3xl border border-white/5 hover:border-gym-primary/50 transition-all relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] -mr-4 -mt-4 group-hover:opacity-10 transition-opacity">
                                    <Dumbbell size={140} />
                                </div>
                                <div className="relative z-10 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-gym-primary text-black flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.3)] group-hover:scale-110 transition-transform mb-4">
                                        <Dumbbell size={32} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-white mb-1">Gimnasio</h3>
                                    <p className="text-sm text-gray-400">Rutinas, Música & Nutrición</p>
                                </div>
                                <div className="relative z-10 flex items-center text-gym-primary text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Ingresar <span className="ml-2">→</span>
                                </div>
                            </Link>

                            {/* Buzon Card */}
                            <Link href="/buzon" className="group bg-gym-gray p-8 rounded-3xl border border-white/5 hover:border-blue-400/50 transition-all relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] -mr-4 -mt-4 group-hover:opacity-10 transition-opacity">
                                    <Package size={140} />
                                </div>
                                <div className="relative z-10 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform mb-4">
                                        <Package size={32} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-white mb-1">Buzón</h3>
                                    <p className="text-sm text-gray-400">Consulta tu paquetería</p>
                                </div>
                                <div className="relative z-10 flex items-center text-blue-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Consultar <span className="ml-2">→</span>
                                </div>
                            </Link>

                            {/* SUM Card */}
                            <Link href="/sum" className="group bg-gym-gray p-8 rounded-3xl border border-white/5 hover:border-purple-500/50 transition-all relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] -mr-4 -mt-4 group-hover:opacity-10 transition-opacity">
                                    <QrCode size={140} />
                                </div>
                                <div className="relative z-10 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform mb-4">
                                        <QrCode size={32} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-white mb-1">SUM</h3>
                                    <p className="text-sm text-gray-400">Reserva el salón</p>
                                </div>
                                <div className="relative z-10 flex items-center text-purple-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Reservar <span className="ml-2">→</span>
                                </div>
                            </Link>

                            {/* Pedidos Card */}
                            <Link href="/pedidos" className="group bg-gym-gray p-8 rounded-3xl border border-white/5 hover:border-green-500/50 transition-all relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] -mr-4 -mt-4 group-hover:opacity-10 transition-opacity">
                                    <Truck size={140} />
                                </div>
                                <div className="relative z-10 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)] group-hover:scale-110 transition-transform mb-4">
                                        <Truck size={32} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-white mb-1">Pedidos</h3>
                                    <p className="text-sm text-gray-400">Agua, Soda y más</p>
                                </div>
                                <div className="relative z-10 flex items-center text-green-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Solicitar <span className="ml-2">→</span>
                                </div>
                            </Link>

                            {/* Maintenance Card */}
                            <Link href="/mantenimiento" className="group bg-gym-gray p-8 rounded-3xl border border-white/5 hover:border-orange-500/50 transition-all relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] -mr-4 -mt-4 group-hover:opacity-10 transition-opacity">
                                    <Hammer size={140} />
                                </div>
                                <div className="relative z-10 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:scale-110 transition-transform mb-4">
                                        <Hammer size={32} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-white mb-1">Mantenimiento</h3>
                                    <p className="text-sm text-gray-400">Estado del edificio</p>
                                </div>
                                <div className="relative z-10 flex items-center text-orange-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Ver Estado <span className="ml-2">→</span>
                                </div>
                            </Link>

                            {/* Reportes Card */}
                            <Link href="/reportes" className="group bg-gym-gray p-8 rounded-3xl border border-white/5 hover:border-yellow-500/50 transition-all relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] -mr-4 -mt-4 group-hover:opacity-10 transition-opacity">
                                    <AlertTriangle size={140} />
                                </div>
                                <div className="relative z-10 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-yellow-500 text-black flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)] group-hover:scale-110 transition-transform mb-4">
                                        <AlertTriangle size={32} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-white mb-1">Reportes</h3>
                                    <p className="text-sm text-gray-400">Reportar incidencias</p>
                                </div>
                                <div className="relative z-10 flex items-center text-yellow-500 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Reportar <span className="ml-2">→</span>
                                </div>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
