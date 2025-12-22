import { WeeklyMealPlan } from '@/components/nutrition/WeeklyMealPlan';
import { SpotifyPlayer } from '@/components/music/SpotifyPlayer';

export default function RelaxPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            <section>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-gym-secondary flex items-center gap-2">
                    Fuel Your Body
                    <div className="h-1 flex-grow bg-gym-secondary/20 rounded-full" />
                </h2>
                <WeeklyMealPlan />
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
