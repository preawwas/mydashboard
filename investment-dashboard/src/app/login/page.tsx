'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/lib/store';
import { TrendingUp, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(() => {
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

    const { setUser, setToken } = useAuthStore();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl shadow-blue-500/30 mb-4">
                        <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        InvestPro
                    </h1>
                    <p className="text-gray-500 mt-2">เข้าสู่ระบบเพื่อจัดการพอร์ตการลงทุน</p>
                </div>

                {/* Success Message for Registration */}
                {showSuccessMessage && (
                    <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3 transition-all duration-500 ease-in-out">
                        <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-green-800">สมัครสมาชิกสำเร็จ!</h3>
                            <p className="text-sm text-green-700 mt-1">
                                กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันตัวตนก่อนเข้าสู่ระบบ
                            </p>
                        </div>
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errors.submit && (
                            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                <p className="text-sm text-red-600">{errors.submit}</p>
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
                                    className="focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            }
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-600">จดจำฉัน</span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
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
                        <p className="text-sm text-gray-600">
                            ยังไม่มีบัญชี?{' '}
                            <Link
                                href="/register"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                สมัครสมาชิก
                            </Link>
                        </p>
                    </div>

                    {/* Demo Credentials */}

                </div>
            </div>
        </div>
    );
}
