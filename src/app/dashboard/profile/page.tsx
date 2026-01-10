'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { useAuthStore } from '@/lib/store';
import { User, Mail, Save, Camera } from 'lucide-react';

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setUser({ ...user!, name: formData.name });
            setMessage({ type: 'success', text: 'บันทึกข้อมูลสำเร็จ' });
        } catch {
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด กรุณาลองใหม่' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-500">จัดการข้อมูลส่วนตัวของคุณ</p>
                </div>

                {/* Profile Card */}
                <Card variant="gradient">
                    <CardContent>
                        <div className="flex flex-col items-center py-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                    <Camera className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">{user?.name || 'User'}</h2>
                            <p className="text-gray-500">{user?.email}</p>
                            <span className="mt-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                {user?.role === 'admin' ? 'Admin' : 'User'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>แก้ไขข้อมูล</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {message && (
                                <div
                                    className={`p-4 rounded-lg ${message.type === 'success'
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}
                                >
                                    {message.text}
                                </div>
                            )}

                            <Input
                                label="ชื่อ"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                leftIcon={<User className="w-4 h-4" />}
                            />

                            <Input
                                label="อีเมล"
                                value={formData.email}
                                disabled
                                leftIcon={<Mail className="w-4 h-4" />}
                                helperText="ไม่สามารถเปลี่ยนอีเมลได้"
                            />

                            <div className="pt-4">
                                <Button type="submit" isLoading={isLoading} leftIcon={<Save className="w-4 h-4" />}>
                                    บันทึกข้อมูล
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
