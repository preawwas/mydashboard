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
        <div className="min-h-screen bg-gradient-to-br from-[#0F0F0C] via-[#15140F] to-[#1C1B16] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5C542] to-[#FFC83D] shadow-xl shadow-[#F5C542]/20 mb-4">
                        <TrendingUp className="w-8 h-8 text-[#15140F]" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-[#F5C542] to-[#FFD54F] bg-clip-text text-transparent">
                        Forgot Password?
                    </h1>
                    <p className="text-[#A1A1AA] mt-2">
                        Enter your email to receive a password reset link
                    </p>
                </div>

                <div className="bg-[#1C1B16] border border-[#2E2C24] rounded-2xl shadow-xl shadow-black/20 p-8">
                    {isSubmitted ? (
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <CheckCircle className="w-16 h-16 text-[#059669]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-[#FAFAFA]">Reset link sent!</h3>
                                <p className="text-[#A1A1AA] mt-2">
                                    We have sent a password reset link to<br />
                                    <span className="font-medium text-[#FAFAFA]">{email}</span>
                                </p>
                            </div>
                            <div className="text-sm text-[#71717A]">
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
                                <div className="p-4 rounded-lg bg-red-900/10 border border-red-900/20">
                                    <p className="text-sm text-red-500">{error}</p>
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
                                    className="inline-flex items-center text-sm text-[#71717A] hover:text-[#FAFAFA] transition-colors"
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
