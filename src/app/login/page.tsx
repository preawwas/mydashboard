'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Loading } from '@/components/ui';
import { useAuthStore } from '@/lib/store';
import { TrendingUp, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useLoading } from '@/components/providers/LoadingProvider';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Add global loading state trigger
    const { startLoading, stopLoading } = useLoading();

    const [rememberMe, setRememberMe] = useState(false);

    const { setUser, setToken } = useAuthStore();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Check for saved email
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }

        if (searchParams.get('registered')) {
            setShowSuccessMessage(true);
            // Hide message after 5 seconds
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
                // Optionally clean up the URL
                router.replace('/login');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = 'Please enter your email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Please enter your password';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        startLoading(); // Start global loading overlay
        setErrors({});

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({ submit: data.error || 'Login failed' });
                // Only stop global loading on error, let it run until navigation completes on success.
                stopLoading();
                return;
            }

            // Handle Remember Me
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', formData.email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            setUser(data.user);
            setToken(data.token);
            // The loading overlay will automatically stop once the next page renders due to the `useEffect` in the layout.
            router.push('/dashboard');
        } catch {
            setErrors({ submit: 'An error occurred. Please try again.' });
            stopLoading();
        } finally {
            setIsLoading(false); // Keeps the button loading state for a split second before unmounting
        }
    };

    return (
        <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    Login
                </h1>
                <p className="text-muted-foreground mt-2">Management System</p>
            </div>

            {/* Success Message for Registration */}
            {showSuccessMessage && (
                <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-emerald-500">Registration successful!</h3>
                        <p className="text-sm text-emerald-500/80 mt-1">
                            Please check your email to verify your identity before logging in.
                        </p>
                    </div>
                </div>
            )}

            {/* Form Card */}
            <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {errors.submit && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-sm text-red-500">{errors.submit}</p>
                        </div>
                    )}

                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        error={errors.email}
                        leftIcon={<Mail className="w-4 h-4" />}
                    />

                    <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        error={errors.password}
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightIcon={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                                ) : (
                                    <Eye className="w-4 h-4" aria-hidden="true" />
                                )}
                            </button>
                        }
                    />

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-muted-foreground">Remember Me</span>
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-sm text-primary hover:text-primary-hover font-medium"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={isLoading}
                    >
                        Login
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link
                            href="/register"
                            className="text-primary hover:text-primary-hover font-medium"
                        >
                            Register
                        </Link>
                    </p>
                </div>

                {/* Demo Credentials */}

            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Suspense fallback={<Loading fullScreen text="Loading…" />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
