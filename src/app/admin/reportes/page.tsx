'use client';

import { useState, useEffect } from 'react';
import { getReports, updateReportStatus } from '@/actions/reports';
import { AlertTriangle, CheckCircle, Clock, Filter, Search, MoreVertical } from 'lucide-react';
import Link from 'next/link';

export default function AdminReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        const data = await getReports();
        setReports(data);
        setLoading(false);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        await updateReportStatus(id, newStatus);
        loadReports(); // Reload to reflect changes
    };

    const filteredReports = reports.filter(r =>
        filter === 'all' ? true : r.status === filter
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'in_progress': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'resolved': return 'text-green-500 bg-green-500/10 border-green-500/20';
            default: return 'text-gray-500';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                        Panel de <span className="text-yellow-500">Reportes</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Gestiona las incidencias reportadas por los residentes</p>
                </div>
                <Link href="/admin" className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    Volver al Dashboard
                </Link>
            </header>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['all', 'pending', 'in_progress', 'resolved'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${filter === f
                                ? 'bg-yellow-500 text-black'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        {f === 'all' ? 'Todos' : f.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredReports.map((report) => (
                        <div key={report._id} className="bg-gym-gray rounded-2xl p-6 border border-white/5 hover:border-yellow-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(report.status)}`}>
                                    {report.status.replace('_', ' ')}
                                </div>
                                <span className={`text-xs font-black uppercase tracking-wider ${getPriorityColor(report.priority)}`}>
                                    {report.priority} Priority
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{report.title}</h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-3">{report.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                                        {report.unitNumber}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {report.status !== 'resolved' && (
                                        <button
                                            onClick={() => handleStatusChange(report._id, 'resolved')}
                                            className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                                            title="Marcar como resuelto"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    )}
                                    {report.status === 'pending' && (
                                        <button
                                            onClick={() => handleStatusChange(report._id, 'in_progress')}
                                            className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                                            title="Marcar en progreso"
                                        >
                                            <Clock size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredReports.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <AlertTriangle size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No hay reportes en esta categoría</p>
                </div>
            )}
        </div>
    );
}
