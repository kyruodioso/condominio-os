'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import ChatInterface from '@/components/chat/ChatInterface';
import { Search, MessageSquare, User, Plus, X, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { getUnits } from '@/actions/units'; 

const fetcher = (url: string) => fetch(url).then((res) => res.json());

import { useSession } from 'next-auth/react';

export default function AdminChatLayout() {
    const { data: session } = useSession();
    const isStaff = session?.user?.role === 'STAFF';

    const [selectedUnit, setSelectedUnit] = useState<{ id: string; name: string; isOnline?: boolean } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    // Si es Staff, empieza en ENCARGADO. Si es Admin, en ADMINISTRACION.
    const [activeChannel, setActiveChannel] = useState<'ADMINISTRACION' | 'ENCARGADO'>('ADMINISTRACION');
    
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [allUnits, setAllUnits] = useState<any[]>([]);
    const [unitSearchTerm, setUnitSearchTerm] = useState('');

    // Effect to set initial channel based on role
    useEffect(() => {
        if (isStaff) {
             setActiveChannel('ENCARGADO');
        }
    }, [isStaff]);

    const handleNewChat = async () => {
        setShowNewChatModal(true);
        // Cargar todas las unidades si no estan cargadas
        if (allUnits.length === 0) {
            try {
                const units = await getUnits();
                setAllUnits(units);
            } catch (e) {
                console.error("Error loading units", e);
            }
        }
    };

    const filteredUnits = allUnits.filter(u => 
        u.number.toLowerCase().includes(unitSearchTerm.toLowerCase()) || 
        (u.contactName && u.contactName.toLowerCase().includes(unitSearchTerm.toLowerCase()))
    );

    // Polling de conversaciones cada 5 segundos
    const { data: conversations, error } = useSWR(
        `/api/admin/conversations?channel=${activeChannel}`,
        fetcher,
        { refreshInterval: 5000 }
    );

    const filteredConversations = Array.isArray(conversations) ? conversations?.filter((c: any) =>
        c.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactName.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="flex h-[calc(100vh-120px)] gap-6 relative">
            {/* Sidebar - Lista de Chats */}
            <div className={clsx(
                "w-full md:w-1/3 bg-gym-gray rounded-3xl border border-white/5 flex-col overflow-hidden absolute md:relative inset-0 z-10 md:z-auto transition-transform duration-300 md:translate-x-0 md:flex",
                selectedUnit ? "-translate-x-full md:translate-x-0 hidden md:flex" : "flex"
            )}>
                <div className="p-4 border-b border-white/5 space-y-4">
                    {!isStaff && (
                        <div className="flex gap-2 bg-black/20 p-1 rounded-xl">
                            <button 
                                onClick={() => { setActiveChannel('ADMINISTRACION'); setSelectedUnit(null); }}
                                className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-colors ${activeChannel === 'ADMINISTRACION' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                Administración
                            </button>
                            <button 
                                onClick={() => { setActiveChannel('ENCARGADO'); setSelectedUnit(null); }}
                                className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-colors ${activeChannel === 'ENCARGADO' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                Encargado
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                            {isStaff ? 'Mensajes de Residentes' : 'Mensajes'}
                        </h2>
                        <button 
                            onClick={handleNewChat}
                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                            title="Iniciar nueva conversación"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar unidad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-gym-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {!conversations && <div className="p-4 text-center text-gray-500">Cargando chats...</div>}

                    {filteredConversations?.map((conv: any) => (
                        <button
                            key={conv.unitId}
                            onClick={() => setSelectedUnit({
                                id: conv.unitId,
                                name: `Unidad ${conv.unitNumber} - ${conv.contactName}`,
                                isOnline: conv.isOnline
                            })}
                            className={clsx(
                                "w-full p-4 rounded-xl flex items-start gap-3 transition-all text-left group",
                                selectedUnit?.id === conv.unitId
                                    ? "bg-gym-primary text-black"
                                    : "hover:bg-white/5 text-gray-300"
                            )}
                        >
                            <div className={clsx(
                                "p-2 rounded-full shrink-0 relative",
                                selectedUnit?.id === conv.unitId ? "bg-black/10" : "bg-white/5"
                            )}>
                                <User size={20} />
                                {conv.isOnline && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1a1a1a] rounded-full" title="En línea" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm truncate">
                                        Unidad {conv.unitNumber}
                                    </span>
                                    <span className="text-[10px] opacity-70">
                                        {new Date(conv.lastMessageAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className={clsx(
                                    "text-xs truncate",
                                    conv.unreadCount > 0 && selectedUnit?.id !== conv.unitId ? "font-bold" : "opacity-70"
                                )}>
                                    {conv.lastSender === 'USER' ? '👤 ' : (conv.lastSender === 'STAFF' ? '🛠️ ' : 'me: ')}
                                    {conv.lastMessage}
                                </p>
                            </div>

                            {conv.unreadCount > 0 && selectedUnit?.id !== conv.unitId && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                    {conv.unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={clsx(
                "flex-1 bg-gym-gray md:bg-transparent rounded-3xl md:rounded-none border border-white/5 md:border-none overflow-hidden absolute md:relative inset-0 z-20 md:z-auto md:block",
                selectedUnit ? "block" : "hidden md:block" // Show when selectedUnit is true on mobile
            )}>
                {selectedUnit ? (
                    <div className="h-full flex flex-col">
                        {/* Mobile Back Button (Render custom header or wrap ChatInterface) */}
                        <div className="md:hidden p-4 border-b border-white/5 flex items-center gap-2 bg-gray-900">
                            <button onClick={() => setSelectedUnit(null)} className="text-gray-400 hover:text-white">
                                <ArrowLeft size={20} />
                            </button>
                            <span className="font-bold text-white truncate">{selectedUnit.name}</span>
                        </div>

                        <div className="flex-1 overflow-hidden">
                             <ChatInterface
                                key={selectedUnit.id} // Forzar re-render al cambiar de unidad
                                unitId={selectedUnit.id}
                                currentUserRole="ADMIN"
                                title="" // Empty title because mobile has its own header, or we let ChatInterface handle it but we need back button
                                isOnline={selectedUnit.isOnline}
                                channel={activeChannel}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="h-full bg-gym-gray rounded-3xl border border-white/5 flex flex-col items-center justify-center text-gray-500 hidden md:flex">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={40} />
                        </div>
                        <p className="text-lg font-bold">Selecciona una conversación</p>
                        <p className="text-sm">Para ver los mensajes de una unidad</p>
                    </div>
                )}
            </div>
            {showNewChatModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-gym-gray w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                            <div>
                                <h3 className="text-lg font-bold text-white">Iniciar Conversación</h3>
                                <p className="text-xs text-gray-400">Selecciona una unidad para chatear</p>
                            </div>
                            <button onClick={() => setShowNewChatModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-4">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar por número o nombre..."
                                    value={unitSearchTerm}
                                    onChange={(e) => setUnitSearchTerm(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gym-primary text-sm"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                {allUnits.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-8 h-8 border-2 border-gym-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <p className="text-xs text-gray-500">Cargando unidades...</p>
                                    </div>
                                ) : filteredUnits.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No se encontraron unidades</p>
                                    </div>
                                ) : (
                                    filteredUnits.map((u: any) => (
                                        <button
                                            key={u._id}
                                            onClick={() => {
                                                setSelectedUnit({
                                                    id: u._id,
                                                    name: `Unidad ${u.number} - ${u.contactName || 'Sin Nombre'}`
                                                });
                                                setShowNewChatModal(false);
                                                setUnitSearchTerm('');
                                            }}
                                            className="w-full p-3 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-all text-left group border border-transparent hover:border-white/5"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-gray-400 group-hover:text-gym-primary group-hover:from-gym-primary/10 group-hover:to-gym-primary/5 transition-all font-bold text-xs ring-1 ring-white/10">
                                                {u.number}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm group-hover:text-gym-primary transition-colors">Unidad {u.number}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-[200px]">{u.contactName || 'Sin contacto registrado'}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
