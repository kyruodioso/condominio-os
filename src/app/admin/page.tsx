'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { addPackage } from '@/actions/packages';
import { createAnnouncement, getActiveAnnouncements, deleteAnnouncement } from '@/actions/announcements';
import { getReservations } from '@/actions/reservations';
import { getDashboardStats } from '@/actions/dashboard';
import UsersManagement from '@/components/admin/UsersManagement';
import {
    Package, Megaphone, Users, Calendar,
    Plus, Trash2, Key, User, Search, CheckCircle, AlertCircle, Hammer, Truck, AlertTriangle,
    LayoutDashboard, ClipboardList, Bell, MessageSquare, Settings
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function UnifiedAdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'buzon' | 'cartelera' | 'usuarios' | 'reservas'>('dashboard');
    const [statusMsg, setStatusMsg] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    // --- Data States ---
    const [stats, setStats] = useState({
        packagesToday: 0,
        pendingReports: 0,
        activeTasks: 0,
        totalResidents: 0
    });
    const [reservations, setReservations] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // --- Forms States ---
    // Buzon
    const [pkgUnit, setPkgUnit] = useState('');
    const [pkgName, setPkgName] = useState('');

    // Cartelera
    const [annTitle, setAnnTitle] = useState('');
    const [annMsg, setAnnMsg] = useState('');
    const [annType, setAnnType] = useState<'Info' | 'Alerta'>('Info');
    const [announcements, setAnnouncements] = useState<any[]>([]);


    // --- Effects ---
    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated' || (session && session.user?.role !== 'ADMIN')) {
            router.push('/login');
        }
    }, [status, session, router]);

    useEffect(() => {
        loadStats();
        if (activeTab === 'reservas') loadReservations();
        if (activeTab === 'cartelera') loadAnnouncements();
        setStatusMsg(null);
    }, [activeTab]);

    const showStatus = (msg: string, type: 'success' | 'error') => {
        setStatusMsg({ msg, type });
        setTimeout(() => setStatusMsg(null), 3000);
    };

    // --- Data Loaders ---
    const loadStats = async () => {
        const data = await getDashboardStats();
        setStats(data);
    };

    const loadReservations = async () => {
        setLoadingData(true);
        const today = new Date().toISOString().split('T')[0];
        const data = await getReservations(today, '2099-12-31');
        setReservations(data);
        setLoadingData(false);
    };

    const loadAnnouncements = async () => {
        const data = await getActiveAnnouncements();
        setAnnouncements(data);
    };

    // --- Handlers ---
    const handleAddPackage = async (e: React.FormEvent) => {
        e.preventDefault();
        await addPackage({ unit: pkgUnit, recipientName: pkgName });
        showStatus('Paquete registrado correctamente', 'success');
        setPkgUnit('');
        setPkgName('');
        loadStats(); // Refresh stats
    };

    const handleAddAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        await createAnnouncement({ title: annTitle, message: annMsg, type: annType, daysToLive: 7 });
        showStatus('Anuncio publicado correctamente', 'success');
        setAnnTitle('');
        setAnnMsg('');
        loadAnnouncements();
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm('¿Eliminar este anuncio?')) return;
        try {
            await deleteAnnouncement(id);
            showStatus('Anuncio eliminado', 'success');
            loadAnnouncements();
        } catch (error) {
            showStatus('Error al eliminar', 'error');
        }
    };

    // --- Render Helpers ---
    const NavButton = ({ id, icon: Icon, label, description }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={clsx(
                "flex flex-col items-start p-4 rounded-2xl transition-all w-full text-left border",
                activeTab === id
                    ? "bg-gym-primary text-black border-gym-primary shadow-lg shadow-gym-primary/20"
                    : "bg-black/20 text-gray-400 border-white/5 hover:bg-white/5 hover:border-white/10"
            )}
        >
            <div className={clsx(
                "p-2 rounded-xl mb-3",
                activeTab === id ? "bg-black/10" : "bg-white/5"
            )}>
                <Icon size={24} />
            </div>
            <span className="font-bold uppercase tracking-wide text-sm">{label}</span>
            <span className={clsx(
                "text-xs mt-1",
                activeTab === id ? "text-black/60" : "text-gray-600"
            )}>{description}</span>
        </button>
    );

    const StatCard = ({ icon: Icon, label, value, color }: any) => (
        <div className="bg-black/20 border border-white/5 p-6 rounded-3xl flex items-center gap-4 hover:border-white/10 transition-colors">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} bg-opacity-20`}>
                <Icon className={color.replace('bg-', 'text-')} size={24} />
            </div>
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black text-white">{value}</p>
            </div>
        </div>
    );

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gym-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Cargando...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated or not admin
    if (status === 'unauthenticated' || !session || session.user?.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pb-24">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gym-primary to-yellow-600 flex items-center justify-center text-black font-bold shadow-lg shadow-gym-primary/20">
                            <LayoutDashboard size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                                Panel de Control
                            </h1>
                            <p className="text-gray-500 text-sm font-medium">Bienvenido, {session.user.name || 'Administrador'}</p>
                        </div>
                    </div>

                    {statusMsg && (
                        <div className={clsx(
                            "px-4 py-3 rounded-xl flex items-center gap-3 font-bold text-sm animate-in slide-in-from-top-2 shadow-lg",
                            statusMsg.type === 'success' ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                        )}>
                            {statusMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {statusMsg.msg}
                        </div>
                    )}
                </header>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Sidebar / Navigation */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-gym-gray rounded-3xl p-4 border border-white/5 space-y-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Acciones Rápidas</p>
                            <NavButton id="dashboard" icon={LayoutDashboard} label="Resumen" description="Vista general y estadísticas" />
                            <NavButton id="buzon" icon={Package} label="Paquetería" description="Registrar entregas" />
                            <NavButton id="cartelera" icon={Megaphone} label="Cartelera" description="Publicar anuncios" />
                            <NavButton id="usuarios" icon={Users} label="Residentes" description="Gestionar usuarios" />
                            <NavButton id="reservas" icon={Calendar} label="Reservas" description="Agenda del SUM" />
                        </div>

                        <div className="bg-gym-gray rounded-3xl p-4 border border-white/5 space-y-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Gestión</p>
                            <Link href="/admin/tareas" className="flex items-center gap-3 p-4 rounded-2xl bg-black/20 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all group">
                                <Hammer size={20} className="group-hover:text-orange-500 transition-colors" />
                                <span className="font-bold text-sm">Mantenimiento</span>
                            </Link>
                            <Link href="/admin/reportes" className="flex items-center gap-3 p-4 rounded-2xl bg-black/20 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all group">
                                <AlertTriangle size={20} className="group-hover:text-yellow-500 transition-colors" />
                                <span className="font-bold text-sm">Reportes</span>
                            </Link>
                            <Link href="/admin/pedidos/lista" className="flex items-center gap-3 p-4 rounded-2xl bg-black/20 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all group">
                                <Truck size={20} className="group-hover:text-green-500 transition-colors" />
                                <span className="font-bold text-sm">Pedidos</span>
                            </Link>
                            <Link href="/admin/mensajes" className="flex items-center gap-3 p-4 rounded-2xl bg-black/20 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all group">
                                <MessageSquare size={20} className="group-hover:text-blue-500 transition-colors" />
                                <span className="font-bold text-sm">Mensajes</span>
                            </Link>
                            <Link href="/directorio" className="flex items-center gap-3 p-4 rounded-2xl bg-black/20 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all group">
                                <Truck size={20} className="group-hover:text-cyan-500 transition-colors" />
                                <span className="font-bold text-sm">Directorio</span>
                            </Link>
                            <Link href="/admin/condo/providers" className="flex items-center gap-3 p-4 rounded-2xl bg-black/20 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all group">
                                <Truck size={20} className="group-hover:text-green-500 transition-colors" />
                                <span className="font-bold text-sm">Gestionar Proveedores</span>
                            </Link>
                            <Link href="/admin/configuracion" className="flex items-center gap-3 p-4 rounded-2xl bg-black/20 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all group">
                                <Settings size={20} className="group-hover:text-purple-500 transition-colors" />
                                <span className="font-bold text-sm">Configuración</span>
                            </Link>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        {/* Stats Row - Always visible or only on dashboard? Let's keep it on dashboard for focus */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard icon={Package} label="Paquetes Hoy" value={stats.packagesToday} color="bg-blue-500" />
                                    <StatCard icon={AlertTriangle} label="Reportes Pendientes" value={stats.pendingReports} color="bg-yellow-500" />
                                    <StatCard icon={Hammer} label="Tareas Activas" value={stats.activeTasks} color="bg-orange-500" />
                                    <StatCard icon={Users} label="Residentes" value={stats.totalResidents} color="bg-purple-500" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Quick Package Entry */}
                                    <div className="bg-gym-gray rounded-3xl p-6 border border-white/5">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                                <Package size={20} />
                                            </div>
                                            <h3 className="font-bold text-lg text-white">Recepción Rápida</h3>
                                        </div>
                                        <form onSubmit={handleAddPackage} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Unidad (4B)"
                                                    required
                                                    value={pkgUnit}
                                                    onChange={(e) => setPkgUnit(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 uppercase font-bold text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Destinatario"
                                                    required
                                                    value={pkgName}
                                                    onChange={(e) => setPkgName(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 text-sm"
                                                />
                                            </div>
                                            <button type="submit" className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors text-sm">
                                                Registrar Paquete
                                            </button>
                                        </form>
                                    </div>

                                    {/* Quick Announcement */}
                                    <div className="bg-gym-gray rounded-3xl p-6 border border-white/5">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500">
                                                <Megaphone size={20} />
                                            </div>
                                            <h3 className="font-bold text-lg text-white">Anuncio Rápido</h3>
                                        </div>
                                        <Link href="#" onClick={() => setActiveTab('cartelera')} className="block w-full bg-black/20 hover:bg-black/40 border border-white/5 rounded-2xl p-4 text-center transition-all group">
                                            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-yellow-500 group-hover:scale-110 transition-transform">
                                                <Plus size={20} />
                                            </div>
                                            <p className="text-sm font-bold text-gray-400 group-hover:text-white">Crear Nuevo Anuncio</p>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- BUZON TAB --- */}
                        {activeTab === 'buzon' && (
                            <div className="bg-gym-gray rounded-3xl p-8 border border-white/5 animate-in fade-in slide-in-from-bottom-4">
                                <div className="max-w-xl mx-auto">
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                                            <Package size={32} />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white">Registrar Paquete</h2>
                                        <p className="text-gray-400">Notifica a un vecino sobre una nueva entrega.</p>
                                    </div>
                                    <form onSubmit={handleAddPackage} className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Unidad (ej: 4B)"
                                            required
                                            value={pkgUnit}
                                            onChange={(e) => setPkgUnit(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 uppercase font-bold"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Nombre Destinatario"
                                            required
                                            value={pkgName}
                                            onChange={(e) => setPkgName(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500"
                                        />
                                        <button type="submit" className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                                            Registrar Entrada
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* --- CARTELERA TAB --- */}
                        {activeTab === 'cartelera' && (
                            <div className="bg-gym-gray rounded-3xl p-8 border border-white/5 animate-in fade-in slide-in-from-bottom-4">
                                <div className="max-w-xl mx-auto">
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500">
                                            <Megaphone size={32} />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white">Nuevo Anuncio</h2>
                                        <p className="text-gray-400">Publica información visible para todo el edificio.</p>
                                    </div>
                                    <form onSubmit={handleAddAnnouncement} className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Título del Anuncio"
                                            required
                                            value={annTitle}
                                            onChange={(e) => setAnnTitle(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-yellow-500 font-bold"
                                        />
                                        <textarea
                                            placeholder="Mensaje detallado..."
                                            required
                                            value={annMsg}
                                            onChange={(e) => setAnnMsg(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-yellow-500 h-32 resize-none"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setAnnType('Info')}
                                                className={clsx(
                                                    "p-3 rounded-xl border font-bold transition-all",
                                                    annType === 'Info' ? "bg-blue-500/20 border-blue-500 text-blue-400" : "border-white/10 text-gray-500"
                                                )}
                                            >
                                                Información
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAnnType('Alerta')}
                                                className={clsx(
                                                    "p-3 rounded-xl border font-bold transition-all",
                                                    annType === 'Alerta' ? "bg-red-500/20 border-red-500 text-red-400" : "border-white/10 text-gray-500"
                                                )}
                                            >
                                                Alerta
                                            </button>
                                        </div>
                                        <button type="submit" className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20">
                                            Publicar Anuncio
                                        </button>
                                    </form>

                                    {/* Anuncios Actuales */}
                                    {announcements.length > 0 && (
                                        <div className="mt-8 pt-8 border-t border-white/10">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <Bell size={20} className="text-yellow-500" />
                                                Anuncios Activos
                                            </h3>
                                            <div className="space-y-3">
                                                {announcements.map((ann) => (
                                                    <div 
                                                        key={ann._id} 
                                                        className={clsx(
                                                            "p-4 rounded-2xl border transition-all",
                                                            ann.type === 'Alerta' 
                                                                ? "bg-red-500/5 border-red-500/20" 
                                                                : "bg-blue-500/5 border-blue-500/20"
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className={clsx(
                                                                        "text-xs font-bold px-2 py-1 rounded uppercase",
                                                                        ann.type === 'Alerta' 
                                                                            ? "bg-red-500/20 text-red-400" 
                                                                            : "bg-blue-500/20 text-blue-400"
                                                                    )}>
                                                                        {ann.type}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {new Date(ann.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <h4 className="font-bold text-white mb-1">{ann.title}</h4>
                                                                <p className="text-sm text-gray-400 line-clamp-2">{ann.message}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteAnnouncement(ann._id)}
                                                                className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- USUARIOS TAB --- */}
                        {activeTab === 'usuarios' && (
                            <div className="bg-gym-gray rounded-3xl p-6 border border-white/5 animate-in fade-in slide-in-from-bottom-4">
                                <UsersManagement />
                            </div>
                        )}

                        {/* --- RESERVAS TAB --- */}
                        {activeTab === 'reservas' && (
                            <div className="bg-gym-gray rounded-3xl p-8 border border-white/5 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Calendar className="text-purple-500" size={28} />
                                        Agenda del SUM
                                    </h2>
                                    <span className="text-sm text-gray-500">Próximos 30 días</span>
                                </div>

                                {loadingData ? (
                                    <div className="text-center py-20 text-gray-500">Cargando reservas...</div>
                                ) : reservations.length === 0 ? (
                                    <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                                        <p className="text-gray-500">No hay reservas futuras.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {reservations.map((res) => (
                                            <div key={res._id} className="bg-black/20 p-5 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="bg-white/5 p-3 rounded-2xl text-center min-w-[70px]">
                                                        <span className="block text-xs text-gray-500 uppercase font-bold">Día</span>
                                                        <span className="block text-xl font-black text-white">{res.date.split('-')[2]}</span>
                                                    </div>
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${res.timeSlot === 'Cena' ? 'bg-purple-500/20 text-purple-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {res.timeSlot}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Reservado por:</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gym-primary text-black flex items-center justify-center font-bold text-xs">
                                                            {res.unit?.number}
                                                        </div>
                                                        <span className="text-white font-medium truncate">{res.unit?.contactName || 'Vecino'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
