import { useState, useEffect } from 'react';
import { Exercise, EXERCISE_DB, CARDIO_OPTIONS } from '@/lib/exercises';

export const useWOD = () => {
    const [wod, setWod] = useState<{ cardio: string; exercises: Exercise[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const generateWOD = async () => {
            // Simulate "calculation" time
            await new Promise(resolve => setTimeout(resolve, 500));

            const today = new Date().toISOString().split('T')[0];
            // Simple hash for seed
            let seed = 0;
            for (let i = 0; i < today.length; i++) {
                seed = ((seed << 5) - seed) + today.charCodeAt(i);
                seed |= 0;
            }
            seed = Math.abs(seed);

            // Pseudo-random generator
            const random = () => {
                const x = Math.sin(seed++) * 10000;
                return x - Math.floor(x);
            };

            // Select Cardio
            const cardioIndex = Math.floor(random() * CARDIO_OPTIONS.length);
            const cardio = CARDIO_OPTIONS[cardioIndex];

            // Select Exercises (Balanced Routine)
            // We want 1 Upper Body (Push), 1 Upper Body (Pull), 1 Legs, 1 Core/FullBody

            const pushExercises = EXERCISE_DB.filter(e => ['Pecho', 'Hombros', 'Brazos'].includes(e.category));
            const pullExercises = EXERCISE_DB.filter(e => ['Espalda'].includes(e.category));
            const legExercises = EXERCISE_DB.filter(e => ['Piernas'].includes(e.category));
            const coreExercises = EXERCISE_DB.filter(e => ['Core', 'Full Body', 'Cardio'].includes(e.category));

            const selectedExercises: Exercise[] = [];

            // Helper to pick random from array
            const pick = (arr: Exercise[]) => arr[Math.floor(random() * arr.length)];

            if (pushExercises.length) selectedExercises.push(pick(pushExercises));
            if (pullExercises.length) selectedExercises.push(pick(pullExercises));
            if (legExercises.length) selectedExercises.push(pick(legExercises));
            if (coreExercises.length) selectedExercises.push(pick(coreExercises));

            // Shuffle the final selection order
            const finalRoutine = selectedExercises.sort(() => 0.5 - random());

            setWod({ cardio, exercises: finalRoutine });
            setLoading(false);
        };

        generateWOD();
    }, []);

    return { wod, loading };
};
