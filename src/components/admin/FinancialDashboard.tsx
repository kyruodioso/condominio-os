'use client';

import { useEffect, useState } from 'react';
import { getFinancialStats } from '@/actions/finance';
import { DollarSign, TrendingDown, Users, TrendingUp, AlertTriangle } from 'lucide-react';

export default function FinancialDashboard({ setActiveTab }: { setActiveTab: (tab: any) => void }) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await getFinancialStats();
                setStats(data);
            } catch (error) {
                console.error('Error loading financial stats:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando indicadores financieros...</div>;
    }

    if (!stats) {
        return <div className="p-8 text-center text-gray-500">No hay datos financieros disponibles.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Billing */}
                <div className="bg-gym-gray p-6 rounded-3xl border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Facturación (Mes)</span>
                    </div>
                    <p className="text-3xl font-black text-white">${stats.billed.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Total expensas emitidas</p>
                </div>

                {/* Collection Rate */}
                <div className="bg-gym-gray p-6 rounded-3xl border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl text-white ${stats.collectionPercentage >= 90 ? 'bg-green-500' : stats.collectionPercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Recaudación</span>
                    </div>
                    <p className="text-3xl font-black text-white">{stats.collectionPercentage}%</p>
                    <p className="text-xs text-gray-400 mt-1">Cobrado del periodo actual</p>
                </div>

                {/* Delinquency */}
                <div className="bg-gym-gray p-6 rounded-3xl border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                            <AlertTriangle size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Deuda Total</span>
                    </div>
                    <p className="text-3xl font-black text-white">${stats.totalDebt.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Expensas vencidas acumuladas</p>
                </div>

                {/* Current Expense Draft */}
                <div className="bg-gym-gray p-6 rounded-3xl border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                            <TrendingDown size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Gasto Corriente</span>
                    </div>
                    <p className="text-3xl font-black text-white">${stats.currentExpenseTotal.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Acumulado para próxima liquidación</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-gym-gray p-8 rounded-3xl border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-6">Acciones Financieras</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setActiveTab('expensas')}
                            className="p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-2xl text-left transition-colors group"
                        >
                            <div className="mb-2 text-green-500">
                                <DollarSign size={24} />
                            </div>
                            <span className="font-bold text-green-400 block mb-1">Nueva Liquidación</span>
                            <span className="text-xs text-gray-400">Cargar gastos y cerrar mes</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('proveedores')}
                            className="p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-2xl text-left transition-colors"
                        >
                            <div className="mb-2 text-blue-500">
                                <Users size={24} />
                            </div>
                            <span className="font-bold text-blue-400 block mb-1">Proveedores</span>
                            <span className="text-xs text-gray-400">Gestionar pagos y servicios</span>
                        </button>
                    </div>
                </div>

                {/* Recent Activity Placeholder (Could be recent expenses added) */}
                <div className="bg-gym-gray p-8 rounded-3xl border border-white/5 flex items-center justify-center">
                    <div className="text-center">
                        <TrendingUp size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-gray-400 font-bold">Flujo de Caja</h3>
                        <p className="text-sm text-gray-500">Gráfico de ingresos vs egresos próximamente.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
