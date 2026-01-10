'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { Lock, Bell, Shield, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        priceAlert: true,
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
            return;
        }

        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จ' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
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
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500">จัดการการตั้งค่าบัญชีของคุณ</p>
                </div>

                {/* Password Change */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            เปลี่ยนรหัสผ่าน
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
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
                                label="รหัสผ่านปัจจุบัน"
                                type={showPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                leftIcon={<Lock className="w-4 h-4" />}
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                }
                            />

                            <Input
                                label="รหัสผ่านใหม่"
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                leftIcon={<Lock className="w-4 h-4" />}
                            />

                            <Input
                                label="ยืนยันรหัสผ่านใหม่"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                leftIcon={<Lock className="w-4 h-4" />}
                            />

                            <Button type="submit" isLoading={isLoading}>
                                เปลี่ยนรหัสผ่าน
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            การแจ้งเตือน
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                            <div>
                                <p className="font-medium text-gray-900">แจ้งเตือนทางอีเมล</p>
                                <p className="text-sm text-gray-500">รับข่าวสารและอัปเดตทางอีเมล</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.email}
                                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                            <div>
                                <p className="font-medium text-gray-900">Push Notification</p>
                                <p className="text-sm text-gray-500">รับการแจ้งเตือนบนเบราว์เซอร์</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.push}
                                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                            <div>
                                <p className="font-medium text-gray-900">แจ้งเตือนราคา</p>
                                <p className="text-sm text-gray-500">แจ้งเตือนเมื่อราคาถึงเป้าหมาย</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.priceAlert}
                                    onChange={(e) => setNotifications({ ...notifications, priceAlert: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            ความปลอดภัย
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                            <p className="text-sm text-blue-700">
                                บัญชีของคุณมีการป้องกันด้วย JWT Authentication
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
