'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Trash2, Save, FileText, Calculator, AlertCircle, CheckCircle, Upload, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function LiquidationManager() {
    const { data: session } = useSession();
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [expenses, setExpenses] = useState<any[]>([]);
    const [draft, setDraft] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [activeTab, setActiveTab] = useState<'expenses' | 'settlement'>('expenses');

    // Form State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [provider, setProvider] = useState('');
    const [category, setCategory] = useState('SUELDOS');
    const [type, setType] = useState('GASTO_A');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('BANCO');
    
    // Settings for Calculation
    const [interestRate, setInterestRate] = useState(4);
    const [reserveFundRate, setReserveFundRate] = useState(10);

    const [statusMsg, setStatusMsg] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    const condominiumId = session?.user?.condominiumId;

    const loadExpenses = async () => {
        if (!condominiumId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/expenses?condominiumId=${condominiumId}&month=${month}&year=${year}`);
            if (res.ok) {
                const data = await res.json();
                setExpenses(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExpenses();
        setDraft(null); // Reset draft when period changes
    }, [month, year, condominiumId]);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!condominiumId) return;

        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    condominiumId,
                    date,
                    description,
                    provider,
                    amount,
                    category,
                    type,
                    paymentMethod,
                    invoiceNumber,
                    // attachmentUrl: ... (impl file upload later)
                })
            });

            if (res.ok) {
                setStatusMsg({ msg: 'Gasto registrado correctamente', type: 'success' });
                // Reset form
                setDescription('');
                setAmount('');
                setProvider('');
                setInvoiceNumber('');
                loadExpenses();
                setTimeout(() => setStatusMsg(null), 3000);
            } else {
                const err = await res.json();
                setStatusMsg({ msg: err.error || 'Error al guardar', type: 'error' });
            }
        } catch (error) {
            setStatusMsg({ msg: 'Error de conexión', type: 'error' });
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('¿Eliminar este gasto?')) return;
        try {
            await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
            loadExpenses();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const handleConfirmSettlement = async () => {
        if (!confirm('¿Está seguro de cerrar este periodo? Esto generará las deudas para todas las unidades y no se podrá deshacer.')) return;
        setLoading(true);
        try {
            const res = await fetch('/api/settlements/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    condominiumId,
                    month,
                    year,
                    interestRate,
                    reserveFundRate
                })
            });

            if (res.ok) {
                setStatusMsg({ msg: 'Liquidación cerrada y enviada correctamente.', type: 'success' });
                setDraft(null);
                setActiveTab('expenses');
            } else {
                const err = await res.json();
                setStatusMsg({ msg: err.error || 'Error al confirmar', type: 'error' });
            }
        } catch (error) {
            setStatusMsg({ msg: 'Error de conexión', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = async () => {
        if (!condominiumId) return;
        setCalculating(true);
        try {
            const res = await fetch('/api/settlements/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    condominiumId,
                    month,
                    year,
                    interestRate,
                    reserveFundRate
                })
            });
            
            if (res.ok) {
                const data = await res.json();
                setDraft(data);
                setActiveTab('settlement');
            } else {
                const err = await res.json();
                setStatusMsg({ msg: err.error || 'Error en cálculo', type: 'error' });
            }
        } catch (error) {
            setStatusMsg({ msg: 'Error de conexión', type: 'error' });
        } finally {
            setCalculating(false);
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
                    <p className="text-gray-400 text-sm">Gestión del Periodo: {format(new Date(year, month - 1), 'MMMM yyyy', { locale: es }).toUpperCase()}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                     <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 flex-1 md:flex-none">
                        <button
                            onClick={() => setActiveTab('expenses')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'expenses' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            Gastos
                        </button>
                        <button
                            onClick={() => setActiveTab('settlement')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'settlement' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            Liquidación
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5 flex-1 md:flex-none justify-between md:justify-start">
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="bg-transparent text-white font-bold outline-none p-2 appearance-none cursor-pointer flex-1 md:flex-none"
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
                            className="bg-transparent text-white font-bold outline-none p-2 appearance-none cursor-pointer flex-1 md:flex-none text-right md:text-left"
                        >
                            <option value={2025} className="text-black">2025</option>
                            <option value={2026} className="text-black">2026</option>
                        </select>
                    </div>
                </div>
            </div>

            {statusMsg && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 font-bold ${statusMsg.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {statusMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {statusMsg.msg}
                </div>
            )}

            {activeTab === 'expenses' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Form */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <Plus size={18} className="text-gym-primary" /> Nuevo Gasto
                            </h3>
                            <form onSubmit={handleAddExpense} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Fecha</label>
                                    <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Proveedor</label>
                                    <input type="text" required placeholder="Ej: Edenor" value={provider} onChange={e => setProvider(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Descripción</label>
                                    <input type="text" required placeholder="Factura Nº..." value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Monto</label>
                                        <input type="number" step="0.01" required placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary" />
                                    </div>
                                    <div>
                                         <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nº Comprobante</label>
                                         <input type="text" placeholder="Opcional" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Categoría</label>
                                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary">
                                            <option value="SUELDOS" className="text-black">Sueldos</option>
                                            <option value="SERVICIOS" className="text-black">Servicios</option>
                                            <option value="MANTENIMIENTO" className="text-black">Mantenimiento</option>
                                            <option value="SEGUROS" className="text-black">Seguros</option>
                                            <option value="ADMINISTRACION" className="text-black">Administración</option>
                                            <option value="BANCARIOS" className="text-black">Bancarios</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Tipo</label>
                                        <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary">
                                            <option value="GASTO_A" className="text-black">Gasto A</option>
                                            <option value="GASTO_B" className="text-black">Gasto B</option>
                                            <option value="GASTO_C" className="text-black">Gasto C</option>
                                            <option value="PARTICULAR" className="text-black">Particular</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Pago</label>
                                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gym-primary">
                                        <option value="BANCO" className="text-black">Banco/Transferencia</option>
                                        <option value="EFECTIVO" className="text-black">Efectivo</option>
                                    </select>
                                </div>

                                <button type="submit" className="w-full bg-gym-primary text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors uppercase text-sm tracking-widest shadow-lg shadow-yellow-500/20">
                                    Registrar Gasto
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white">Gastos Registrados</h3>
                            <button onClick={handleCalculate} className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                                Ir a Calcular
                            </button>
                        </div>
                        
                        <div className="bg-black/20 rounded-2xl border border-white/5 overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-white/5 text-white uppercase font-bold text-xs tracking-wider">
                                    <tr>
                                        <th className="p-4">Fecha</th>
                                        <th className="p-4">Proveedor / Desc.</th>
                                        <th className="p-4">Cat / Tipo</th>
                                        <th className="p-4 text-right">Monto</th>
                                        <th className="p-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-500">No hay gastos cargados.</td>
                                        </tr>
                                    ) : (
                                        expenses.map((exp: any) => (
                                            <tr key={exp._id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 whitespace-nowrap">{new Date(exp.date).toLocaleDateString()}</td>
                                                <td className="p-4">
                                                    <div className="font-bold text-white">{exp.provider}</div>
                                                    <div className="text-xs">{exp.description}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="block text-xs font-bold text-gray-300">{exp.category}</span>
                                                    <span className="block text-[10px] bg-white/10 w-fit px-1.5 py-0.5 rounded mt-1">{exp.type.replace('_', ' ')}</span>
                                                </td>
                                                <td className="p-4 text-right font-bold text-white">
                                                    ${parseFloat(exp.amount.$numberDecimal || exp.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4">
                                                    <button onClick={() => handleDeleteExpense(exp._id)} className="text-gray-500 hover:text-red-500 transition-colors">
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

            {activeTab === 'settlement' && (
                <div className="space-y-6">
                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex gap-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Interés Mora %</label>
                                <input type="number" className="w-20 bg-black/40 border border-white/10 rounded-xl p-2 text-center font-bold text-white" value={interestRate} onChange={e => setInterestRate(parseFloat(e.target.value))} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Fondo Reserva %</label>
                                <input type="number" className="w-20 bg-black/40 border border-white/10 rounded-xl p-2 text-center font-bold text-white" value={reserveFundRate} onChange={e => setReserveFundRate(parseFloat(e.target.value))} />
                            </div>
                        </div>
                        <button onClick={handleCalculate} disabled={calculating} className="bg-gym-primary text-black font-bold py-3 px-6 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20 disabled:opacity-50">
                            {calculating ? 'Calculando...' : 'Recalcular Liquidación'}
                        </button>
                    </div>

                    {draft && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            {/* Draft Headers */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                                    <p className="text-xs text-blue-400 font-bold uppercase">Total Gastos</p>
                                    <p className="text-2xl font-black text-white">${draft.totalExpenses.toLocaleString('es-AR')}</p>
                                </div>
                                <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
                                    <p className="text-xs text-purple-400 font-bold uppercase">Gastos A</p>
                                    <p className="text-xl font-bold text-white">${draft.totalAmountA.toLocaleString('es-AR')}</p>
                                </div>
                                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
                                    <p className="text-xs text-orange-400 font-bold uppercase">Gastos B</p>
                                    <p className="text-xl font-bold text-white">${draft.totalAmountB.toLocaleString('es-AR')}</p>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                                    <p className="text-xs text-green-400 font-bold uppercase">Gastos C</p>
                                    <p className="text-xl font-bold text-white">${draft.totalAmountC.toLocaleString('es-AR')}</p>
                                </div>
                            </div>
                            
                            {/* Settlement Table */}
                            <div className="bg-black/20 rounded-2xl border border-white/5 overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-300">
                                    <thead className="bg-white/5 text-white uppercase font-bold text-xs tracking-wider">
                                        <tr>
                                            <th className="p-4 whitespace-nowrap">UF</th>
                                            <th className="p-4 whitespace-nowrap">Propietario</th>
                                            <th className="p-4 text-right whitespace-nowrap">Saldo Ant.</th>
                                            <th className="p-4 text-right whitespace-nowrap">Pagos</th>
                                            <th className="p-4 text-right whitespace-nowrap">Interés</th>
                                            <th className="p-4 text-right whitespace-nowrap">Gasto Mes</th>
                                            <th className="p-4 text-right whitespace-nowrap">Fondo Res.</th>
                                            <th className="p-4 text-right whitespace-nowrap text-gym-primary">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {draft.units.map((u: any) => (
                                            <tr key={u.unitId} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-bold">{u.unitNumber}</td>
                                                <td className="p-4">{u.ownerName}</td>
                                                <td className="p-4 text-right">${u.previousBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                                <td className="p-4 text-right text-green-400">-${u.paymentsAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                                <td className="p-4 text-right text-red-400">+{u.interestAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                                <td className="p-4 text-right">${u.currentPeriodShare.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                                <td className="p-4 text-right">${u.reserveFundAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                                <td className="p-4 text-right font-black text-gym-primary border-l border-white/5">
                                                    ${u.totalToPay.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end p-4">
                                <button
                                    onClick={handleConfirmSettlement}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50"
                                >
                                    {loading ? 'Procesando...' : 'Cerrar y Enviar Expensas'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
