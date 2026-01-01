'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { ProfileForm } from '@/components/user/ProfileForm';
import { BMIChart } from '@/components/user/BMIChart';
import Link from 'next/link';
import { ArrowRight, Dumbbell, Utensils } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Home() {
  const { hasProfile } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner />
    </div>
  );

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
         <div className="max-w-4xl mx-auto">
            <Breadcrumbs items={[{ label: 'Gimnasio' }]} />
            <div className="mt-12">
               <ProfileForm />
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Gimnasio' }]} />

        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gym-primary to-gym-secondary">
              GymHub
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-gym-primary animate-pulse" />
              <p className="text-gym-primary text-xs font-bold tracking-widest">SYSTEM ONLINE</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gym-gray to-black border border-white/10 flex items-center justify-center shadow-lg shadow-gym-primary/5">
            <span className="font-black text-gym-secondary italic">GH</span>
          </div>
        </header>

        <section>
          <BMIChart />
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/gym/workout" className="bg-gym-gray p-6 rounded-3xl border border-white/5 hover:border-gym-primary/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] -mr-4 -mt-4">
              <Dumbbell size={80} />
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-white text-lg mb-1">Entrenar</h3>
              <p className="text-xs text-gray-400 mb-4 font-medium">WOD del día</p>
              <div className="w-10 h-10 rounded-full bg-gym-primary text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                <ArrowRight size={20} />
              </div>
            </div>
          </Link>
          <Link href="/gym/relax" className="bg-gym-gray p-6 rounded-3xl border border-white/5 hover:border-gym-secondary/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] -mr-4 -mt-4">
              <Utensils size={80} />
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-white text-lg mb-1">Nutrición</h3>
              <p className="text-xs text-gray-400 mb-4 font-medium">Fuel & Relax</p>
              <div className="w-10 h-10 rounded-full bg-gym-secondary text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,204,255,0.3)]">
                <ArrowRight size={20} />
              </div>
            </div>
          </Link>
        </section>

        <div className="text-center pt-8">
          <button
            onClick={() => useUserStore.persist.clearStorage()}
            className="text-[10px] text-gray-600 hover:text-red-500 transition-colors uppercase font-bold tracking-widest"
          >
            Resetear Datos Locales
          </button>
        </div>
      </div>
    </div>
  );
}
