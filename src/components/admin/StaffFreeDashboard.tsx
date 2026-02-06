import { Package, AlertTriangle, Calendar, MessageSquare, Clock } from 'lucide-react';

interface StaffFreeDashboardProps {
    stats: any;
    setActiveTab: (tab: any) => void;
}

export default function StaffFreeDashboard({ stats, setActiveTab }: StaffFreeDashboardProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-white mb-4">Resumen Operativo</h2>

            {/* Widget Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Paquetes en Espera */}
                <div onClick={() => setActiveTab('buzon')} className="bg-gym-gray p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-blue-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-black transition-colors">
                            <Package size={24} />
                        </div>
                        <span className="text-4xl font-black text-white">{stats.packagesPending}</span>
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-wider">Paquetes en Espera</p>
                </div>

                {/* Mantenimiento Urgente (Count) */}
                <div onClick={() => setActiveTab('tareas')} className="bg-gym-gray p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-red-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 group-hover:bg-red-500 group-hover:text-black transition-colors">
                            <AlertTriangle size={24} />
                        </div>
                        <span className="text-4xl font-black text-white">{stats.urgentMaintenance?.length || 0}</span>
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-wider">Mantenimiento Urgente</p>
                </div>

                {/* Reservas Hoy (Count) */}
                <div onClick={() => setActiveTab('reservas')} className="bg-gym-gray p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-purple-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <Calendar size={24} />
                        </div>
                        <span className="text-4xl font-black text-white">{stats.todaysReservations?.length || 0}</span>
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-wider">Reservas Hoy</p>
                </div>

                {/* Mensajes (Placeholder count) */}
                <div onClick={() => setActiveTab('mensajes')} className="bg-gym-gray p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-green-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 rounded-2xl text-green-500 group-hover:bg-green-500 group-hover:text-black transition-colors">
                            <MessageSquare size={24} />
                        </div>
                        <span className="text-4xl font-black text-white">-</span>
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-wider">Mensajes Nuevos</p>
                </div>
            </div>

            {/* Listas Detalladas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Urgencias */}
                <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-red-500" />
                        Urgencias Activas
                    </h3>
                    <div className="space-y-3">
                        {stats.urgentMaintenance && stats.urgentMaintenance.length > 0 ? (
                            stats.urgentMaintenance.map((task: any) => (
                                <div key={task._id} className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-white text-sm">{task.title}</p>
                                        <p className="text-xs text-red-400 mt-1">{task.status}</p>
                                    </div>
                                    <Clock size={16} className="text-red-500" />
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No hay tareas urgentes.</p>
                        )}
                    </div>
                </div>

                {/* Agenda Hoy */}
                <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-purple-500" />
                        Agenda de Hoy
                    </h3>
                    <div className="space-y-3">
                        {stats.todaysReservations && stats.todaysReservations.length > 0 ? (
                            stats.todaysReservations.map((res: any) => (
                                <div key={res._id} className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-white text-sm">
                                            {res.unit?.number || 'Unidad'} - {res.resources.join(', ')}
                                        </p>
                                        <p className="text-xs text-purple-400 mt-1">{res.startTime} - {res.endTime}</p>
                                    </div>
                                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded font-bold">
                                        {res.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">Sin reservas para hoy.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
