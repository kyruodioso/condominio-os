'use client';

import { useUserStore, Gender } from '@/store/useUserStore';
import { Ruler, Weight, Calendar } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import { useForm } from '@/hooks/useForm';
import { validators, composeValidators } from '@/utils/validation';

interface ProfileFormValues {
    weight: string;
    height: string;
    age: string;
    gender: Gender;
}

export const ProfileForm = () => {
    const setProfile = useUserStore((state) => state.setProfile);

    const form = useForm<ProfileFormValues>({
        initialValues: {
            weight: '',
            height: '',
            age: '',
            gender: 'male'
        },
        validate: (values) => {
            const errors: Partial<Record<keyof ProfileFormValues, string>> = {};

            const weightError = composeValidators(
                validators.required,
                validators.numeric,
                validators.range(20, 300)
            )(values.weight);
            if (weightError) errors.weight = weightError;

            const heightError = composeValidators(
                validators.required,
                validators.numeric,
                validators.range(50, 250)
            )(values.height);
            if (heightError) errors.height = heightError;

            const ageError = composeValidators(
                validators.required,
                validators.numeric,
                validators.range(10, 120)
            )(values.age);
            if (ageError) errors.age = ageError;

            return errors;
        },
        onSubmit: (values) => {
            setProfile({
                weight: Number(values.weight),
                height: Number(values.height),
                age: Number(values.age),
                gender: values.gender
            });
        }
    });

    return (
        <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gym-primary to-gym-secondary">
                    Bienvenido
                </h2>
                <p className="text-gray-400 mt-2">Configura tu perfil para empezar</p>
            </div>

            <form onSubmit={form.handleSubmit} className="space-y-5">
                <FormField
                    label="Peso (kg)"
                    name="weight"
                    type="number"
                    value={form.values.weight}
                    onChange={form.handleChange('weight')}
                    onBlur={form.handleBlur('weight')}
                    error={form.errors.weight}
                    touched={form.touched.weight}
                    required
                    placeholder="Ej: 75"
                    icon={Weight}
                />

                <FormField
                    label="Altura (cm)"
                    name="height"
                    type="number"
                    value={form.values.height}
                    onChange={form.handleChange('height')}
                    onBlur={form.handleBlur('height')}
                    error={form.errors.height}
                    touched={form.touched.height}
                    required
                    placeholder="Ej: 180"
                    icon={Ruler}
                />

                <FormField
                    label="Edad"
                    name="age"
                    type="number"
                    value={form.values.age}
                    onChange={form.handleChange('age')}
                    onBlur={form.handleBlur('age')}
                    error={form.errors.age}
                    touched={form.touched.age}
                    required
                    placeholder="Ej: 25"
                    icon={Calendar}
                />

                {/* Gender Selection */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-300">Género</label>
                    <div className="grid grid-cols-2 gap-4">
                        {['male', 'female'].map((g) => (
                            <button
                                key={g}
                                type="button"
                                onClick={() => form.setFieldValue('gender', g as Gender)}
                                className={`py-3 rounded-xl border-2 font-medium transition-all ${
                                    form.values.gender === g
                                        ? 'bg-gym-gray border-gym-primary text-gym-primary shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                                        : 'border-gym-gray bg-transparent text-gray-500 hover:border-gray-600'
                                }`}
                            >
                                {g === 'male' ? 'Hombre' : 'Mujer'}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full mt-6 bg-gradient-to-r from-gym-primary to-gym-secondary text-black font-bold py-4 rounded-2xl shadow-lg shadow-gym-primary/20 hover:shadow-gym-primary/40 transition-all active:scale-95 text-lg uppercase tracking-wider"
                >
                    Entrar al Gym
                </button>
            </form>
        </div>
    );
};
