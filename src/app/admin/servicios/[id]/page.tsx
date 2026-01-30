import { getServiceRequests, deleteServiceEvent } from '@/actions/services';
import ServiceEvent from '@/models/ServiceEvent';
import dbConnect from '@/lib/dbConnect';
import Link from 'next/link';
import { ArrowLeft, Trash2, Printer, CheckCircle, XCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function DeleteButton({ id }: { id: string }) {
    'use client';

    const handleDelete = async () => {
        if (confirm('¿Estás seguro de eliminar este servicio? Se borrarán todas las inscripciones.')) {
            const result = await deleteServiceEvent(id);
            if (result.success) {
                window.location.href = '/admin/servicios';
            } else {
                alert('Error al eliminar');
            }
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-red-500/20 transition-colors flex items-center gap-2"
        >
            <Trash2 size={16} /> Eliminar
        </button>
    );
}

export default async function ServiceDetailsPage({ params }: { params: { id: string } }) {
    await dbConnect();
    const service = await ServiceEvent.findById(params.id).lean();

    if (!service) return notFound();

    const requests = await getServiceRequests(params.id);

    // Calculate totals
    const totalRequests = requests.length;
    const totalItems = requests.reduce((acc: number, req: any) => acc + (req.quantity || 1), 0);
    const totalRevenue = service.price ? totalItems * service.price : 0;

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500 print:animate-none">

            {/* Header (No print) */}
            <div className="flex justify-between items-center print:hidden">
                <Link href="/admin/servicios" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                    <ArrowLeft size={16} /> Volver
                </Link>
                <div className="flex gap-2">
                    <button
                        // @ts-ignore
                        onClick="window.print()"
                        className="bg-white/10 text-white px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/20 transition-colors flex items-center gap-2"
                    >
                        <Printer size={16} /> Imprimir
                    </button>
                    <DeleteButton id={params.id} />
                </div>
            </div>

            {/* Service Info */}
            <div className="bg-gym-gray p-8 rounded-3xl border border-white/5 print:border-black print:text-black print:bg-white">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white print:text-black">
                            {service.title}
                        </h1>
                        <p className="text-gray-400 mt-1 print:text-gray-600">
                            {new Date(service.date).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {service.providerName && (
                            <p className="text-gym-primary font-bold mt-2 uppercase tracking-wide text-xs print:text-black">
                                Proveedor: {service.providerName}
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="bg-black/30 px-6 py-3 rounded-xl border border-white/10 print:border-black print:bg-gray-100">
                            <span className="block text-xs text-gray-400 uppercase tracking-widest mb-1 print:text-gray-600">Total Unidades</span>
                            <span className="text-2xl font-bold text-white print:text-black">{totalItems}</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-white/5 print:border-black">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-white uppercase font-bold text-xs tracking-wider print:bg-gray-200 print:text-black">
                            <tr>
                                <th className="p-4">Unidad</th>
                                <th className="p-4">Contacto</th>
                                <th className="p-4 text-center">Cant.</th>
                                <th className="p-4">Notas</th>
                                <th className="p-4 text-right">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 print:divide-black">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500 print:text-black">
                                        Nadie se ha inscrito aún.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req: any) => (
                                    <tr key={req._id} className="hover:bg-white/5 transition-colors print:hover:bg-transparent text-gray-300 print:text-black">
                                        <td className="p-4 font-bold text-white print:text-black">
                                            {req.unitId?.number || 'N/A'}
                                        </td>
                                        <td className="p-4">
                                            {req.unitId?.contactName || req.userId.profile?.name || req.userId.email}
                                        </td>
                                        <td className="p-4 text-center font-bold">
                                            {req.quantity}
                                        </td>
                                        <td className="p-4 italic text-gray-500 print:text-black">
                                            {req.notes || '-'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${req.status === 'Requested' ? 'bg-blue-500/20 text-blue-400 print:text-black print:bg-transparent' :
                                                    'bg-green-500/20 text-green-400'
                                                }`}>
                                                {req.status === 'Requested' ? <CheckCircle size={12} /> : null}
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 print:border-black flex justify-between items-center text-xs text-gray-400 print:text-black">
                    <p>Reporte generado el {new Date().toLocaleDateString('es-AR')}</p>
                    {service.price > 0 && (
                        <p className="font-bold text-white print:text-black text-lg">
                            Total Estimado: ${totalRevenue.toFixed(2)}
                        </p>
                    )}
                </div>
            </div>

            <script dangerouslySetInnerHTML={{
                __html: `
                document.querySelector('button[onClick="window.print()"]').addEventListener('click', () => window.print());
            `}} />
        </div>
    );
}
