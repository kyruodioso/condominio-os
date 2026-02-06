'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { liquidateExpenses } from '@/actions/finance';
import { PlanType } from '@/lib/permissions';
import { Calculator, DollarSign, FileText } from 'lucide-react';

export default function ExpensesManagement() {
    const { data: session } = useSession();
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    const handleLiquidation = async () => {
        if (!confirm(`¿Confirmar liquidación de expensas para ${month}/${year}? Esto generará deuda para todas las unidades.`)) return;

        setLoading(true);
        setStatus(null);
        try {
            const res = await liquidateExpenses(month, year);
            if (res.success) {
                setStatus({ msg: res.message || 'Liquidación exitosa', type: 'success' });
            } else {
                setStatus({ msg: res.message || 'Error en liquidación', type: 'error' });
            }
        } catch (error) {
            setStatus({ msg: 'Error inesperado', type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div className="bg-gym-gray rounded-3xl p-8 border border-white/5 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <DollarSign className="text-green-500" size={28} />
                        Gestión de Expensas
                    </h2>
                    <p className="text-gray-400">Modulo Financiero PRO</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleLiquidation}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <Calculator size={18} />
                        {loading ? 'Procesando...' : 'Liquidar Expensas'}
                    </button>
                </div>
            </div>

            {status && (
                <div className={`p-4 rounded-xl mb-6 ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {status.msg}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                    <h3 className="font-bold text-lg mb-4 text-white">Periodo de Liquidación</h3>
                    <div className="flex gap-4">
                        <input
                            type="number"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            min={1} max={12}
                            className="bg-black/40 border border-white/10 rounded-xl p-3 text-white w-20 text-center font-bold"
                        />
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            min={2020} max={2030}
                            className="bg-black/40 border border-white/10 rounded-xl p-3 text-white w-24 text-center font-bold"
                        />
                    </div>
                </div>

                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 flex items-center justify-center flex-col text-center">
                    <FileText size={40} className="text-gray-600 mb-2" />
                    <p className="text-gray-500">Historial de Expensas</p>
                    <p className="text-xs text-gray-600">(Próximamente)</p>
                </div>
            </div>
        </div>
    );
}
