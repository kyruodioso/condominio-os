'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Clock, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        adminWorkHours: { start: "09:00", end: "18:00", days: [1, 2, 3, 4, 5] },
        autoReplyMessage: "",
        isAutoReplyEnabled: true
    });

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setSettings(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                alert('Configuración guardada correctamente');
            } else {
                alert('Error al guardar');
            }
        } catch (e) {
            console.error(e);
            alert('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (day: number) => {
        setSettings(prev => {
            const days = prev.adminWorkHours.days.includes(day)
                ? prev.adminWorkHours.days.filter(d => d !== day)
                : [...prev.adminWorkHours.days, day];
            return { ...prev, adminWorkHours: { ...prev.adminWorkHours, days } };
        });
    };

    if (loading) return <div className="p-10 text-white">Cargando configuración...</div>;

    const daysMap = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Configuración
                    </h1>
                    <p className="text-gray-400 text-sm">Preferencias de disponibilidad y respuestas</p>
                </header>

                <div className="space-y-6">
                    {/* Horario Laboral */}
                    <div className="bg-gym-gray p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                                <Clock size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-wide">Horario Laboral</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Inicio</label>
                                <input 
                                    type="time" 
                                    value={settings.adminWorkHours.start}
                                    onChange={e => setSettings({...settings, adminWorkHours: {...settings.adminWorkHours, start: e.target.value}})}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-gym-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fin</label>
                                <input 
                                    type="time" 
                                    value={settings.adminWorkHours.end}
                                    onChange={e => setSettings({...settings, adminWorkHours: {...settings.adminWorkHours, end: e.target.value}})}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-gym-primary outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Días Laborales</label>
                            <div className="flex flex-wrap gap-2">
                                {daysMap.map((day, index) => (
                                    <button
                                        key={index}
                                        onClick={() => toggleDay(index)}
                                        className={clsx(
                                            "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                            settings.adminWorkHours.days.includes(index)
                                                ? "bg-gym-primary text-black"
                                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                                        )}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Respuesta Automática */}
                    <div className="bg-gym-gray p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                                    <MessageSquare size={24} />
                                </div>
                                <h2 className="text-xl font-bold uppercase tracking-wide">Respuesta Automática</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-500 uppercase">
                                    {settings.isAutoReplyEnabled ? 'Activado' : 'Desactivado'}
                                </span>
                                <button 
                                    onClick={() => setSettings({...settings, isAutoReplyEnabled: !settings.isAutoReplyEnabled})}
                                    className={clsx(
                                        "w-12 h-6 rounded-full p-1 transition-colors",
                                        settings.isAutoReplyEnabled ? "bg-green-500" : "bg-gray-600"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-4 h-4 bg-white rounded-full transition-transform",
                                        settings.isAutoReplyEnabled ? "translate-x-6" : "translate-x-0"
                                    )} />
                                </button>
                            </div>
                        </div>

                        <div className={clsx("transition-opacity", !settings.isAutoReplyEnabled && "opacity-50 pointer-events-none")}>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mensaje de Ausencia</label>
                            <textarea 
                                value={settings.autoReplyMessage}
                                onChange={e => setSettings({...settings, autoReplyMessage: e.target.value})}
                                rows={4}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-gym-primary outline-none resize-none"
                                placeholder="Escribe el mensaje que se enviará automáticamente..."
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Este mensaje se enviará automáticamente cuando recibas un mensaje fuera de tu horario laboral.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-white text-black px-8 py-3 rounded-xl font-bold uppercase tracking-wide hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
