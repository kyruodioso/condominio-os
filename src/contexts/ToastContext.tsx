'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(7);
        const newToast = { id, message, type };
        
        setToasts(prev => [...prev, newToast]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={clsx(
                            "flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md animate-in slide-in-from-right-full duration-300",
                            {
                                'bg-green-500/10 border-green-500/30 text-green-400': toast.type === 'success',
                                'bg-red-500/10 border-red-500/30 text-red-400': toast.type === 'error',
                                'bg-yellow-500/10 border-yellow-500/30 text-yellow-400': toast.type === 'warning',
                                'bg-blue-500/10 border-blue-500/30 text-blue-400': toast.type === 'info',
                            }
                        )}
                    >
                        {/* Icon */}
                        <div className="shrink-0 mt-0.5">
                            {toast.type === 'success' && <CheckCircle size={20} />}
                            {toast.type === 'error' && <XCircle size={20} />}
                            {toast.type === 'warning' && <AlertCircle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                        </div>
                        
                        {/* Message */}
                        <p className="flex-1 text-sm font-medium text-white">{toast.message}</p>
                        
                        {/* Close button */}
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="shrink-0 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
