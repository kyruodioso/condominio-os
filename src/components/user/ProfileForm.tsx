'use client';

import { useState } from 'react';
import { useUserStore, Gender } from '@/store/useUserStore';
import { Ruler, Weight, Calendar } from 'lucide-react';

export const ProfileForm = () => {
    const setProfile = useUserStore((state) => state.setProfile);

    const [formData, setFormData] = useState({
        weight: '',
        height: '',
        age: '',
        gender: 'male' as Gender
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.weight || !formData.height || !formData.age) return;

        setProfile({
            weight: Number(formData.weight),
            height: Number(formData.height),
            age: Number(formData.age),
            gender: formData.gender
        });
    };

    return (
        <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gym-primary to-gym-secondary">
                    Bienvenido
                </h2>
                <p className="text-gray-400 mt-2">Configura tu perfil para empezar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Weight */}
                <div className="relative group">
                    <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gym-primary transition-colors" size={20} />
                    <input
                        type="number"
                        placeholder="Peso (kg)"
                        required
                        min="20"
                        max="300"
                        className="w-full bg-gym-gray text-white pl-12 pr-4 py-4 rounded-2xl border border-transparent focus:border-gym-primary focus:ring-1 focus:ring-gym-primary outline-none transition-all placeholder:text-gray-600"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                </div>

                {/* Height */}
                <div className="relative group">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gym-secondary transition-colors" size={20} />
                    <input
                        type="number"
                        placeholder="Altura (cm)"
                        required
                        min="50"
                        max="250"
                        className="w-full bg-gym-gray text-white pl-12 pr-4 py-4 rounded-2xl border border-transparent focus:border-gym-secondary focus:ring-1 focus:ring-gym-secondary outline-none transition-all placeholder:text-gray-600"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    />
                </div>

                {/* Age */}
                <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gym-accent transition-colors" size={20} />
                    <input
                        type="number"
                        placeholder="Edad"
                        required
                        min="10"
                        max="120"
                        className="w-full bg-gym-gray text-white pl-12 pr-4 py-4 rounded-2xl border border-transparent focus:border-gym-accent focus:ring-1 focus:ring-gym-accent outline-none transition-all placeholder:text-gray-600"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                </div>

                {/* Gender */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                    {['male', 'female'].map((g) => (
                        <button
                            key={g}
                            type="button"
                            onClick={() => setFormData({ ...formData, gender: g as Gender })}
                            className={`py-3 rounded-xl border-2 font-medium transition-all ${formData.gender === g
                                    ? 'bg-gym-gray border-gym-primary text-gym-primary shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                                    : 'border-gym-gray bg-transparent text-gray-500 hover:border-gray-600'
                                }`}
                        >
                            {g === 'male' ? 'Hombre' : 'Mujer'}
                        </button>
                    ))}
                </div>

                <button
                    type="submit"
                    className="w-full mt-6 bg-gradient-to-r from-gym-primary to-gym-secondary text-black font-bold py-4 rounded-2xl shadow-lg shadow-gym-primary/20 hover:shadow-gym-primary/40 transition-all active:scale-95 text-lg"
                >
                    ENTRAR AL GYM
                </button>
            </form>
        </div>
    );
};
