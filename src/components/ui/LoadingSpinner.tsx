'use client';

import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'white' | 'blue' | 'green' | 'red';
    message?: string;
    fullScreen?: boolean;
}

export default function LoadingSpinner({ 
    size = 'md', 
    color = 'primary',
    message,
    fullScreen = false
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const colorClasses = {
        primary: 'text-gym-primary',
        white: 'text-white',
        blue: 'text-blue-500',
        green: 'text-green-500',
        red: 'text-red-500'
    };

    const content = (
        <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 
                className={clsx(
                    'animate-spin',
                    sizeClasses[size],
                    colorClasses[color]
                )} 
            />
            {message && (
                <p className="text-sm text-gray-400 font-medium animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-gym-gray p-8 rounded-3xl border border-white/10 shadow-2xl">
                    {content}
                </div>
            </div>
        );
    }

    return content;
}

// Loading overlay component
export function LoadingOverlay({ message = 'Cargando...' }: { message?: string }) {
    return (
        <div className="absolute inset-0 bg-gym-gray/80 backdrop-blur-sm flex items-center justify-center z-40 rounded-3xl">
            <LoadingSpinner size="lg" message={message} />
        </div>
    );
}

// Skeleton loader for cards
export function SkeletonCard() {
    return (
        <div className="bg-gym-gray rounded-3xl p-6 border border-white/5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-white/5 rounded-2xl"></div>
                <div className="flex-1">
                    <div className="h-5 bg-white/5 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-white/5 rounded w-full"></div>
                <div className="h-3 bg-white/5 rounded w-5/6"></div>
            </div>
        </div>
    );
}
