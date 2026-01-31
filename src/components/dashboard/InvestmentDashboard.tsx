'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { TrendingUp, BarChart3, PieChart, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { PortfolioSummary } from '@/types';
import { useTranslation } from '@/lib/useTranslation';
import { apiClient } from '@/lib/api-client';

export default function InvestmentDashboard() {
    const { token } = useAuthStore();
    const { t } = useTranslation();
    const [stats, setStats] = useState<PortfolioSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;

            try {
                const response = await apiClient.fetch('/api/dashboard/stats');
                const data = await response.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 2
        }).format(value);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-xl font-semibold text-[#FAFAFA] mb-2">{t('common.investment')}</h2>
                <p className="text-[#A1A1AA]">{t('dashboard.welcome')}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <QuickStatCard
                    title={t('common.totalBalance')}
                    value={loading ? "..." : formatCurrency(stats?.totalValue || 0)}
                    change={!loading && stats?.totalProfitLoss ? `${stats.totalProfitLoss > 0 ? '+' : ''}${formatCurrency(stats.totalProfitLoss)}` : undefined}
                    icon={<BarChart3 className="w-6 h-6" />}
                    color="blue"
                    loading={loading}
                />
                <QuickStatCard
                    title={t('common.totalProfit')}
                    value={loading ? "..." : formatCurrency(stats?.totalProfitLoss || 0)}
                    change={!loading && stats?.profitLossPercentage ? `${stats.profitLossPercentage > 0 ? '+' : ''}${stats.profitLossPercentage.toFixed(2)}%` : undefined}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="green"
                    loading={loading}
                />
                <QuickStatCard
                    title={t('common.totalAssets')}
                    value={loading ? "..." : (stats?.totalAssets || 0).toString()}
                    subtitle={t('common.items')}
                    icon={<PieChart className="w-6 h-6" />}
                    color="purple"
                    loading={loading}
                />
                <QuickStatCard
                    title={t('common.openPositions')}
                    value={loading ? "..." : (stats?.openPositions || 0).toString()}
                    subtitle={t('common.items')}
                    icon={<Target className="w-6 h-6" />}
                    color="orange"
                    loading={loading}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card variant="gradient">
                    <CardHeader>
                        <CardTitle>{t('common.started')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-[#A1A1AA]">
                            {t('dashboard.investmentIntro')}
                        </p>
                        <Link
                            href="/dashboard/investments"
                            className="inline-flex items-center gap-2 text-[#F5C542] hover:text-[#FFC83D] font-medium"
                        >
                            {t('dashboard.goToInvestment')}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </CardContent>
                </Card>

                <Card variant="gradient">
                    <CardHeader>
                        <CardTitle>{t('dashboard.mainFeatures')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-[#A1A1AA]">
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                {t('dashboard.trackAssets')}
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                {t('dashboard.recordHistory')}
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                                {t('dashboard.analyzePortfolio')}
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                {t('dashboard.calculateProfit')}
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

interface QuickStatCardProps {
    title: string;
    value: string;
    change?: string;
    subtitle?: string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange';
    loading?: boolean;
}

function QuickStatCard({ title, value, change, subtitle, icon, color, loading }: QuickStatCardProps) {
    const colorMap = {
        blue: 'from-blue-600 to-blue-700 shadow-blue-500/20 text-white',
        green: 'from-emerald-600 to-emerald-700 shadow-emerald-500/20 text-white',
        purple: 'from-purple-600 to-purple-700 shadow-purple-500/20 text-white',
        orange: 'from-[#F5C542] to-[#FFC83D] shadow-[#F5C542]/20 text-[#15140F]',
    };

    return (
        <Card className="relative overflow-hidden">
            <CardContent className="flex items-center gap-4">
                <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]} shadow-lg`}
                >
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-[#A1A1AA]">{title}</p>
                    {loading ? (
                        <div className="h-8 w-24 bg-[#2E2C24] animate-pulse rounded mt-1"></div>
                    ) : (
                        <p className="text-2xl font-bold text-[#FAFAFA]">{value}</p>
                    )}

                    {!loading && change && (
                        <p className={`text-sm ${change.startsWith('+') ? 'text-[#059669]' : change.startsWith('-') ? 'text-red-500' : 'text-[#A1A1AA]'}`}>
                            {change}
                        </p>
                    )}
                    {!loading && subtitle && <p className="text-sm text-[#A1A1AA]">{subtitle}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
