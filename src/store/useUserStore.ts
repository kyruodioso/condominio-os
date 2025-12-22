import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Gender = 'male' | 'female' | 'other';

export interface UserState {
    weight: number; // kg
    height: number; // cm
    age: number;
    gender: Gender;
    hasProfile: boolean;

    setProfile: (data: { weight: number; height: number; age: number; gender: Gender }) => void;
    updateWeight: (weight: number) => void;
    logout: () => void;
    getBMI: () => { value: number; status: string; color: string };
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            weight: 0,
            height: 0,
            age: 0,
            gender: 'male',
            hasProfile: false,

            setProfile: (data) => set({ ...data, hasProfile: true }),

            updateWeight: (weight) => set({ weight }),

            logout: () => set({ weight: 0, height: 0, age: 0, gender: 'male', hasProfile: false }),

            getBMI: () => {
                const { weight, height } = get();
                if (!weight || !height) return { value: 0, status: 'Desconocido', color: 'text-gray-500' };

                const heightInMeters = height / 100;
                const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

                let status = '';
                let color = '';

                if (bmi < 18.5) {
                    status = 'Bajo Peso';
                    color = 'text-blue-400';
                } else if (bmi >= 18.5 && bmi < 25) {
                    status = 'Peso Normal';
                    color = 'text-gym-primary'; // Green
                } else if (bmi >= 25 && bmi < 30) {
                    status = 'Sobrepeso';
                    color = 'text-yellow-400';
                } else {
                    status = 'Obesidad';
                    color = 'text-red-500';
                }

                return { value: bmi, status, color };
            },
        }),
        {
            name: 'gymhub-user-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
