'use client';

import { useState, useEffect } from 'react';
import { getDailyTasks, createTask, updateTaskStatus, deleteTask } from '@/actions/maintenance';
import { Plus, Trash2, CheckCircle, Clock, PlayCircle, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import clsx from 'clsx';

import { Suspense } from 'react';

function MaintenanceAdminContent() {
    const [columns, setColumns] = useState<{ todo: any[], inProgress: any[], done: any[] }>({ todo: [], inProgress: [], done: [] });
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();
    const initialDate = searchParams.get('date');

    // Form
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [priority, setPriority] = useState('Media');
    const [scheduledDate, setScheduledDate] = useState(initialDate ? new Date(initialDate).toISOString().split('T')[0] : '');

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        const data = await getDailyTasks();
        setColumns(data);
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', desc);
        formData.append('priority', priority);
        if (scheduledDate) {
            formData.append('scheduledDate', scheduledDate);
        }

        await createTask(formData);
        setTitle('');
        setDesc('');
        setPriority('Media');
        setScheduledDate('');
        loadTasks();
    };

    const handleStatusChange = async (id: string, status: string) => {
        await updateTaskStatus(id, status);
        loadTasks();
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Borrar tarea?')) {
            await deleteTask(id);
            loadTasks();
        }
    };

    const getPriorityColor = (p: string) => {
        if (p === 'Alta') return 'text-red-500 bg-red-500/10 border-red-500/20';
        if (p === 'Media') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
        return 'text-green-500 bg-green-500/10 border-green-500/20';
    };

    const TaskCard = ({ task }: { task: any }) => (
        <div className="bg-gym-gray p-3 rounded-xl border border-white/5 flex flex-col gap-2 group hover:border-white/10 transition-all">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded uppercase border", getPriorityColor(task.priority))}>
                            {task.priority}
                        </span>
                        {task.scheduledDate && (
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Calendar size={10} />
                                {new Date(task.scheduledDate).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-white text-sm leading-tight">{task.title}</h3>
                    {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
                </div>
                <button onClick={() => handleDelete(task._id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-1 pt-2 border-t border-white/5">
                {task.status === 'Pendiente' && (
                    <button
                        onClick={() => handleStatusChange(task._id, 'En Progreso')}
                        className="flex-1 bg-blue-500/10 text-blue-400 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-blue-500/20 flex items-center justify-center gap-1"
                    >
                        <PlayCircle size={12} /> Iniciar
                    </button>
                )}
                {task.status === 'En Progreso' && (
                    <>
                        <button
                            onClick={() => handleStatusChange(task._id, 'Pendiente')}
                            className="w-8 bg-gray-500/10 text-gray-400 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-gray-500/20 flex items-center justify-center"
                            title="Devolver a Pendiente"
                        >
                            ←
                        </button>
                        <button
                            onClick={() => handleStatusChange(task._id, 'Finalizada')}
                            className="flex-1 bg-green-500/10 text-green-400 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-green-500/20 flex items-center justify-center gap-1"
                        >
                            <CheckCircle size={12} /> Finalizar
                        </button>
                    </>
                )}
                {task.status === 'Finalizada' && (
                    <button
                        onClick={() => handleStatusChange(task._id, 'En Progreso')}
                        className="flex-1 bg-yellow-500/10 text-yellow-400 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-yellow-500/20 flex items-center justify-center gap-1"
                    >
                        <Clock size={12} /> Reabrir
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pb-24">
            <header className="mb-6 flex items-center justify-between max-w-6xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                        ← Volver
                    </Link>
                    <h1 className="text-xl font-black italic uppercase tracking-tighter text-orange-500">Gestión Diaria</h1>
                </div>
                <Link href="/admin/tareas/semanal" className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors">
                    <Calendar size={16} />
                    Ver Planificación Semanal
                </Link>
            </header>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Column 1: Create Form */}
                <div className="lg:col-span-1">
                    <section className="bg-gym-gray rounded-3xl p-5 border border-white/5 shadow-lg sticky top-4">
                        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <Plus className="text-orange-500" size={16} />
                            Nueva Tarea
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Título"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500 font-bold"
                            />
                            <textarea
                                placeholder="Detalles..."
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500 h-20 resize-none"
                            />
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Fecha Programada (Opcional)</label>
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500 font-bold"
                                />
                            </div>
                            <div className="flex gap-1">
                                {['Baja', 'Media', 'Alta'].map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={clsx(
                                            "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                                            priority === p
                                                ? getPriorityColor(p)
                                                : "border-white/10 text-gray-500 hover:bg-white/5"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button type="submit" className="w-full bg-orange-500 text-black font-bold py-3 rounded-xl hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20 text-sm uppercase tracking-wide">
                                Agregar
                            </button>
                        </form>
                    </section>
                </div>

                {/* Columns 2, 3, 4: Kanban Board */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Todo */}
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 min-h-[500px]">
                        <h2 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <AlertCircle size={16} /> Por Realizar ({columns.todo.length})
                        </h2>
                        <div className="space-y-3">
                            {columns.todo.map(task => <TaskCard key={task._id} task={task} />)}
                            {columns.todo.length === 0 && <p className="text-xs text-gray-600 text-center py-10">Nada pendiente</p>}
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 min-h-[500px]">
                        <h2 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <PlayCircle size={16} /> En Curso ({columns.inProgress.length})
                        </h2>
                        <div className="space-y-3">
                            {columns.inProgress.map(task => <TaskCard key={task._id} task={task} />)}
                            {columns.inProgress.length === 0 && <p className="text-xs text-gray-600 text-center py-10">Nada en curso</p>}
                        </div>
                    </div>

                    {/* Done */}
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 min-h-[500px]">
                        <h2 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <CheckCircle size={16} /> Realizadas Hoy ({columns.done.length})
                        </h2>
                        <div className="space-y-3">
                            {columns.done.map(task => <TaskCard key={task._id} task={task} />)}
                            {columns.done.length === 0 && <p className="text-xs text-gray-600 text-center py-10">Nada finalizado hoy</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MaintenanceAdminPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Cargando...</div>}>
            <MaintenanceAdminContent />
        </Suspense>
    );
}
