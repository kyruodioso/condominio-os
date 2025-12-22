'use client';

import { useNutrition } from '@/hooks/useNutrition';
import { Utensils, ChefHat, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export const WeeklyMealPlan = () => {
    const { weeklyPlan, loading } = useNutrition();
    const [expandedDay, setExpandedDay] = useState<number | null>(0); // Default open first day

    if (loading || weeklyPlan.length === 0) {
        return (
            <div className="bg-gym-gray rounded-3xl p-8 flex flex-col items-center justify-center min-h-[300px] animate-pulse border border-white/5">
                <ChefHat size={48} className="text-gray-600 mb-4" />
                <p className="text-gray-500 font-medium">Diseñando tu plan semanal...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-2">
                <CalendarDays className="text-gym-secondary" size={20} />
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">Plan Semanal</h3>
            </div>

            {weeklyPlan.map((meal, index) => {
                const isExpanded = expandedDay === index;

                return (
                    <div
                        key={`${meal.id}-${index}`}
                        className={`bg-gym-gray rounded-3xl overflow-hidden border transition-all duration-300 ${isExpanded ? 'border-gym-secondary/50 shadow-lg shadow-gym-secondary/10' : 'border-white/5 hover:border-white/20'}`}
                    >
                        <button
                            onClick={() => setExpandedDay(isExpanded ? null : index)}
                            className="w-full flex items-center justify-between p-4 text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[10px] uppercase ${isExpanded ? 'bg-gym-secondary text-black' : 'bg-black/40 text-gray-500'}`}>
                                    {meal.day.slice(0, 3)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">{meal.day}</p>
                                    <h4 className={`font-bold leading-tight truncate ${isExpanded ? 'text-white' : 'text-gray-400'}`}>{meal.name}</h4>
                                </div>
                            </div>
                            {isExpanded ? <ChevronUp size={20} className="text-gym-secondary" /> : <ChevronDown size={20} className="text-gray-600" />}
                        </button>

                        {isExpanded && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <div className="relative h-48 w-full">
                                    <img
                                        src={meal.image}
                                        alt={meal.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gym-gray to-transparent" />
                                    <div className="absolute bottom-2 left-4 right-4">
                                        <div className="bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 mb-2">
                                            <p className="text-[10px] text-gym-primary font-medium leading-tight mb-1">
                                                💡 {meal.reason}
                                            </p>
                                            <p className="text-[10px] text-white font-medium leading-tight border-t border-white/10 pt-1">
                                                🥗 {meal.benefits}
                                            </p>
                                        </div>
                                        <span className="bg-gym-secondary/90 backdrop-blur-sm text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                            {meal.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 pt-2">
                                    <div className="flex items-center gap-2 mb-3 text-gym-secondary">
                                        <Utensils size={16} />
                                        <h5 className="font-bold uppercase text-[10px] tracking-widest">Ingredientes</h5>
                                    </div>
                                    <ul className="grid grid-cols-2 gap-2 mb-4">
                                        {meal.ingredients.map((ing, i) => (
                                            <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                                                <div className="w-1 h-1 rounded-full bg-gym-secondary shrink-0" />
                                                <span className="truncate">{ing}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                        <h5 className="font-bold text-gray-500 text-[10px] mb-1 uppercase tracking-wider">Preparación</h5>
                                        <p className="text-gray-400 text-xs leading-relaxed">{meal.instructions}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
