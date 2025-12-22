'use client';

import { useState, useEffect } from 'react';
import { addPackage } from '@/actions/packages';
import { createAnnouncement } from '@/actions/announcements';
import { getUnits, createUnit, deleteUnit } from '@/actions/units';
import { getReservations } from '@/actions/reservations';
import {
    Package, Megaphone, Users, Calendar,
    Plus, Trash2, Key, User, Search, CheckCircle, AlertCircle, Hammer, Truck, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function UnifiedAdminPage() {
    const [activeTab, setActiveTab] = useState<'buzon' | 'cartelera' | 'unidades' | 'reservas'>('buzon');
    const [status, setStatus] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    // --- Data States ---
    const [units, setUnits] = useState<any[]>([]);
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

    // Unidades
    const [unitNumber, setUnitNumber] = useState('');
    const [unitPin, setUnitPin] = useState('');
    const [unitContact, setUnitContact] = useState('');

    // --- Effects ---
    useEffect(() => {
        if (activeTab === 'unidades') loadUnits();
        if (activeTab === 'reservas') loadReservations();
        setStatus(null);
    }, [activeTab]);

    const showStatus = (msg: string, type: 'success' | 'error') => {
        setStatus({ msg, type });
        setTimeout(() => setStatus(null), 3000);
    };

    // --- Data Loaders ---
    const loadUnits = async () => {
        setLoadingData(true);
        const data = await getUnits();
        setUnits(data);
        setLoadingData(false);
    };

    const loadReservations = async () => {
        setLoadingData(true);
        const today = new Date().toISOString().split('T')[0];
        const data = await getReservations(today, '2099-12-31');
        setReservations(data);
        setLoadingData(false);
    };

    // --- Handlers ---
    const handleAddPackage = async (e: React.FormEvent) => {
        e.preventDefault();
        await addPackage({ unit: pkgUnit, recipientName: pkgName });
        showStatus('Paquete registrado correctamente', 'success');
        setPkgUnit('');
        setPkgName('');
    };

    const handleAddAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        await createAnnouncement({ title: annTitle, message: annMsg, type: annType, daysToLive: 7 });
        showStatus('Anuncio publicado correctamente', 'success');
        setAnnTitle('');
        setAnnMsg('');
    };

    const handleCreateUnit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (unitPin.length !== 4) {
            showStatus('El PIN debe tener 4 dígitos', 'error');
            return;
        }
        const res = await createUnit({ number: unitNumber, accessPin: unitPin, contactName: unitContact });
        if (res.success) {
            showStatus('Unidad creada', 'success');
            setUnitNumber('');
            setUnitPin('');
            setUnitContact('');
            loadUnits();
        } else {
            showStatus('Error: ' + res.error, 'error');
        }
    };

    const handleDeleteUnit = async (id: string) => {
        if (confirm('¿Eliminar unidad?')) {
            await deleteUnit(id);
            loadUnits();
        }
    };

    // --- Render Helpers ---
    const TabButton = ({ id, icon: Icon, label }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={clsx(
                "flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold uppercase tracking-wide text-sm w-full md:w-auto",
                activeTab === id
                    ? "bg-white text-black shadow-lg scale-105"
                    : "bg-gym-gray text-gray-500 hover:text-white hover:bg-white/5"
            )}
        >
            <Icon size={20} />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pb-24">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-6xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/" className="w-10 h-10 rounded-full bg-gym-gray flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        ←
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            Panel Maestro
                        </h1>
                        <p className="text-gray-500 text-sm">Administración Centralizada</p>
                    </div>
                </div>

                {status && (
                    <div className={clsx(
                        "px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm animate-in slide-in-from-top-2",
                        status.type === 'success' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    )}>
                        {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {status.msg}
                    </div>
                )}
            </header>

            <div className="max-w-6xl mx-auto">
                {/* Tabs Navigation */}
                <div className="flex flex-wrap gap-2 mb-8 p-2 bg-black/30 rounded-3xl border border-white/5">
                    <TabButton id="buzon" icon={Package} label="Paquetería" />
                    <TabButton id="cartelera" icon={Megaphone} label="Cartelera" />
                    <TabButton id="unidades" icon={Users} label="Unidades" />
                    <TabButton id="reservas" icon={Calendar} label="Reservas SUM" />
                    <Link href="/admin/tareas" className="flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold uppercase tracking-wide text-sm w-full md:w-auto bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-black border border-orange-500/20">
                        <Hammer size={20} />
                        Mantenimiento
                    </Link>
                    <Link href="/admin/pedidos/lista" className="flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold uppercase tracking-wide text-sm w-full md:w-auto bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black border border-green-500/20">
                        <Truck size={20} />
                        Pedidos
                    </Link>
                    <Link href="/admin/reportes" className="flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold uppercase tracking-wide text-sm w-full md:w-auto bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black border border-yellow-500/20">
                        <AlertTriangle size={20} />
                        Reportes
                    </Link>
                </div>

                {/* Content Area */}
                <div className="bg-gym-gray rounded-3xl p-6 md:p-8 border border-white/5 min-h-[500px]">

                    {/* --- BUZON TAB --- */}
                    {activeTab === 'buzon' && (
                        <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4">
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
                    )}

                    {/* --- CARTELERA TAB --- */}
                    {activeTab === 'cartelera' && (
                        <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4">
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
                        </div>
                    )}

                    {/* --- UNIDADES TAB --- */}
                    {activeTab === 'unidades' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
                            {/* Form */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Plus className="text-gym-primary" size={20} />
                                    Alta de Unidad
                                </h3>
                                <form onSubmit={handleCreateUnit} className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500 font-bold uppercase ml-2">Unidad</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: 4B"
                                            required
                                            value={unitNumber}
                                            onChange={(e) => setUnitNumber(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary uppercase"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-bold uppercase ml-2">PIN (4 dígitos)</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: 1234"
                                            required
                                            maxLength={4}
                                            value={unitPin}
                                            onChange={(e) => setUnitPin(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary font-mono tracking-widest"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-bold uppercase ml-2">Propietario</label>
                                        <input
                                            type="text"
                                            placeholder="Nombre (Opcional)"
                                            value={unitContact}
                                            onChange={(e) => setUnitContact(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary"
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-gym-primary text-black font-bold py-3 rounded-xl hover:bg-white transition-colors">
                                        Crear Unidad
                                    </button>
                                </form>
                            </div>

                            {/* List */}
                            <div className="h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 sticky top-0 bg-gym-gray py-2 z-10">
                                    <Users className="text-blue-500" size={20} />
                                    Lista de Unidades ({units.length})
                                </h3>
                                {loadingData ? (
                                    <div className="text-center py-10 text-gray-500">Cargando...</div>
                                ) : (
                                    <div className="space-y-3">
                                        {units.map((u) => (
                                            <div key={u._id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/20 transition-colors">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl font-black text-white">{u.number}</span>
                                                        <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-gray-400 flex items-center gap-1">
                                                            <Key size={10} /> {u.accessPin}
                                                        </span>
                                                    </div>
                                                    {u.contactName && <p className="text-sm text-gray-500">{u.contactName}</p>}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteUnit(u._id)}
                                                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- RESERVAS TAB --- */}
                    {activeTab === 'reservas' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
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
    );
}
