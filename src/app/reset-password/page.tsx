'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { TrendingUp, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password) {
            setError('กรุณากรอกรหัสผ่านใหม่');
            return;
        }

        if (password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const supabase = createSupabaseBrowserClient();

            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                throw error;
            }

            setIsSuccess(true);
            // Redirect after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">เปลี่ยนรหัสผ่านสำเร็จ!</h3>
                    <p className="text-gray-600 mb-6">
                        รหัสผ่านของคุณได้รับการเปลี่ยนแปลงเรียบร้อยแล้ว<br />
                        กำลังนำคุณไปที่หน้าเข้าสู่ระบบ...
                    </p>
                    <Button
                        onClick={() => router.push('/login')}
                        className="w-full"
                    >
                        ไปที่หน้าเข้าสู่ระบบทันที
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl shadow-blue-500/30 mb-4">
                        <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        ตั้งรหัสผ่านใหม่
                    </h1>
                    <p className="text-gray-500 mt-2">
                        กรุณากรอกรหัสผ่านใหม่ที่คุณต้องการใช้งาน
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <Input
                            label="รหัสผ่านใหม่"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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

                        <Input
                            label="ยืนยันรหัสผ่านใหม่"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            leftIcon={<Lock className="w-4 h-4" />}
                            rightIcon={
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="focus:outline-none"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            }
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={isLoading}
                        >
                            บันทึกรหัสผ่านใหม่
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
