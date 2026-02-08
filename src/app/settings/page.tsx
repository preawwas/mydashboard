'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { User, Mail, Save, Camera, Lock, Bell, Shield, Eye, EyeOff, Settings, PieChart, CreditCard, Languages, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuthStore, useSettingsStore, useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/useTranslation';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const { user, setUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'preferences'>('profile');
    const { enableInvestment, enableExpense, toggleInvestment, toggleExpense } = useSettingsStore();
    const { language, setLanguage } = useLanguageStore();
    const { t } = useTranslation();

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
                    <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground">จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'profile'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        ข้อมูลส่วนตัว
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'account'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        ความปลอดภัยและการแจ้งเตือน
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'preferences'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        การตั้งค่าทั่วไป
                    </button>
                </div>

                {activeTab === 'profile' ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Profile Card */}
                        <Card variant="gradient">
                            <CardContent>
                                <div className="flex flex-col items-center py-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-xl shadow-primary/20">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <button className="absolute bottom-0 right-0 p-2 bg-card rounded-full shadow-lg border border-border hover:bg-muted transition-colors">
                                            <Camera className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </div>
                                    <h2 className="mt-4 text-xl font-semibold text-foreground">{user?.name || 'User'}</h2>
                                    <p className="text-muted-foreground">{user?.email}</p>
                                    <span className="mt-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-primary/20 text-sm font-medium">
                                        {user?.role === 'admin' ? 'Admin' : 'User'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Edit Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-foreground">แก้ไขข้อมูล</CardTitle>
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
                ) : activeTab === 'account' ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Password Change */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <Lock className="w-5 h-5 text-primary" />
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
                                                className="focus:outline-none text-muted-foreground hover:text-foreground"
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
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <Bell className="w-5 h-5 text-primary" />
                                    การแจ้งเตือน
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border">
                                    <div>
                                        <p className="font-medium text-foreground">แจ้งเตือนทางอีเมล</p>
                                        <p className="text-sm text-muted-foreground">รับข่าวสารและอัปเดตทางอีเมล</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications.email}
                                            onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border">
                                    <div>
                                        <p className="font-medium text-foreground">Push Notification</p>
                                        <p className="text-sm text-muted-foreground">รับการแจ้งเตือนบนเบราว์เซอร์</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications.push}
                                            onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border">
                                    <div>
                                        <p className="font-medium text-foreground">แจ้งเตือนราคา</p>
                                        <p className="text-sm text-muted-foreground">แจ้งเตือนเมื่อราคาถึงเป้าหมาย</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications.priceAlert}
                                            onChange={(e) => setNotifications({ ...notifications, priceAlert: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <Shield className="w-5 h-5 text-primary" />
                                    ความปลอดภัย
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                                    <p className="text-sm text-primary">
                                        บัญชีของคุณมีการป้องกันด้วย JWT Authentication
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Feature Toggles Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                                    <Settings className="w-5 h-5 text-primary" />
                                    {t('settings.featureManagement')}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('settings.featureDesc')}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Investment Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-3 rounded-lg transition-colors",
                                            enableInvestment ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                        )}>
                                            <PieChart className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">{t('settings.investmentTitle')}</h3>
                                            <p className="text-xs text-muted-foreground">{t('settings.investmentDesc')}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleInvestment}
                                        className={cn(
                                            "transition-all duration-300",
                                            enableInvestment ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {enableInvestment ? (
                                            <ToggleRight className="w-10 h-10" />
                                        ) : (
                                            <ToggleLeft className="w-10 h-10" />
                                        )}
                                    </button>
                                </div>

                                {/* Expense Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-3 rounded-lg transition-colors",
                                            enableExpense ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                        )}>
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">{t('settings.expenseTitle')}</h3>
                                            <p className="text-xs text-muted-foreground">{t('settings.expenseDesc')}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleExpense}
                                        className={cn(
                                            "transition-all duration-300",
                                            enableExpense ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {enableExpense ? (
                                            <ToggleRight className="w-10 h-10" />
                                        ) : (
                                            <ToggleLeft className="w-10 h-10" />
                                        )}
                                    </button>
                                </div>

                            </CardContent>
                        </Card>

                        {/* Language Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                                    <Languages className="w-5 h-5 text-primary" />
                                    {t('settings.language')}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('settings.languageDesc')}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Language Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-3 rounded-lg transition-colors",
                                            "bg-primary/10 text-primary"
                                        )}>
                                            <Languages className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">
                                                {language === 'en' ? 'English' : 'Thai'}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                {language === 'en' ? 'English Language' : 'ภาษาไทย'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-background p-1 rounded-lg border border-border">
                                        <button
                                            onClick={() => setLanguage('en')}
                                            className={cn(
                                                "px-3 py-1.5 rounded text-xs font-bold transition-all",
                                                language === 'en'
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            EN
                                        </button>
                                        <button
                                            onClick={() => setLanguage('th')}
                                            className={cn(
                                                "px-3 py-1.5 rounded text-xs font-bold transition-all",
                                                language === 'th'
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            TH
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
