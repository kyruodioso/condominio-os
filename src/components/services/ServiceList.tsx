'use client';

import { useState } from 'react';
import { registerForService, cancelRegistration } from '@/actions/services';
import { Calendar, Clock, DollarSign, Truck, CheckCircle, X, Loader2, MessageSquare, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ServiceListProps {
    services: any[];
    userRequests: any[];
}

export function ServiceList({ services, userRequests }: ServiceListProps) {
    const router = useRouter();
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

    // Local state for form inputs per service
    const [inputs, setInputs] = useState<{ [key: string]: { quantity: number, notes: string } }>({});

    const getRequestForService = (serviceId: string) => {
        return userRequests.find((r: any) => r.serviceEventId === serviceId);
    };

    const handleInputChange = (serviceId: string, field: 'quantity' | 'notes', value: any) => {
        setInputs(prev => ({
            ...prev,
            [serviceId]: {
                ...(prev[serviceId] || { quantity: 1, notes: '' }),
                [field]: value
            }
        }));
    };

    const handleRegister = async (serviceId: string, requiresQuantity: boolean) => {
        setLoadingIds(prev => new Set(prev).add(serviceId));

        try {
            const input = inputs[serviceId] || { quantity: 1, notes: '' };
            // If doesn't require quantity, force 1
            const quantity = requiresQuantity ? input.quantity || 1 : 1;

            const result = await registerForService(serviceId, quantity, input.notes);

            if (result.success) {
                router.refresh();
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Error al inscribirse');
        } finally {
            setLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(serviceId);
                return next;
            });
        }
    };

    const handleCancel = async (requestId: string, serviceId: string) => {
        if (!confirm('¿Desea cancelar su inscripción?')) return;

        setLoadingIds(prev => new Set(prev).add(serviceId));

        try {
            const result = await cancelRegistration(requestId);
            if (result.success) {
                router.refresh();
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Error al cancelar');
        } finally {
            setLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(serviceId);
                return next;
            });
        }
    };

    const now = new Date();

    if (services.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">No hay servicios disponibles en este momento.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
                const request = getRequestForService(service._id);
                const isRegistered = !!request;
                const isLoading = loadingIds.has(service._id);
                const isDeadlinePassed = new Date(service.deadline) < now;
                const input = inputs[service._id] || { quantity: 1, notes: '' };

                return (
                    <div key={service._id} className={`bg-gym-gray p-6 rounded-3xl border transition-all flex flex-col h-full relative overflow-hidden ${isRegistered ? 'border-gym-primary/50 shadow-[0_0_20px_rgba(204,255,0,0.1)]' : 'border-white/5 hover:border-white/20'}`}>

                        {isRegistered && (
                            <div className="absolute top-0 right-0 bg-gym-primary text-black px-4 py-1 rounded-bl-xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-1">
                                <CheckCircle size={12} /> Inscrito
                            </div>
                        )}

                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                            <p className="text-gray-400 text-sm line-clamp-3 mb-4">{service.description}</p>

                            <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-gray-300">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-gym-primary" />
                                    <span>{format(new Date(service.date), "d MMM, HH:mm", { locale: es })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-red-400" />
                                    <span>Cierra: {format(new Date(service.deadline), "d MMM, HH:mm", { locale: es })}</span>
                                </div>
                                {service.price > 0 && (
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <DollarSign size={14} className="text-green-400" />
                                        ${service.price}
                                        {service.requiresQuantity && <span className="text-[10px] font-normal text-gray-500">/u</span>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Spacer to push controls to bottom */}
                        <div className="flex-grow" />

                        {/* Controls */}
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-4">

                            {isRegistered ? (
                                <div className="bg-black/20 p-4 rounded-xl space-y-2">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs text-gray-400 uppercase font-bold">Tu Solicitud</span>
                                        {request.status === 'Requested' && !isDeadlinePassed && (
                                            <button
                                                onClick={() => handleCancel(request._id, service._id)}
                                                disabled={isLoading}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-4 text-sm text-white">
                                        {service.requiresQuantity && (
                                            <div>
                                                <span className="text-xs text-gray-500 block">Cant.</span>
                                                <span className="font-bold">{request.quantity}</span>
                                            </div>
                                        )}
                                        {request.notes && (
                                            <div className="flex-1">
                                                <span className="text-xs text-gray-500 block">Notas</span>
                                                <span className="italic text-gray-300 text-xs">{request.notes}</span>
                                            </div>
                                        )}
                                        {!service.requiresQuantity && !request.notes && (
                                            <span className="text-gray-500 italic text-xs">Sin detalles adicionales</span>
                                        )}
                                    </div>
                                    <div className="text-[10px] uppercase font-bold tracking-widest text-gym-primary mt-1">
                                        {request.status === 'Requested' ? 'Solicitado' : 'Confirmado'}
                                    </div>
                                </div>
                            ) : (
                                !isDeadlinePassed ? (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                        {service.requiresQuantity && (
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1">
                                                    <Package size={12} /> Cantidad
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={input.quantity}
                                                    onChange={(e) => handleInputChange(service._id, 'quantity', parseInt(e.target.value))}
                                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-gym-primary focus:outline-none transition-colors"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1">
                                                <MessageSquare size={12} /> Notas (Opcional)
                                            </label>
                                            <textarea
                                                value={input.notes}
                                                onChange={(e) => handleInputChange(service._id, 'notes', e.target.value)}
                                                placeholder="Ej: Solo vidrios del balcón..."
                                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-gym-primary focus:outline-none transition-colors min-h-[60px]"
                                            />
                                        </div>

                                        <button
                                            onClick={() => handleRegister(service._id, service.requiresQuantity)}
                                            disabled={isLoading}
                                            className="w-full bg-gym-primary text-black font-bold uppercase tracking-widest py-3 rounded-xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Solicitar'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-center text-xs font-bold uppercase tracking-widest">
                                        Inscripción Cerrada
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
