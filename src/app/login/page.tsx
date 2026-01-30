'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import { useForm } from '@/hooks/useForm';
import { validators, composeValidators } from '@/utils/validation';

interface LoginFormValues {
    email: string;
    password: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [serverError, setServerError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginFormValues>({
        initialValues: {
            email: '',
            password: '',
        },
        validate: (values) => {
            const errors: Partial<Record<keyof LoginFormValues, string>> = {};

            const emailError = composeValidators(
                validators.required,
                validators.email
            )(values.email);
            if (emailError) errors.email = emailError;

            const passwordError = composeValidators(
                validators.required,
                validators.minLength(6)
            )(values.password);
            if (passwordError) errors.password = passwordError;

            return errors;
        },
        onSubmit: async (values) => {
            setServerError('');

            try {
                const result = await signIn('credentials', {
                    email: values.email,
                    password: values.password,
                    redirect: false,
                });

                if (result?.error) {
                    setServerError('Email o contraseña incorrectos. Por favor, verifica tus credenciales.');
                } else {
                    // Fetch session to determine redirect
                    const sessionRes = await fetch('/api/auth/session');
                    const session = await sessionRes.json();

                    // Redirect based on role
                    if (session?.user?.role === 'SUPER_ADMIN') {
                        router.push('/admin/super');
                    } else if (session?.user?.role === 'ADMIN') {
                        router.push('/admin');
                    } else {
                        router.push('/');
                    }
                    router.refresh();
                }
            } catch (err) {
                setServerError('Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.');
            }
        },
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="bg-gym-gray p-8 rounded-3xl border border-white/5 w-full max-w-md shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gym-primary rounded-full flex items-center justify-center mx-auto mb-4 text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]">
                        <Building2 size={32} />
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                        Consorcios LITE
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">Inicia sesión para continuar</p>
                </div>

                <form onSubmit={form.handleSubmit} className="space-y-6">
                    {serverError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl">
                            {serverError}
                        </div>
                    )}

                    <FormField
                        label="Email"
                        name="email"
                        type="email"
                        value={form.values.email}
                        onChange={form.handleChange('email')}
                        onBlur={form.handleBlur('email')}
                        error={form.errors.email}
                        touched={form.touched.email}
                        required
                        placeholder="admin@ejemplo.com"
                        autoComplete="email"
                        icon={Mail}
                        showSuccess
                    />

                    <FormField
                        label="Contraseña"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.values.password}
                        onChange={form.handleChange('password')}
                        onBlur={form.handleBlur('password')}
                        error={form.errors.password}
                        touched={form.touched.password}
                        required
                        placeholder="••••••••"
                        autoComplete="current-password"
                        icon={Lock}
                        hint="Mínimo 6 caracteres"
                        endAdornment={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 hover:text-white transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        }
                    />

                    <button
                        type="submit"
                        disabled={form.isSubmitting}
                        className="w-full bg-gym-primary text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {form.isSubmitting ? 'Iniciando sesión...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
