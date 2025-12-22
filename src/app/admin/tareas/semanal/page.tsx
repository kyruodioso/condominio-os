'use client';

import { useState, useEffect } from 'react';
import { getWeeklyTasks, updateTaskStatus, deleteTask } from '@/actions/maintenance';
import { startOfWeek, endOfWeek, addDays, format, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, Clock, AlertCircle, Hammer, Plus, Trash2, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function WeeklySchedulePage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });

    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    useEffect(() => {
        loadTasks();
    }, [currentDate]);

    const loadTasks = async () => {
        setLoading(true);
        const data = await getWeeklyTasks(startDate, endDate);
        setTasks(data);
        setLoading(false);
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

    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

    const getTasksForDay = (day: Date) => {
        return tasks.filter(task => {
            if (!task.scheduledDate) return false;
            return isSameDay(new Date(task.scheduledDate), day);
        });
    };

    const getStatusIcon = (status: string) => {
        if (status === 'Finalizada') return <CheckCircle size={14} className="text-green-500" />;
        if (status === 'En Progreso') return <Hammer size={14} className="text-blue-500" />;
        return <Clock size={14} className="text-gray-500" />;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pb-24">
            <header className="mb-6 flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/admin/tareas" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                        ← Volver
                    </Link>
                    <h1 className="text-xl font-black italic uppercase tracking-tighter text-orange-500">Planificación Semanal</h1>
                </div>

                <div className="flex items-center gap-4 bg-gym-gray p-2 rounded-xl border border-white/10">
                    <button onClick={prevWeek} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={16} className="text-orange-500" />
                        {format(startDate, 'd MMM', { locale: es })} - {format(endDate, 'd MMM', { locale: es })}
                    </div>
                    <button onClick={nextWeek} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto overflow-x-auto">
                <div className="min-w-[1000px] grid grid-cols-7 gap-4">
                    {weekDays.map((day) => {
                        const dayTasks = getTasksForDay(day);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div key={day.toISOString()} className={clsx(
                                "flex flex-col gap-3 rounded-2xl p-3 border min-h-[400px]",
                                isToday ? "bg-orange-500/5 border-orange-500/30" : "bg-gym-gray border-white/5"
                            )}>
                                <div className="text-center pb-2 border-b border-white/5">
                                    <div className="text-xs font-bold uppercase text-gray-500">{format(day, 'EEEE', { locale: es })}</div>
                                    <div className={clsx(
                                        "text-2xl font-black",
                                        isToday ? "text-orange-500" : "text-white"
                                    )}>
                                        {format(day, 'd')}
                                    </div>
                                    <Link
                                        href={`/admin/tareas?date=${day.toISOString()}`}
                                        className="mt-1 mx-auto w-6 h-6 rounded-full bg-white/5 hover:bg-orange-500 hover:text-black flex items-center justify-center transition-colors"
                                        title="Agregar tarea este día"
                                    >
                                        <Plus size={14} />
                                    </Link>
                                </div>

                                <div className="flex-1 space-y-2">
                                    {loading ? (
                                        <div className="h-20 animate-pulse bg-white/5 rounded-xl" />
                                    ) : dayTasks.length > 0 ? (
                                        dayTasks.map(task => (
                                            <div key={task._id} className="bg-black/40 p-2 rounded-xl border border-white/5 hover:border-white/20 transition-colors group relative">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={clsx(
                                                        "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border",
                                                        task.priority === 'Alta' ? "border-red-500/30 text-red-500" :
                                                            task.priority === 'Media' ? "border-yellow-500/30 text-yellow-500" :
                                                                "border-green-500/30 text-green-500"
                                                    )}>
                                                        {task.priority}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {getStatusIcon(task.status)}
                                                        <button
                                                            onClick={() => handleDelete(task._id)}
                                                            className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-xs font-bold text-white leading-tight mb-1">{task.title}</p>
                                                <p className="text-[10px] text-gray-500 truncate mb-2">{task.description}</p>

                                                {/* Quick Actions */}
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {task.status === 'Pendiente' && (
                                                        <button
                                                            onClick={() => handleStatusChange(task._id, 'En Progreso')}
                                                            className="flex-1 bg-blue-500/20 text-blue-400 py-1 rounded text-[8px] font-bold uppercase hover:bg-blue-500/30 flex items-center justify-center gap-1"
                                                        >
                                                            <PlayCircle size={8} /> Iniciar
                                                        </button>
                                                    )}
                                                    {task.status === 'En Progreso' && (
                                                        <button
                                                            onClick={() => handleStatusChange(task._id, 'Finalizada')}
                                                            className="flex-1 bg-green-500/20 text-green-400 py-1 rounded text-[8px] font-bold uppercase hover:bg-green-500/30 flex items-center justify-center gap-1"
                                                        >
                                                            <CheckCircle size={8} /> Fin
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex items-center justify-center opacity-20">
                                            <div className="w-1 h-1 bg-white rounded-full" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
