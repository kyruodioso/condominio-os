import { useState, useEffect } from 'react';
import { RECIPES, Recipe } from '@/lib/recipes';
import { useUserStore } from '@/store/useUserStore';

export interface PlannedMeal extends Recipe {
    day: string;
    reason: string;
}

export const useNutrition = () => {
    const { weight, getBMI } = useUserStore();
    const { status } = getBMI();

    const [weeklyPlan, setWeeklyPlan] = useState<PlannedMeal[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!status) return;

        const fetchWeeklyPlan = async () => {
            setLoading(true);

            // Simulate calculation delay
            await new Promise(resolve => setTimeout(resolve, 600));

            const lowerStatus = status.toLowerCase();
            let targetTag = 'normal';
            let baseReason = '';

            if (lowerStatus.includes('bajo')) {
                targetTag = 'ganar_masa';
                baseReason = `Alto en proteínas y calorías para subir de tus ${weight}kg.`;
            } else if (lowerStatus.includes('sobrepeso') || lowerStatus.includes('obesidad')) {
                targetTag = 'bajar_peso';
                baseReason = `Bajo en calorías y saciante para optimizar tu peso de ${weight}kg.`;
            } else {
                targetTag = 'normal';
                baseReason = `Balanceado para mantener tu peso saludable de ${weight}kg.`;
            }

            // Filter recipes
            let filteredRecipes = RECIPES.filter(r => r.tags.includes(targetTag));

            // Fill if needed
            if (filteredRecipes.length < 7) {
                const others = RECIPES.filter(r => !r.tags.includes(targetTag));
                filteredRecipes = [...filteredRecipes, ...others];
            }

            // Shuffle
            const shuffled = filteredRecipes.sort(() => 0.5 - Math.random());

            // Generate 7 days starting from Today
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const todayIndex = new Date().getDay();

            const plan: PlannedMeal[] = [];

            for (let i = 0; i < 7; i++) {
                const dayIndex = (todayIndex + i) % 7;
                const dayName = i === 0 ? 'Hoy' : (i === 1 ? 'Mañana' : days[dayIndex]);

                // Add specific nuance to reason based on recipe category
                const recipe = shuffled[i % shuffled.length];
                let specificReason = baseReason;

                if (recipe.category.includes('Proteína') || recipe.category.includes('Carne') || recipe.category.includes('Pollo')) {
                    specificReason += " Rico en aminoácidos para recuperación muscular.";
                } else if (recipe.category.includes('Verduras') || recipe.category.includes('Ensalada')) {
                    specificReason += " Aporte de fibra y micronutrientes esenciales.";
                }

                plan.push({
                    ...recipe,
                    day: dayName,
                    reason: specificReason,
                    benefits: recipe.benefits
                });
            }

            setWeeklyPlan(plan);
            setLoading(false);
        };

        fetchWeeklyPlan();
    }, [status, weight]);

    return { weeklyPlan, loading };
};
