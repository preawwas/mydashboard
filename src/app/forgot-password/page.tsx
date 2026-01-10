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
            setError('กรุณากรอกอีเมล');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('รูปแบบอีเมลไม่ถูกต้อง');
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
            setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl shadow-blue-500/30 mb-4">
                        <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        ลืมรหัสผ่าน?
                    </h1>
                    <p className="text-gray-500 mt-2">
                        กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
                    {isSubmitted ? (
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <CheckCircle className="w-16 h-16 text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">ส่งลิงก์รีเซ็ตแล้ว!</h3>
                                <p className="text-gray-600 mt-2">
                                    เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปที่อีเมล<br />
                                    <span className="font-medium text-gray-900">{email}</span>
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">
                                หากไม่ได้รับอีเมล กรุณาตรวจสอบในโฟลเดอร์ขยะ (Spam/Junk)
                            </div>
                            <div className="pt-4">
                                <Link href="/login">
                                    <Button variant="outline" className="w-full">
                                        กลับไปหน้าเข้าสู่ระบบ
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <Input
                                label="อีเมล"
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
                                ส่งลิงก์รีเซ็ตรหัสผ่าน
                            </Button>

                            <div className="text-center mt-4">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    กลับไปหน้าเข้าสู่ระบบ
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
