'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import ChatInterface from '@/components/chat/ChatInterface';
import { Search, MessageSquare, User } from 'lucide-react';
import clsx from 'clsx';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

import { useSession } from 'next-auth/react';

export default function AdminChatLayout() {
    const { data: session } = useSession();
    const isStaff = session?.user?.role === 'STAFF';

    const [selectedUnit, setSelectedUnit] = useState<{ id: string; name: string; isOnline?: boolean } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    // Si es Staff, empieza en ENCARGADO. Si es Admin, en ADMINISTRACION.
    const [activeChannel, setActiveChannel] = useState<'ADMINISTRACION' | 'ENCARGADO'>('ADMINISTRACION');
    
    // Effect to set initial channel based on role
    useEffect(() => {
        if (isStaff) {
             setActiveChannel('ENCARGADO');
        }
    }, [isStaff]);

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
        <div className="flex h-[calc(100vh-120px)] gap-6">
            {/* Sidebar - Lista de Chats */}
            <div className="w-1/3 bg-gym-gray rounded-3xl border border-white/5 flex flex-col overflow-hidden">
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

                    <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                        {isStaff ? 'Mensajes de Residentes' : 'Mensajes'}
                    </h2>
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
            <div className="flex-1">
                {selectedUnit ? (
                    <ChatInterface
                        key={selectedUnit.id} // Forzar re-render al cambiar de unidad
                        unitId={selectedUnit.id}
                        currentUserRole="ADMIN"
                        title={selectedUnit.name}
                        isOnline={selectedUnit.isOnline}
                        channel={activeChannel}
                    />
                ) : (
                    <div className="h-full bg-gym-gray rounded-3xl border border-white/5 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={40} />
                        </div>
                        <p className="text-lg font-bold">Selecciona una conversación</p>
                        <p className="text-sm">Para ver los mensajes de una unidad</p>
                    </div>
                )}
            </div>
        </div>
    );
}
