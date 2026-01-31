import { getActiveAnnouncements } from '@/actions/announcements';
import { getLocalIp } from '@/utils/getLocalIp';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Dumbbell, Package, Info, AlertTriangle, QrCode, Hammer, Truck } from 'lucide-react';
import QRCode from 'react-qr-code';
import { AnnouncementCarousel } from '@/components/dashboard/AnnouncementCarousel';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    if (session?.user?.role === 'SUPER_ADMIN') {
        redirect('/admin/super');
    }

    if (session?.user?.role === 'ADMIN') {
        redirect('/admin');
    }

    const announcements = await getActiveAnnouncements();
    const localIp = getLocalIp();
    const appUrl = `http://${localIp}:3000`;

    // Fetch Condo Name
    const { getCondominiumName } = await import('@/actions/condominiums');
    const condoName = session?.user?.condominiumId
        ? await getCondominiumName(session.user.condominiumId)
        : 'Consorcios LITE';

    return (
        <div className="min-h-screen text-white p-3 sm:p-6 pb-24 font-sans">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
                {/* Header / QR Section */}
                <header className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
                    {/* Glossy sheen effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

                    <div className="w-full sm:w-auto text-center sm:text-left relative z-10">
                        <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2 drop-shadow-sm">
                            {condoName}
                        </h1>
                        <p className="text-gray-300 text-sm max-w-[250px] mx-auto sm:mx-0 hidden sm:block font-medium">
                            Escanea para llevar el sistema en tu móvil.
                        </p>
                        <div className="mt-3 text-[10px] font-mono text-cyan-200 bg-cyan-950/30 px-3 py-1.5 rounded-full w-fit mx-auto sm:mx-0 hidden sm:block border border-cyan-500/20">
                            {appUrl}
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-2xl shrink-0 flex flex-col items-center gap-3 shadow-lg shadow-black/20">
                        <QRCode value={appUrl} size={60} className="sm:hidden" />
                        <QRCode value={appUrl} size={90} className="hidden sm:block" />
                        <div className="w-full">
                            <LogoutButton />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left: Announcements (1 Col) */}
                    <section className="space-y-6 lg:col-span-1 h-fit order-1 lg:order-1">
                        <div className="flex items-center gap-3 mb-2 px-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Info size={20} />
                            </div>
                            <h2 className="text-lg font-bold uppercase tracking-widest text-gray-200">Cartelera</h2>
                        </div>

                        {announcements.length === 0 ? (
                            <div className="glass-card rounded-3xl p-8 text-center border-dashed border-white/10">
                                <p className="text-gray-400 font-medium">No hay anuncios activos.</p>
                            </div>
                        ) : (
                            <div className="glass-card rounded-3xl p-1 overflow-hidden">
                                <AnnouncementCarousel announcements={announcements} />
                            </div>
                        )}
                    </section>

                    {/* Right: Modules Navigation (2 Cols) */}
                    <section className="space-y-6 lg:col-span-2 order-2 lg:order-2">
                        <div className="flex items-center gap-3 mb-2 px-2">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <QrCode size={20} />
                            </div>
                            <h2 className="text-lg font-bold uppercase tracking-widest text-gray-200">Módulos</h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

                            {/* Gym Card */}
                            <SpotlightCard href="/gym" className="min-h-[220px] border-gym-primary/20 bg-gym-primary/5" spotlightColor="rgba(99, 102, 241, 0.2)">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] -mr-6 -mt-6">
                                    <Dumbbell size={160} />
                                </div>
                                <div className="relative z-10 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gym-primary to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-gym-primary/25 mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Dumbbell size={28} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-white mb-1 tracking-tight">Gimnasio</h3>
                                    <p className="text-xs text-indigo-200/70 hidden sm:block font-medium">Rutinas & Nutrición</p>
                                </div>
                                <div className="relative z-10 flex items-center text-gym-primary text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Ingresar <span className="ml-2">→</span>
                                </div>
                            </SpotlightCard>

                            {/* Buzon Card */}
                            <SpotlightCard href="/buzon" className="min-h-[220px] border-blue-400/20 bg-blue-500/5" spotlightColor="rgba(96, 165, 250, 0.2)">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] -mr-6 -mt-6">
                                    <Package size={160} />
                                </div>
                                <div className="relative z-10 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Package size={28} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-white mb-1 tracking-tight">Buzón</h3>
                                    <p className="text-xs text-blue-200/70 hidden sm:block font-medium">Tus paquetes</p>
                                </div>
                                <div className="relative z-10 flex items-center text-blue-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Consultar <span className="ml-2">→</span>
                                </div>
                            </SpotlightCard>

                            {/* SUM Card */}
                            <SpotlightCard href="/sum" className="min-h-[220px] border-purple-500/20 bg-purple-500/5" spotlightColor="rgba(168, 85, 247, 0.2)">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] -mr-6 -mt-6">
                                    <QrCode size={160} />
                                </div>
                                <div className="relative z-10 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <QrCode size={28} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-white mb-1 tracking-tight">SUM</h3>
                                    <p className="text-xs text-purple-200/70 hidden sm:block font-medium">Reservas</p>
                                </div>
                                <div className="relative z-10 flex items-center text-purple-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Reservar <span className="ml-2">→</span>
                                </div>
                            </SpotlightCard>

                            {/* Pedidos Card */}
                            <SpotlightCard href="/pedidos" className="min-h-[220px] border-green-500/20 bg-green-500/5" spotlightColor="rgba(34, 197, 94, 0.2)">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] -mr-6 -mt-6">
                                    <Truck size={160} />
                                </div>
                                <div className="relative z-10 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center shadow-lg shadow-green-500/25 mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Truck size={28} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-white mb-1 tracking-tight">Pedidos</h3>
                                    <p className="text-xs text-green-200/70 hidden sm:block font-medium">Agua & Soda</p>
                                </div>
                                <div className="relative z-10 flex items-center text-green-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Solicitar <span className="ml-2">→</span>
                                </div>
                            </SpotlightCard>

                            {/* Mantenimiento Card */}
                            <SpotlightCard href="/mantenimiento" className="min-h-[220px] border-orange-500/20 bg-orange-500/5" spotlightColor="rgba(249, 115, 22, 0.2)">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] -mr-6 -mt-6">
                                    <Hammer size={160} />
                                </div>
                                <div className="relative z-10 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Hammer size={28} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-white mb-1 tracking-tight">Mante...</h3>
                                    <p className="text-xs text-orange-200/70 hidden sm:block font-medium">Estado Edificio</p>
                                </div>
                                <div className="relative z-10 flex items-center text-orange-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Ver Estado <span className="ml-2">→</span>
                                </div>
                            </SpotlightCard>

                            {/* Reportes Card */}
                            <SpotlightCard href="/reportes" className="min-h-[220px] border-yellow-500/20 bg-yellow-500/5" spotlightColor="rgba(234, 179, 8, 0.2)">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] -mr-6 -mt-6">
                                    <AlertTriangle size={160} />
                                </div>
                                <div className="relative z-10 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-white flex items-center justify-center shadow-lg shadow-yellow-500/25 mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <AlertTriangle size={28} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-white mb-1 tracking-tight">Reportes</h3>
                                    <p className="text-xs text-yellow-200/70 hidden sm:block font-medium">Incidencias</p>
                                </div>
                                <div className="relative z-10 flex items-center text-yellow-500 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Reportar <span className="ml-2">→</span>
                                </div>
                            </SpotlightCard>

                            {/* Servicios Card */}
                            <SpotlightCard href="/gym/servicios" className="min-h-[220px] border-pink-500/20 bg-pink-500/5" spotlightColor="rgba(236, 72, 153, 0.2)">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] -mr-6 -mt-6">
                                    <Truck size={160} />
                                </div>
                                <div className="relative z-10 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Truck size={28} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-white mb-1 tracking-tight">Servicios</h3>
                                    <p className="text-xs text-pink-200/70 hidden sm:block font-medium">Limpieza y más</p>
                                </div>
                                <div className="relative z-10 flex items-center text-pink-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Ver Servicios <span className="ml-2">→</span>
                                </div>
                            </SpotlightCard>

                            {/* Directorio Card */}
                            <SpotlightCard href="/directorio" className="min-h-[220px] border-cyan-500/20 bg-cyan-500/5" spotlightColor="rgba(6, 182, 212, 0.2)">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.05] -mr-6 -mt-6">
                                    <Truck size={160} />
                                </div>
                                <div className="relative z-10 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Truck size={28} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-white mb-1 tracking-tight">Directorio</h3>
                                    <p className="text-xs text-cyan-200/70 hidden sm:block font-medium">Proveedores</p>
                                </div>
                                <div className="relative z-10 flex items-center text-cyan-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Consultar <span className="ml-2">→</span>
                                </div>
                            </SpotlightCard>

                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
