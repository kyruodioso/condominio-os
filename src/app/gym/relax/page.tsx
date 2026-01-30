import { WeeklyMealPlan } from '@/components/nutrition/WeeklyMealPlan';
import { SpotifyPlayer } from '@/components/music/SpotifyPlayer';
import { AlertTriangle } from 'lucide-react';

export default function RelaxPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            <section>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-gym-secondary flex items-center gap-2">
                    Fuel Your Body
                    <div className="h-1 flex-grow bg-gym-secondary/20 rounded-full" />
                </h2>
                <WeeklyMealPlan />

                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-gray-400 leading-relaxed text-justify">
                        <span className="font-bold text-yellow-500 block mb-1">Descargo de Responsabilidad Médica</span>
                        Este sistema proporciona recomendaciones generales basadas en algoritmos y no constituye asesoramiento médico profesional. La información aquí presentada no reemplaza la consulta, diagnóstico o tratamiento por parte de un médico o nutricionista calificado. Consulta siempre a un profesional de la salud antes de realizar cambios significativos en tu dieta o regimen de ejercicios.
                    </p>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-gym-accent flex items-center gap-2">
                    Vibe Check
                    <div className="h-1 flex-grow bg-gym-accent/20 rounded-full" />
                </h2>
                <SpotifyPlayer />
            </section>
        </div>
    );
}
