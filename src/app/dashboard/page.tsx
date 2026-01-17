'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import InvestmentDashboard from '@/components/dashboard/InvestmentDashboard';
import ExpenseDashboard from '@/components/dashboard/ExpenseDashboard';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/lib/store';
import { useTranslation } from '@/lib/useTranslation';
import { TrendingUp, Wallet } from 'lucide-react';

type Tab = 'investment' | 'expense';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<Tab>('investment');
    const { enableInvestment, enableExpense } = useSettingsStore();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Effect to enforce valid tab selection when toggles change
    React.useEffect(() => {
        if (!mounted) return;

        if (activeTab === 'investment' && !enableInvestment) {
            if (enableExpense) setActiveTab('expense');
            else setActiveTab('expense'); // Fallback, though both disabled is filtered later
        } else if (activeTab === 'expense' && !enableExpense) {
            if (enableInvestment) setActiveTab('investment');
        }
    }, [enableInvestment, enableExpense, activeTab, mounted]);

    if (!mounted) return null;

    // Determine what to show
    const showInvestment = enableInvestment;
    const showExpense = enableExpense;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Main Header with Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#FAFAFA]">{t('common.dashboard')}</h1>
                        <p className="text-[#A1A1AA]">{t('dashboard.welcome')}</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-[#1C1B16] border border-[#2E2C24] rounded-xl self-start">
                        {showInvestment && (
                            <button
                                onClick={() => setActiveTab('investment')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                    activeTab === 'investment'
                                        ? "bg-[#F5C542] text-[#15140F] shadow-sm"
                                        : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#2E2C24]"
                                )}
                            >
                                <TrendingUp className="w-4 h-4" />
                                {t('common.investment')}
                            </button>
                        )}
                        {showExpense && (
                            <button
                                onClick={() => setActiveTab('expense')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                    activeTab === 'expense'
                                        ? "bg-[#F5C542] text-[#15140F] shadow-sm"
                                        : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#2E2C24]"
                                )}
                            >
                                <Wallet className="w-4 h-4" />
                                {t('common.expense')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[500px]">
                    {!showInvestment && !showExpense ? (
                        <div className="flex flex-col items-center justify-center py-20 text-[#71717A]">
                            <p>{t('dashboard.disabledModules')}</p>
                            <p className="text-sm">{t('dashboard.enableInSettings')}</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'investment' && showInvestment && <InvestmentDashboard />}
                            {activeTab === 'expense' && showExpense && <ExpenseDashboard />}
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
