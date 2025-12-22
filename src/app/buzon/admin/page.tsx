'use client';

import { useState } from 'react';
import { addPackage } from '@/actions/packages';
import { createAnnouncement } from '@/actions/announcements';
import Link from 'next/link';

export default function AdminPage() {
    // Package Form
    const [pkgUnit, setPkgUnit] = useState('');
    const [pkgName, setPkgName] = useState('');
    const [pkgStatus, setPkgStatus] = useState('');

    // Announcement Form
    const [annTitle, setAnnTitle] = useState('');
    const [annMsg, setAnnMsg] = useState('');
    const [annType, setAnnType] = useState<'Info' | 'Alerta'>('Info');
    const [annStatus, setAnnStatus] = useState('');

    const handleAddPackage = async (e: React.FormEvent) => {
        e.preventDefault();
        await addPackage({ unit: pkgUnit, recipientName: pkgName });
        setPkgStatus('Paquete registrado!');
        setPkgUnit('');
        setPkgName('');
        setTimeout(() => setPkgStatus(''), 3000);
    };

    const handleAddAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        await createAnnouncement({ title: annTitle, message: annMsg, type: annType, daysToLive: 7 });
        setAnnStatus('Anuncio publicado!');
        setAnnTitle('');
        setAnnMsg('');
        setTimeout(() => setAnnStatus(''), 3000);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <header className="mb-8 flex items-center justify-between">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                    ← Volver
                </Link>
                <h1 className="text-xl font-black italic uppercase tracking-tighter text-gray-500">Admin Panel</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Package Manager */}
                <section className="bg-gym-gray rounded-3xl p-6 border border-white/5">
                    <h2 className="text-lg font-bold text-blue-500 mb-4 uppercase tracking-wide">Registrar Paquete</h2>
                    <form onSubmit={handleAddPackage} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Unidad (ej: 4B)"
                            required
                            value={pkgUnit}
                            onChange={(e) => setPkgUnit(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Nombre Destinatario"
                            required
                            value={pkgName}
                            onChange={(e) => setPkgName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500"
                        />
                        <button type="submit" className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors">
                            Guardar Paquete
                        </button>
                        {pkgStatus && <p className="text-green-500 text-sm text-center">{pkgStatus}</p>}
                    </form>
                </section>

                {/* Announcement Manager */}
                <section className="bg-gym-gray rounded-3xl p-6 border border-white/5">
                    <h2 className="text-lg font-bold text-yellow-500 mb-4 uppercase tracking-wide">Publicar Anuncio</h2>
                    <form onSubmit={handleAddAnnouncement} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Título"
                            required
                            value={annTitle}
                            onChange={(e) => setAnnTitle(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-yellow-500"
                        />
                        <textarea
                            placeholder="Mensaje..."
                            required
                            value={annMsg}
                            onChange={(e) => setAnnMsg(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-yellow-500 h-24 resize-none"
                        />
                        <select
                            value={annType}
                            onChange={(e) => setAnnType(e.target.value as any)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-yellow-500"
                        >
                            <option value="Info">Información</option>
                            <option value="Alerta">Alerta</option>
                        </select>
                        <button type="submit" className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors">
                            Publicar
                        </button>
                        {annStatus && <p className="text-green-500 text-sm text-center">{annStatus}</p>}
                    </form>
                </section>
            </div>
        </div>
    );
}
