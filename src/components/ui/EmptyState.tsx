'use client';

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
    iconColor?: string;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    iconColor = 'text-gray-600'
}: EmptyStateProps) {
    return (
        <div className="bg-gym-gray rounded-3xl p-12 border border-white/5 text-center">
            <Icon size={64} className={`mx-auto mb-4 ${iconColor}`} />
            <h3 className="text-xl font-bold text-gray-400 mb-2">{title}</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}
