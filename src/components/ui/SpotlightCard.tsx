'use client';

import React, { useRef, useState, MouseEvent } from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn'; // Assuming you have a cn utility, if not I will use template literals but cn is standard in shadcn/tailwind projects usually. 

// Small utility to merge classes if 'cn' is not available, 
// but usually it is. I'll define a simple one internally to be safe or assuming the user has clsx/tailwind-merge
// Looking at package.json, clsx and tailwind-merge ARE installed.
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SpotlightCardProps {
    children: React.ReactNode;
    className?: string;
    href?: string;
    onClick?: () => void;
    spotlightColor?: string;
}

export const SpotlightCard = ({
    children,
    className = "",
    href,
    onClick,
    spotlightColor = "rgba(255, 255, 255, 0.1)"
}: SpotlightCardProps) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => {
        setOpacity(1);
    };

    const handleBlur = () => {
        setOpacity(0);
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    const Content = (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-black/50 group",
                className
            )}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
                }}
            />
            <div className="relative z-10 h-full flex flex-col justify-between">{children}</div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full" onClick={onClick}>
                {Content}
            </Link>
        );
    }

    return (
        <div onClick={onClick} className="h-full cursor-pointer">
            {Content}
        </div>
    );
};
