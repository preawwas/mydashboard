'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { useAuthStore } from '@/lib/store';
import { User, Mail, Save, Camera, Lock, Bell, Shield, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
    const { user, setUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Settings State
    const [showPassword, setShowPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSettingsLoading, setIsSettingsLoading] = useState(false);
    const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        priceAlert: true,
    });

    // Handlers
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileLoading(true);
        setProfileMessage(null);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setUser({ ...user!, name: profileData.name });
            setProfileMessage({ type: 'success', text: 'บันทึกข้อมูลสำเร็จ' });
        } catch {
            setProfileMessage({ type: 'error', text: 'เกิดข้อผิดพลาด กรุณาลองใหม่' });
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingsMessage(null);

        if (newPassword !== confirmPassword) {
            setSettingsMessage({ type: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' });
            return;
        }
        if (newPassword.length < 6) {
            setSettingsMessage({ type: 'error', text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
            return;
        }

        setIsSettingsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSettingsMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จ' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            setSettingsMessage({ type: 'error', text: 'เกิดข้อผิดพลาด กรุณาลองใหม่' });
        } finally {
            setIsSettingsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-[#FAFAFA]">Settings</h1>
                    <p className="text-[#A1A1AA]">จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#2E2C24]">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'profile'
                            ? 'border-[#F5C542] text-[#F5C542]'
                            : 'border-transparent text-[#A1A1AA] hover:text-[#FAFAFA]'
                            }`}
                    >
                        ข้อมูลส่วนตัว
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'account'
                            ? 'border-[#F5C542] text-[#F5C542]'
                            : 'border-transparent text-[#A1A1AA] hover:text-[#FAFAFA]'
                            }`}
                    >
                        ความปลอดภัยและการแจ้งเตือน
                    </button>
                </div>

                {activeTab === 'profile' ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Profile Card */}
                        <Card variant="gradient">
                            <CardContent>
                                <div className="flex flex-col items-center py-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F5C542] to-[#FFC83D] flex items-center justify-center text-[#15140F] text-3xl font-bold shadow-xl shadow-[#F5C542]/20">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <button className="absolute bottom-0 right-0 p-2 bg-[#2E2C24] rounded-full shadow-lg border border-[#3E3C32] hover:bg-[#3E3C32] transition-colors">
                                            <Camera className="w-4 h-4 text-[#A1A1AA]" />
                                        </button>
                                    </div>
                                    <h2 className="mt-4 text-xl font-semibold text-[#FAFAFA]">{user?.name || 'User'}</h2>
                                    <p className="text-[#A1A1AA]">{user?.email}</p>
                                    <span className="mt-2 px-3 py-1 rounded-full bg-[#2E2C24] text-[#F5C542] border border-[#F5C542]/20 text-sm font-medium">
                                        {user?.role === 'admin' ? 'Admin' : 'User'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Edit Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#FAFAFA]">แก้ไขข้อมูล</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileSubmit} className="space-y-4">
                                    {profileMessage && (
                                        <div
                                            className={`p-4 rounded-lg ${profileMessage.type === 'success'
                                                ? 'bg-[#059669]/10 text-[#059669] border border-[#059669]/20'
                                                : 'bg-red-900/10 text-red-500 border border-red-900/20'
                                                }`}
                                        >
                                            {profileMessage.text}
                                        </div>
                                    )}

                                    <Input
                                        label="ชื่อ"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        leftIcon={<User className="w-4 h-4" />}
                                    />

                                    <Input
                                        label="อีเมล"
                                        value={profileData.email}
                                        disabled
                                        leftIcon={<Mail className="w-4 h-4" />}
                                        helperText="ไม่สามารถเปลี่ยนอีเมลได้"
                                    />

                                    <div className="pt-4">
                                        <Button type="submit" isLoading={isProfileLoading} leftIcon={<Save className="w-4 h-4" />}>
                                            บันทึกข้อมูล
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Password Change */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#FAFAFA]">
                                    <Lock className="w-5 h-5 text-[#F5C542]" />
                                    เปลี่ยนรหัสผ่าน
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    {settingsMessage && (
                                        <div
                                            className={`p-4 rounded-lg ${settingsMessage.type === 'success'
                                                ? 'bg-[#059669]/10 text-[#059669] border border-[#059669]/20'
                                                : 'bg-red-900/10 text-red-500 border border-red-900/20'
                                                }`}
                                        >
                                            {settingsMessage.text}
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
                                                className="focus:outline-none text-[#A1A1AA] hover:text-[#FAFAFA]"
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

                                    <Button type="submit" isLoading={isSettingsLoading}>
                                        เปลี่ยนรหัสผ่าน
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Notifications */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#FAFAFA]">
                                    <Bell className="w-5 h-5 text-[#F5C542]" />
                                    การแจ้งเตือน
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-[#2E2C24]/50 border border-[#2E2C24]">
                                    <div>
                                        <p className="font-medium text-[#FAFAFA]">แจ้งเตือนทางอีเมล</p>
                                        <p className="text-sm text-[#A1A1AA]">รับข่าวสารและอัปเดตทางอีเมล</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications.email}
                                            onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-[#3E3C32] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F5C542]/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F5C542]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg bg-[#2E2C24]/50 border border-[#2E2C24]">
                                    <div>
                                        <p className="font-medium text-[#FAFAFA]">Push Notification</p>
                                        <p className="text-sm text-[#A1A1AA]">รับการแจ้งเตือนบนเบราว์เซอร์</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications.push}
                                            onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-[#3E3C32] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F5C542]/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F5C542]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg bg-[#2E2C24]/50 border border-[#2E2C24]">
                                    <div>
                                        <p className="font-medium text-[#FAFAFA]">แจ้งเตือนราคา</p>
                                        <p className="text-sm text-[#A1A1AA]">แจ้งเตือนเมื่อราคาถึงเป้าหมาย</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications.priceAlert}
                                            onChange={(e) => setNotifications({ ...notifications, priceAlert: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-[#3E3C32] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F5C542]/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F5C542]"></div>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#FAFAFA]">
                                    <Shield className="w-5 h-5 text-[#F5C542]" />
                                    ความปลอดภัย
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 rounded-lg bg-[#F5C542]/10 border border-[#F5C542]/20">
                                    <p className="text-sm text-[#F5C542]">
                                        บัญชีของคุณมีการป้องกันด้วย JWT Authentication
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
