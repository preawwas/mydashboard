'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Settings, ToggleLeft, ToggleRight, Shield, CreditCard, PieChart, Languages } from 'lucide-react';
import { useSettingsStore, useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/useTranslation';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    // Hydration fix: ensure store is loaded on client
    const [mounted, setMounted] = useState(false);
    const { enableInvestment, enableExpense, toggleInvestment, toggleExpense } = useSettingsStore();
    const { language, setLanguage } = useLanguageStore();
    const { t } = useTranslation();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-[#FAFAFA] flex items-center gap-2">
                        <Settings className="w-6 h-6 text-[#F5C542]" />
                        {t('settings.title')}
                    </h1>
                    <p className="text-sm text-[#A1A1AA]">{t('settings.subtitle')}</p>
                </div>

                {/* Feature Toggles Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#F5C542]" />
                            {t('settings.featureManagement')}
                        </CardTitle>
                        <p className="text-xs text-[#A1A1AA] mt-1">
                            {t('settings.featureDesc')}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Investment Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#1C1B16] border border-[#2E2C24]">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-3 rounded-lg transition-colors",
                                    enableInvestment ? "bg-[#F5C542]/10 text-[#F5C542]" : "bg-[#2E2C24] text-[#71717A]"
                                )}>
                                    <PieChart className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#FAFAFA]">{t('settings.investmentTitle')}</h3>
                                    <p className="text-xs text-[#A1A1AA]">{t('settings.investmentDesc')}</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleInvestment}
                                className={cn(
                                    "transition-all duration-300",
                                    enableInvestment ? "text-[#F5C542]" : "text-[#71717A]"
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
                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#1C1B16] border border-[#2E2C24]">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-3 rounded-lg transition-colors",
                                    enableExpense ? "bg-[#F5C542]/10 text-[#F5C542]" : "bg-[#2E2C24] text-[#71717A]"
                                )}>
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#FAFAFA]">{t('settings.expenseTitle')}</h3>
                                    <p className="text-xs text-[#A1A1AA]">{t('settings.expenseDesc')}</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleExpense}
                                className={cn(
                                    "transition-all duration-300",
                                    enableExpense ? "text-[#F5C542]" : "text-[#71717A]"
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

                {/* Feature Toggles Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Languages className="w-5 h-5 text-[#F5C542]" />
                            {t('settings.language')}
                        </CardTitle>
                        <p className="text-xs text-[#A1A1AA] mt-1">
                            {t('settings.languageDesc')}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Language Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#1C1B16] border border-[#2E2C24]">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-3 rounded-lg transition-colors",
                                    "bg-[#F5C542]/10 text-[#F5C542]"
                                )}>
                                    <Languages className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#FAFAFA]">
                                        {language === 'en' ? 'English' : 'Thai'}
                                    </h3>
                                    <p className="text-xs text-[#A1A1AA]">
                                        {language === 'en' ? 'English Language' : 'ภาษาไทย'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-[#0F0F0C] p-1 rounded-lg border border-[#2E2C24]">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={cn(
                                        "px-3 py-1.5 rounded text-xs font-bold transition-all",
                                        language === 'en'
                                            ? "bg-[#F5C542] text-[#15140F]"
                                            : "text-[#71717A] hover:text-[#FAFAFA]"
                                    )}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => setLanguage('th')}
                                    className={cn(
                                        "px-3 py-1.5 rounded text-xs font-bold transition-all",
                                        language === 'th'
                                            ? "bg-[#F5C542] text-[#15140F]"
                                            : "text-[#71717A] hover:text-[#FAFAFA]"
                                    )}
                                >
                                    TH
                                </button>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
