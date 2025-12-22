'use client';

import { useState, useEffect } from 'react';
import { getMonthlyTasks } from '@/actions/maintenance';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, addMonths, subMonths, isSameMonth,
    isSameDay, isToday, parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Hammer, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export const MaintenanceCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const data = await getMonthlyTasks(year, month);
            setTasks(data);
            setLoading(false);
        };
        fetchTasks();
    }, [currentDate]);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const getTasksForDay = (day: Date) => {
        return tasks.filter(task => {
            if (!task.scheduledDate) return false;
            return isSameDay(parseISO(task.scheduledDate), day);
        });
    };

    const selectedDayTasks = getTasksForDay(selectedDate);

    const getPriorityColor = (p: string) => {
        if (p === 'Alta') return 'bg-red-500';
        if (p === 'Media') return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            {/* Left Column: Calendar (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                    <h2 className="text-xl font-bold text-white capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(day => (
                        <div key={day} className="text-center text-xs font-bold text-gray-500 py-2">
                            {day}
                        </div>
                    ))}

                    {calendarDays.map((day, idx) => {
                        const dayTasks = getTasksForDay(day);
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isTodayDate = isToday(day);

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => setSelectedDate(day)}
                                className={clsx(
                                    "aspect-square rounded-2xl flex flex-col items-center justify-start pt-2 relative transition-all border w-full",
                                    isSelected ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20 scale-105 z-10" :
                                        isCurrentMonth ? "bg-black/20 text-gray-300 border-white/5 hover:bg-white/5" : "bg-transparent text-gray-700 border-transparent",
                                    isTodayDate && !isSelected && "ring-1 ring-orange-500 text-orange-500"
                                )}
                            >
                                <span className={clsx("text-sm font-bold", !isCurrentMonth && "opacity-30")}>
                                    {format(day, 'd')}
                                </span>

                                {/* Task Dots */}
                                <div className="flex gap-1 mt-1 flex-wrap justify-center px-1">
                                    {dayTasks.slice(0, 3).map((t, i) => (
                                        <div
                                            key={i}
                                            className={clsx("w-1.5 h-1.5 rounded-full", getPriorityColor(t.priority))}
                                        />
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right Column: Details (7 cols) */}
            <div className="lg:col-span-7 bg-black/20 rounded-3xl p-6 border border-white/5 h-fit min-h-[500px]">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 capitalize border-b border-white/5 pb-4">
                    <Clock size={24} className="text-orange-500" />
                    {format(selectedDate, 'EEEE d de MMMM', { locale: es })}
                </h3>

                {selectedDayTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center border-2 border-dashed border-white/5 rounded-2xl">
                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 text-gray-600">
                            <Clock size={32} />
                        </div>
                        <p className="text-gray-400 text-lg font-medium">Sin tareas programadas</p>
                        <p className="text-gray-600 text-sm">Selecciona otro día en el calendario.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {selectedDayTasks.map(task => (
                            <div key={task._id} className="bg-gym-gray p-5 rounded-2xl border border-white/5 flex items-start gap-5 hover:border-orange-500/30 transition-colors group">
                                <div className={clsx(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                                    task.status === 'Finalizada' ? "bg-green-500/10 text-green-500 shadow-green-500/10" :
                                        task.status === 'En Progreso' ? "bg-blue-500/10 text-blue-500 shadow-blue-500/10" : "bg-gray-500/10 text-gray-400"
                                )}>
                                    {task.status === 'Finalizada' ? <CheckCircle size={24} /> :
                                        task.status === 'En Progreso' ? <Hammer size={24} /> : <AlertCircle size={24} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={clsx(
                                            "text-[10px] font-bold px-2 py-1 rounded-lg uppercase border tracking-wider",
                                            task.priority === 'Alta' ? "text-red-500 bg-red-500/10 border-red-500/20" :
                                                task.priority === 'Media' ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" :
                                                    "text-green-500 bg-green-500/10 border-green-500/20"
                                        )}>
                                            {task.priority}
                                        </span>
                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                            {task.status}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-white text-xl mb-1 group-hover:text-orange-400 transition-colors">{task.title}</h4>
                                    {task.description && <p className="text-gray-400 text-sm leading-relaxed">{task.description}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
