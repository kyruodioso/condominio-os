'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface ConfirmDialogProps {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    type = 'warning'
}: ConfirmDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
        } finally {
            setIsLoading(false);
        }
    };

    const colorClasses = {
        danger: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            icon: 'text-red-500',
            button: 'bg-red-500 hover:bg-red-600'
        },
        warning: {
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/30',
            icon: 'text-yellow-500',
            button: 'bg-yellow-500 hover:bg-yellow-600'
        },
        info: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            icon: 'text-blue-500',
            button: 'bg-blue-500 hover:bg-blue-600'
        }
    };

    const colors = colorClasses[type];

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            onClick={onCancel}
        >
            <div 
                className="bg-gym-gray rounded-3xl p-6 max-w-md w-full border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
                        <AlertTriangle className={colors.icon} size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                        <p className="text-sm text-gray-400">{message}</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-white transition-colors"
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`flex-1 py-3 px-4 ${colors.button} text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Procesando...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Hook to use confirm dialogs
export function useConfirm() {
    const [dialog, setDialog] = useState<ConfirmDialogProps | null>(null);

    const confirm = (props: Omit<ConfirmDialogProps, 'onConfirm' | 'onCancel'>): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialog({
                ...props,
                onConfirm: async () => {
                    setDialog(null);
                    resolve(true);
                },
                onCancel: () => {
                    setDialog(null);
                    resolve(false);
                }
            });
        });
    };

    const ConfirmDialogComponent = dialog ? <ConfirmDialog {...dialog} /> : null;

    return { confirm, ConfirmDialog: ConfirmDialogComponent };
}
