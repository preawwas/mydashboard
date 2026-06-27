'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { User, Mail, Save, Camera, Lock, Bell, Shield, Eye, EyeOff, Settings, PieChart, CreditCard, ToggleLeft, ToggleRight, Heart, Plus, Trash2, Image as ImageIcon, Smile, LayoutDashboard, Map, StickyNote, LayoutGrid } from 'lucide-react';
import { useAuthStore, useSettingsStore } from '@/lib/store';
import { APP_MODE_LABELS, FEATURE_CONFIG, type FeatureKey } from '@/lib/feature-modes';
import { cn } from '@/lib/utils';
import { EmojiPicker } from '@/components/EmojiPicker';

export default function SettingsPage() {
    const { user, setUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'preferences'>('profile');
    const {
        activeMode,
        personalFeatures,
        setActiveMode,
        togglePersonalFeature,
    } = useSettingsStore();
    const { valentineEnabled, valentineItems, setValentineEnabled, setValentineItems } = useSettingsStore();

    const featureIcons: Record<FeatureKey, React.ComponentType<{ className?: string }>> = {
        dashboard: LayoutDashboard,
        investment: PieChart,
        expense: CreditCard,
        journey: Map,
        quickNotes: StickyNote,
    };

    const [newItem, setNewItem] = useState({ type: 'emoji' as 'emoji' | 'image', value: '' });
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);


    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        setProfileData({
            name: user?.name || '',
            email: user?.email || '',
        });
    }, [user?.name, user?.email]);

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
            const token = useAuthStore.getState().token;
            if (!token) {
                setProfileMessage({ type: 'error', text: 'Session expired. Please login again.' });
                return;
            }

            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name: profileData.name }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setProfileMessage({ type: 'error', text: data.error || 'An error occurred. Please try again.' });
                return;
            }

            setUser(data.user);
            setProfileMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch {
            setProfileMessage({ type: 'error', text: 'Connection error. Please try again.' });
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingsMessage(null);

        if (!currentPassword) {
            setSettingsMessage({ type: 'error', text: 'Please enter your current password' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setSettingsMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        if (newPassword.length < 6) {
            setSettingsMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setIsSettingsLoading(true);
        try {
            const token = useAuthStore.getState().token;
            if (!token) {
                setSettingsMessage({ type: 'error', text: 'Session expired. Please login again.' });
                return;
            }

            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSettingsMessage({ type: 'success', text: 'Password changed successfully' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setSettingsMessage({ type: 'error', text: data.error || 'An error occurred. Please try again.' });
            }
        } catch {
            setSettingsMessage({ type: 'error', text: 'Connection error. Please try again.' });
        } finally {
            setIsSettingsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-foreground">Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage your profile and account settings.</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border overflow-x-auto scrollbar-hide -webkit-overflow-scrolling-touch">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 md:px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'profile'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`px-4 md:px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'account'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Security
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`px-4 md:px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'preferences'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        General
                    </button>
                </div>

                {activeTab === 'profile' ? (
                    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                                <CardTitle className="text-foreground">Edit Profile</CardTitle>
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
                                        label="Name"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        leftIcon={<User className="w-4 h-4" />}
                                    />

                                    <Input
                                        label="Email"
                                        value={profileData.email}
                                        disabled
                                        leftIcon={<Mail className="w-4 h-4" />}
                                        helperText="Email cannot be changed"
                                    />

                                    <div className="pt-4">
                                        <Button type="submit" isLoading={isProfileLoading} leftIcon={<Save className="w-4 h-4" />} className="w-full md:w-auto">
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                ) : activeTab === 'account' ? (
                    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Password Change */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <Lock className="w-5 h-5 text-primary" />
                                    Change Password
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
                                        label="Current Password"
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
                                        label="New Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        leftIcon={<Lock className="w-4 h-4" />}
                                    />

                                    <Input
                                        label="Confirm New Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        leftIcon={<Lock className="w-4 h-4" />}
                                    />

                                    <Button type="submit" isLoading={isSettingsLoading} className="w-full md:w-auto">
                                        Change Password
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Notifications */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <Bell className="w-5 h-5 text-primary" />
                                    Notifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border">
                                    <div>
                                        <p className="font-medium text-foreground">Email Notifications</p>
                                        <p className="text-sm text-muted-foreground">Receive news and updates via email</p>
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
                                        <p className="font-medium text-foreground">Push Notifications</p>
                                        <p className="text-sm text-muted-foreground">Receive browser notifications</p>
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
                                        <p className="font-medium text-foreground">Price Alerts</p>
                                        <p className="text-sm text-muted-foreground">Notify when price reaches target</p>
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
                                    Security
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                                    <p className="text-sm text-primary">
                                        Your account is protected with JWT Authentication
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Feature Mode Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                                    <Settings className="w-5 h-5 text-primary" />
                                    Feature Mode
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Choose which menus appear in the app. Switch modes anytime from the top bar.
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col sm:flex-row gap-2 p-1 bg-muted/30 border border-border/50 rounded-2xl">
                                    {(['all', 'personal'] as const).map((mode) => {
                                        const Icon = mode === 'all' ? LayoutGrid : User;
                                        const isActive = activeMode === mode;
                                        return (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setActiveMode(mode)}
                                                className={cn(
                                                    'flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 transition-all',
                                                    isActive
                                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                                        : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <div className="text-left">
                                                    <p className="text-sm font-bold">{APP_MODE_LABELS[mode].title}</p>
                                                    <p className={cn('text-[10px] font-medium', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                                                        {APP_MODE_LABELS[mode].description}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {activeMode === 'all' && (
                                    <div className="rounded-xl border border-border bg-primary/5 p-4">
                                        <p className="text-sm font-bold text-foreground">All mode is active</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Dashboard, Investment, Expense, Journey, and Quick Notes are all visible.
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Personal mode menus</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Choose which features appear when you switch to Personal mode in the top bar.
                                        </p>
                                    </div>
                                    {FEATURE_CONFIG.map((feature) => {
                                            const Icon = featureIcons[feature.key];
                                            const enabled = personalFeatures[feature.key];
                                            return (
                                                <div key={feature.key} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            'p-3 rounded-lg transition-colors',
                                                            enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                                        )}>
                                                            <Icon className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold text-foreground">{feature.label}</h3>
                                                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePersonalFeature(feature.key)}
                                                        className={cn(
                                                            'transition-all duration-300',
                                                            enabled ? 'text-primary' : 'text-muted-foreground'
                                                        )}
                                                        aria-label={`Toggle ${feature.label} in personal mode`}
                                                    >
                                                        {enabled ? (
                                                            <ToggleRight className="w-10 h-10" />
                                                        ) : (
                                                            <ToggleLeft className="w-10 h-10" />
                                                        )}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Theme Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                                    <Heart className="w-5 h-5 text-pink-500" />
                                    Theme
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Effect Settings
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Theme Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-3 rounded-lg transition-colors",
                                            valentineEnabled ? "bg-pink-100 text-pink-500" : "bg-muted text-muted-foreground"
                                        )}>
                                            <Heart className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Enable Theme</h3>
                                            <p className="text-xs text-muted-foreground">Show effects across the screen</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setValentineEnabled(!valentineEnabled)}
                                        className={cn(
                                            "transition-all duration-300",
                                            valentineEnabled ? "text-pink-500" : "text-muted-foreground"
                                        )}
                                    >
                                        {valentineEnabled ? (
                                            <ToggleRight className="w-10 h-10" />
                                        ) : (
                                            <ToggleLeft className="w-10 h-10" />
                                        )}
                                    </button>
                                </div>

                                {/* Items Editor */}
                                {valentineEnabled && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-foreground">Icon List</h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground">{valentineItems.length} items</span>
                                                {valentineItems.length > 0 && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Do you want to delete all icons?')) {
                                                                setValentineItems([]);
                                                            }
                                                        }}
                                                        className="text-[10px] text-red-400 hover:text-red-500 transition-colors uppercase font-bold"
                                                    >
                                                        Clear All
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Add New Item */}
                                        <div className="flex gap-2 relative">
                                            <div className="flex-1 flex gap-2">
                                                <select
                                                    value={newItem.type}
                                                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value as 'emoji' | 'image' })}
                                                    className="bg-background border border-border rounded-lg px-2 text-xs focus:ring-2 focus:ring-primary/50 outline-none"
                                                >
                                                    <option value="emoji">Emoji</option>
                                                    <option value="image">URL</option>
                                                </select>

                                                {newItem.type === 'emoji' ? (
                                                    <div className="relative flex-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                            className="w-full flex items-center justify-between bg-background border border-border rounded-lg px-3 h-9 text-sm text-left hover:border-primary/50 transition-colors"
                                                        >
                                                            <span className={newItem.value ? "text-foreground" : "text-muted-foreground"}>
                                                                {newItem.value || "Select emoji..."}
                                                            </span>
                                                            <Smile className="w-4 h-4 text-muted-foreground" />
                                                        </button>

                                                        {showEmojiPicker && (
                                                            <div className="absolute top-10 left-0 z-[100]">
                                                                <EmojiPicker
                                                                    onSelect={(emoji) => {
                                                                        setNewItem({ ...newItem, value: emoji });
                                                                        setShowEmojiPicker(false);
                                                                    }}
                                                                    onClose={() => setShowEmojiPicker(false)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Input
                                                        placeholder="Enter image URL..."
                                                        value={newItem.value}
                                                        onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                                                        className="h-9 text-sm"
                                                    />
                                                )}
                                            </div>
                                            <Button
                                                size="sm"
                                                disabled={!newItem.value.trim()}
                                                className={cn(
                                                    "h-9 transition-all",
                                                    newItem.value.trim() ? "bg-pink-500 hover:bg-pink-600" : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                                                )}
                                                onClick={() => {
                                                    if (newItem.value.trim()) {
                                                        const isAlreadyAdded = valentineItems.some(i => i.value === newItem.value.trim());
                                                        if (!isAlreadyAdded) {
                                                            setValentineItems([...valentineItems, { type: newItem.type, value: newItem.value.trim() }]);
                                                        }
                                                        setNewItem({ ...newItem, value: '' });
                                                    }
                                                }}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>


                                        {/* Items List */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {valentineItems.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border group">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        {item.type === 'emoji' ? (
                                                            <span className="text-lg shrink-0">{item.value}</span>
                                                        ) : (
                                                            <div className="w-6 h-6 shrink-0 rounded bg-white flex items-center justify-center overflow-hidden">
                                                                <img src={item.value} alt={`Preview of ${item.type} decoration`} className="w-full h-full object-contain" />
                                                            </div>
                                                        )}
                                                        <span className="text-[10px] text-muted-foreground truncate">{item.value}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newItems = [...valentineItems];
                                                            newItems.splice(idx, 1);
                                                            setValentineItems(newItems);
                                                        }}
                                                        className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
