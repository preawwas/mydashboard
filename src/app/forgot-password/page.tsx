'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { TrendingUp, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Invalid email format');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const supabase = createSupabaseBrowserClient();

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            });

            if (error) {
                // For security reasons, we might not want to reveal if the email exists,
                // but for this dashboard internal use/UX we might show the error if it's not a generic "user not found" 
                // However, Supabase often returns vague errors for rate limits etc.
                console.error('Reset password error:', error.message);
                // We'll show a generic error unless it's a specific known one OR just pretend success for security in public apps,
                // but here let's show success to avoid confusion unless it's a hard network error.
                // Actually, let's catch real errors.
                throw error;
            }

            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F2E2F] via-[#1F4E50] to-[#2E7D7F] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E7D7F] to-[#5FAFAF] shadow-xl shadow-[#2E7D7F]/30 mb-4">
                        <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-[#5FAFAF] bg-clip-text text-transparent">
                        Forgot Password?
                    </h1>
                    <p className="text-white/70 mt-2">
                        Enter your email to receive a password reset link
                    </p>
                </div>

                <div className="bg-white/10 border border-white/20 rounded-2xl shadow-xl shadow-black/20 p-8 backdrop-blur-sm">
                    {isSubmitted ? (
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <CheckCircle className="w-16 h-16 text-[#5FAFAF]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Reset link sent!</h3>
                                <p className="text-white/70 mt-2">
                                    We have sent a password reset link to<br />
                                    <span className="font-medium text-white">{email}</span>
                                </p>
                            </div>
                            <div className="text-sm text-white/50">
                                If you don't receive the email, please check your Spam/Junk folder.
                            </div>
                            <div className="pt-4">
                                <Link href="/login">
                                    <Button variant="secondary" className="w-full">
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            <Input
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                leftIcon={<Mail className="w-4 h-4" />}
                                disabled={isLoading}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                isLoading={isLoading}
                            >
                                Send Reset Link
                            </Button>

                            <div className="text-center mt-4">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center text-sm text-white/60 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

