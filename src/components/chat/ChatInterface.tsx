'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Send, Loader2, Mic, StopCircle } from 'lucide-react';
import clsx from 'clsx';

interface Message {
    _id: string;
    sender: 'ADMIN' | 'USER';
    content?: string;
    type: 'text' | 'audio';
    fileUrl?: string;
    createdAt: string;
    isRead: boolean;
}

interface ChatInterfaceProps {
    unitId: string;
    currentUserRole: 'ADMIN' | 'USER';
    title?: string;
    isOnline?: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ChatInterface({ unitId, currentUserRole, title, isOnline }: ChatInterfaceProps) {
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: messages, error, mutate } = useSWR<Message[]>(
        unitId ? `/api/messages?unitId=${unitId}` : null,
        fetcher,
        { refreshInterval: 1000 }
    );

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

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

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newMessage,
                    unitId: unitId,
                    type: 'text'
                }),
            });

            if (res.ok) {
                setNewMessage('');
                mutate();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const blob = new Blob(chunks, { type: mimeType });
                await sendAudioMessage(blob);
                stream.getTracks().forEach(track => track.stop()); // Stop mic
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('No se pudo acceder al micrófono');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const sendAudioMessage = async (audioBlob: Blob) => {
        setIsSending(true);
        try {
            // 1. Upload Audio
            const formData = new FormData();
            const extension = audioBlob.type.includes('mp4') ? 'mp4' : 'webm';
            formData.append('file', audioBlob, `audio.${extension}`);

            const uploadRes = await fetch('/api/upload/audio', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const { url } = await uploadRes.json();

            // 2. Send Message with URL
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    unitId: unitId,
                    type: 'audio',
                    fileUrl: url,
                    content: 'Mensaje de voz' // Fallback text
                }),
            });

            if (res.ok) {
                mutate();
            }
        } catch (error) {
            console.error('Error sending audio:', error);
            alert('Error al enviar audio');
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
                                {msg.type === 'audio' && msg.fileUrl ? (
                                    <audio controls src={msg.fileUrl} className="max-w-[200px] h-8" />
                                ) : (
                                    msg.content
                                )}
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
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-white/5 flex gap-2 items-center">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-gym-primary transition-colors"
                />

                {newMessage.trim() ? (
                    <button
                        type="submit"
                        disabled={isSending}
                        className="bg-gym-primary text-black p-2 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isSending}
                        className={clsx(
                            "p-2 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                            isRecording ? "bg-red-500 text-white animate-pulse" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        )}
                    >
                        {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                    </button>
                )}
            </form>
        </div>
    );
}
