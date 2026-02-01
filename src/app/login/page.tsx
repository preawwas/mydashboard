'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Loading } from '@/components/ui';
import { useAuthStore } from '@/lib/store';
import { TrendingUp, Mail, Lock, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
            newErrors.email = 'กรุณากรอกอีเมล';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
        }

        if (!formData.password) {
            newErrors.password = 'กรุณากรอกรหัสผ่าน';
        } else if (formData.password.length < 6) {
            newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({ submit: data.error || 'เข้าสู่ระบบไม่สำเร็จ' });
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
            router.push('/dashboard');
        } catch {
            setErrors({ submit: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F5C542] to-[#FFD54F] bg-clip-text text-transparent">
                    เข้าสู่ระบบ
                </h1>
                <p className="text-[#A1A1AA] mt-2">ระบบบริหารและจัดการข้อมูล</p>
            </div>

            {/* Success Message for Registration */}
            {showSuccessMessage && (
                <div className="mb-6 p-4 rounded-lg bg-[#059669]/10 border border-[#059669]/20 flex items-start gap-3 transition-all duration-500 ease-in-out">
                    <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
                        <svg className="w-5 h-5 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-[#059669]">สมัครสมาชิกสำเร็จ!</h3>
                        <p className="text-sm text-[#059669]/80 mt-1">
                            กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันตัวตนก่อนเข้าสู่ระบบ
                        </p>
                    </div>
                </div>
            )}

            {/* Form Card */}
            <div className="bg-[#1C1B16] border border-[#2E2C24] rounded-2xl shadow-xl shadow-black/20 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {errors.submit && (
                        <div className="p-4 rounded-lg bg-red-900/10 border border-red-900/20">
                            <p className="text-sm text-red-500">{errors.submit}</p>
                        </div>
                    )}

                    <Input
                        label="อีเมล"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        error={errors.email}
                        leftIcon={<Mail className="w-4 h-4" />}
                    />

                    <Input
                        label="รหัสผ่าน"
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
                                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C542] rounded text-[#71717A] hover:text-[#FAFAFA] transition-colors"
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
                                className="w-4 h-4 rounded border-[#3E3C32] bg-[#1C1B16] text-[#F5C542] focus:ring-[#F5C542]"
                            />
                            <span className="text-sm text-[#A1A1AA]">จดจำฉัน</span>
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-sm text-[#F5C542] hover:text-[#FFC83D] font-medium"
                        >
                            ลืมรหัสผ่าน?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={isLoading}
                    >
                        เข้าสู่ระบบ
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-[#71717A]">
                        ยังไม่มีบัญชี?{' '}
                        <Link
                            href="/register"
                            className="text-[#F5C542] hover:text-[#FFC83D] font-medium"
                        >
                            สมัครสมาชิก
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
        <div className="min-h-screen bg-gradient-to-br from-[#0F0F0C] via-[#15140F] to-[#1C1B16] flex items-center justify-center p-4">
            <Suspense fallback={<Loading fullScreen text="Loading…" />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
