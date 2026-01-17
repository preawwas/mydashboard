'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import InvestmentDashboard from '@/components/dashboard/InvestmentDashboard';
import ExpenseDashboard from '@/components/dashboard/ExpenseDashboard';
import { cn } from '@/lib/utils';
import { TrendingUp, Wallet } from 'lucide-react';

type Tab = 'investment' | 'expense';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<Tab>('investment');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Main Header with Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#FAFAFA]">Dashboard</h1>
                        <p className="text-[#A1A1AA]">Welcome back, here's what's happening today.</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-[#1C1B16] border border-[#2E2C24] rounded-xl self-start">
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
                            Investment
                        </button>
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
                            Expense
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[500px]">
                    {activeTab === 'investment' ? (
                        <InvestmentDashboard />
                    ) : (
                        <ExpenseDashboard />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
