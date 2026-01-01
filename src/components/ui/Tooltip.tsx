'use client';

import { ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: string;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export default function Tooltip({ 
    content, 
    children, 
    position = 'top',
    delay = 200 
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    let timeout: NodeJS.Timeout;

    const handleMouseEnter = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top;
        
        setCoords({ x, y });
        
        timeout = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        clearTimeout(timeout);
        setIsVisible(false);
    };

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    return (
        <div 
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            
            {isVisible && (
                <div 
                    className={`
                        absolute z-50 px-3 py-2 text-xs font-medium text-white
                        bg-gray-900 rounded-lg shadow-lg pointer-events-none
                        whitespace-nowrap animate-in fade-in duration-150
                        ${positionClasses[position]}
                    `}
                    role="tooltip"
                >
                    {content}
                    {/* Arrow */}
                    <div 
                        className={`
                            absolute w-2 h-2 bg-gray-900 rotate-45
                            ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                            ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                            ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
                            ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
                        `}
                    />
                </div>
            )}
        </div>
    );
}
