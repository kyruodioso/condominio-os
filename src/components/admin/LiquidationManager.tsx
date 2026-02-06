'use client';

import { useState, useEffect } from 'react';
import { getExpenseDraft, addExpenseItem, deleteExpenseItem, liquidateExpenses } from '@/actions/finance';
import { Plus, Trash2, Save, FileText, Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function LiquidationManager() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [expense, setExpense] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Form State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('General');

    const [statusMsg, setStatusMsg] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    const loadExpense = async () => {
        setLoading(true);
        try {
            const data = await getExpenseDraft(month, year);
            setExpense(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExpense();
    }, [month, year]);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!expense) return;

        try {
            const updatedExpense = await addExpenseItem(expense._id, {
                description,
                amount: parseFloat(amount),
                category
            });
            setExpense(updatedExpense);
            setDescription('');
            setAmount('');
            setStatusMsg({ msg: 'Gasto agregado', type: 'success' });
            setTimeout(() => setStatusMsg(null), 2000);
        } catch (error) {
            setStatusMsg({ msg: 'Error al agregar gasto', type: 'error' });
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('¿Eliminar este gasto?')) return;
        try {
            const updatedExpense = await deleteExpenseItem(expense._id, itemId);
            setExpense(updatedExpense);
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const handleLiquidation = async () => {
        if (!confirm(`¿Confirmar liquidación por un total de $${expense.totalAmount}? Esto generará las deudas a las unidades.`)) return;

        setLoading(true);
        try {
            const res = await liquidateExpenses(month, year);
            if (res.success) {
                setStatusMsg({ msg: 'Liquidación exitosa. Las expensas han sido publicadas.', type: 'success' });
                loadExpense(); // Reload to see status change if any
            } else {
                setStatusMsg({ msg: res.message || 'Error', type: 'error' });
            }
        } catch (error) {
            setStatusMsg({ msg: 'Error inesperado', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gym-gray rounded-3xl p-6 md:p-8 border border-white/5 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Calculator className="text-gym-primary" size={28} />
                        Liquidación de Expensas
                    </h2>
                    <p className="text-gray-400 text-sm">Carga de gastos y cierre mensual</p>
                </div>

                {/* Period Selector */}
                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                    <select
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        className="bg-transparent text-white font-bold outline-none p-2"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1} className="text-black">
                                {format(new Date(2024, i, 1), 'MMMM', { locale: es }).toUpperCase()}
                            </option>
                        ))}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="bg-transparent text-white font-bold outline-none p-2"
                    >
                        <option value={2024} className="text-black">2024</option>
                        <option value={2025} className="text-black">2025</option>
                        <option value={2026} className="text-black">2026</option>
                    </select>
                </div>
            </div>

            {statusMsg && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 font-bold ${statusMsg.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {statusMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {statusMsg.msg}
                </div>
            )}

            {expense?.status === 'PUBLISHED' ? (
                <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-2xl text-center">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Expensas Liquidadas</h3>
                    <p className="text-green-400">Total: ${expense.totalAmount}</p>
                    <p className="text-gray-400 mt-4 text-sm">Este periodo ya fue cerrado y enviado a los propietarios.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Expense Form */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <Plus size={18} className="text-gym-primary" /> Agregar Gasto
                            </h3>
                            <form onSubmit={handleAddItem} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Descripción</label>
                                    <input
                                        type="text"
                                        required
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary"
                                        placeholder="Ej: Reparación Ascensor"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Monto</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Categoría</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary appearance-none"
                                    >
                                        <option value="General" className="text-black">General</option>
                                        <option value="Mantenimiento" className="text-black">Mantenimiento</option>
                                        <option value="Servicios" className="text-black">Servicios</option>
                                        <option value="Sueldos" className="text-black">Sueldos</option>
                                        <option value="Administrativo" className="text-black">Administrativo</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-gym-primary text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors uppercase text-sm tracking-widest">
                                    Cargar Item
                                </button>
                            </form>
                        </div>

                        <div className="bg-blue-500/10 p-6 rounded-2xl border border-blue-500/20">
                            <h3 className="font-bold text-blue-400 mb-2">Resumen Parcial</h3>
                            <p className="text-3xl font-black text-white">${expense?.totalAmount || 0}</p>
                            <p className="text-xs text-blue-300 mt-2">Total a prorratear entre unidades.</p>

                            <button
                                onClick={handleLiquidation}
                                disabled={!expense?.items?.length || loading}
                                className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Procesando...' : 'Confirmar y Liquidar'}
                            </button>
                        </div>
                    </div>

                    {/* Expense List */}
                    <div className="lg:col-span-2">
                        <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-white/5 text-white uppercase font-bold text-xs tracking-wider">
                                    <tr>
                                        <th className="p-4">Descripción</th>
                                        <th className="p-4">Categoría</th>
                                        <th className="p-4 text-right">Monto</th>
                                        <th className="p-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {expense?.items?.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500">
                                                No hay gastos cargados para este periodo.
                                            </td>
                                        </tr>
                                    ) : (
                                        expense?.items?.map((item: any) => (
                                            <tr key={item._id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-medium text-white">{item.description}</td>
                                                <td className="p-4">
                                                    <span className="bg-white/10 px-2 py-1 rounded text-xs">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-bold text-white">
                                                    ${item.amount}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={() => handleDeleteItem(item._id)}
                                                        className="text-gray-600 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
