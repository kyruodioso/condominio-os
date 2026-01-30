'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="bg-white/10 text-white px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/20 transition-colors flex items-center gap-2"
        >
            <Printer size={16} /> Imprimir
        </button>
    );
}
