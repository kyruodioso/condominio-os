'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;  // undefined = current page
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-6">
            {/* Home icon */}
            <Link 
                href="/" 
                className="text-gray-400 hover:text-gym-primary transition-colors"
                aria-label="Ir al inicio"
            >
                <Home size={16} />
            </Link>

            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const isCurrent = !item.href || isLast;

                return (
                    <div key={index} className="flex items-center gap-2">
                        <ChevronRight size={14} className="text-gray-600" aria-hidden="true" />
                        
                        {isCurrent ? (
                            <span 
                                className="text-white font-bold truncate max-w-[200px]"
                                aria-current="page"
                            >
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                href={item.href!}
                                className="text-gray-400 hover:text-gym-primary transition-colors truncate max-w-[200px]"
                            >
                                {item.label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
