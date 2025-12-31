'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Send, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface Message {
    _id: string;
    sender: 'ADMIN' | 'USER';
    content: string;
    createdAt: string;
    isRead: boolean;
}

interface ChatInterfaceProps {
    unitId: string; // ID de la unidad con la que se chatea
    currentUserRole: 'ADMIN' | 'USER'; // Rol del usuario actual viendo el chat
    title?: string; // Título opcional (ej: "Unidad 101")
    isOnline?: boolean; // Estado de conexión real
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ChatInterface({ unitId, currentUserRole, title, isOnline }: ChatInterfaceProps) {
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Polling cada 1 segundo para "tiempo real"
    const { data: messages, error, mutate } = useSWR<Message[]>(
        unitId ? `/api/messages?unitId=${unitId}` : null,
        fetcher,
        { refreshInterval: 1000 }
    );

    // Auto-scroll al fondo cuando llegan mensajes nuevos
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Marcar como leídos al abrir o recibir nuevos mensajes
    useEffect(() => {
        if (messages && messages.length > 0) {
            const hasUnread = messages.some(m => !m.isRead && m.sender !== currentUserRole);
            if (hasUnread) {
                fetch('/api/messages', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ unitId }),
                }).catch(console.error);
            }
        }
    }, [messages, unitId, currentUserRole]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newMessage,
                    unitId: unitId,
                }),
            });

            if (res.ok) {
                setNewMessage('');
                mutate(); // Refrescar mensajes inmediatamente
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (error) return <div className="p-4 text-red-500">Error cargando chat</div>;
    if (!messages && !error) return <div className="p-4 text-gray-400 flex items-center gap-2"><Loader2 className="animate-spin" /> Cargando...</div>;

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="bg-gray-800 p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bold text-white uppercase tracking-wide">
                    {title || 'Chat'}
                </h3>
                {isOnline && (
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-gray-400">En línea</span>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {messages?.length === 0 && (
                    <div className="text-center text-gray-500 mt-10 text-sm italic">
                        No hay mensajes aún. ¡Inicia la conversación!
                    </div>
                )}
                
                {messages?.map((msg) => {
                    const isMe = msg.sender === currentUserRole;
                    return (
                        <div
                            key={msg._id}
                            className={clsx(
                                "flex flex-col max-w-[80%]",
                                isMe ? "self-end items-end" : "self-start items-start"
                            )}
                        >
                            <div
                                className={clsx(
                                    "p-3 rounded-2xl text-sm shadow-md",
                                    isMe
                                        ? "bg-gym-primary text-black rounded-tr-none"
                                        : "bg-gray-700 text-white rounded-tl-none"
                                )}
                            >
                                {msg.content}
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1 px-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {isMe && (
                                    <span className="ml-1">
                                        {msg.isRead ? '✓✓' : '✓'}
                                    </span>
                                )}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-white/5 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-gym-primary transition-colors"
                />
                <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="bg-gym-primary text-black p-2 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
            </form>
        </div>
    );
}
