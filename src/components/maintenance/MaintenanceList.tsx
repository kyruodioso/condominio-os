'use client';

import { useState, useEffect } from 'react';
import { getPublicTasks } from '@/actions/maintenance';
import { CheckCircle, Clock, Hammer, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export const MaintenanceList = () => {
    const [data, setData] = useState<{ todo: any[], inProgress: any[], done: any[] }>({ todo: [], inProgress: [], done: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const result = await getPublicTasks();
            setData(result);
            setLoading(false);
        };
        fetchData();
    }, []);

    const getPriorityBadge = (p: string) => {
        if (p === 'Alta') return <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase border text-red-500 bg-red-500/10 border-red-500/20">Alta</span>;
        if (p === 'Media') return <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase border text-yellow-500 bg-yellow-500/10 border-yellow-500/20">Media</span>;
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase border text-green-500 bg-green-500/10 border-green-500/20">Baja</span>;
    };

    const TaskItem = ({ task, icon: Icon, colorClass }: { task: any, icon: any, colorClass: string }) => (
        <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex items-start gap-3 mb-2">
            <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0", colorClass)}>
                <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    {getPriorityBadge(task.priority)}
                    <span className="text-[10px] text-gray-500 ml-auto font-mono">
                        {task.status === 'Finalizada'
                            ? new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(task.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <h3 className="font-bold text-white text-sm leading-tight truncate">{task.title}</h3>
                {task.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>}
            </div>
        </div>
    );

    if (loading) return (
        <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* En Curso */}
            <section>
                <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Hammer size={16} /> En Curso ({data.inProgress.length})
                </h3>
                {data.inProgress.length > 0 ? (
                    data.inProgress.map(task => (
                        <TaskItem key={task._id} task={task} icon={Hammer} colorClass="bg-blue-500/10 text-blue-500" />
                    ))
                ) : (
                    <div className="text-center py-4 border border-dashed border-white/10 rounded-xl">
                        <p className="text-xs text-gray-600">No hay tareas en curso.</p>
                    </div>
                )}
            </section>

            {/* Por Realizar */}
            <section>
                <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <AlertCircle size={16} /> Por Realizar ({data.todo.length})
                </h3>
                {data.todo.length > 0 ? (
                    data.todo.map(task => (
                        <TaskItem key={task._id} task={task} icon={Clock} colorClass="bg-gray-500/10 text-gray-400" />
                    ))
                ) : (
                    <div className="text-center py-4 border border-dashed border-white/10 rounded-xl">
                        <p className="text-xs text-gray-600">No hay tareas pendientes.</p>
                    </div>
                )}
            </section>

            {/* Realizadas Hoy */}
            <section>
                <h3 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <CheckCircle size={16} /> Realizadas Hoy ({data.done.length})
                </h3>
                {data.done.length > 0 ? (
                    data.done.map(task => (
                        <TaskItem key={task._id} task={task} icon={CheckCircle} colorClass="bg-green-500/10 text-green-500" />
                    ))
                ) : (
                    <div className="text-center py-4 border border-dashed border-white/10 rounded-xl">
                        <p className="text-xs text-gray-600">No se han completado tareas hoy.</p>
                    </div>
                )}
            </section>
        </div>
    );
};
