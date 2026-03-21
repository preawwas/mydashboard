'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { TrendingUp, BarChart3, PieChart, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { PortfolioSummary } from '@/types';
import { apiClient } from '@/lib/api-client';

export default function InvestmentDashboard() {
    const { token } = useAuthStore();
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
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-[#FAFAFA]">Investment</h2>
                    <span className="text-lg">{'\u{1F4CA}'}</span>
                </div>
                <p className="text-[#A1A1AA] text-sm">Track your portfolio performance</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <QuickStatCard
                    title="Total Portfolio Value"
                    value={loading ? "..." : formatCurrency(stats?.totalValue || 0)}
                    change={!loading && stats?.totalProfitLoss ? `${stats.totalProfitLoss > 0 ? '+' : ''}${formatCurrency(stats.totalProfitLoss)}` : undefined}
                    icon={<BarChart3 className="w-6 h-6" />}
                    color="blue"
                    emoji={'\u{1F48E}'}
                    loading={loading}
                />
                <QuickStatCard
                    title="Total Profit/Loss"
                    value={loading ? "..." : formatCurrency(stats?.totalProfitLoss || 0)}
                    change={!loading && stats?.profitLossPercentage ? `${stats.profitLossPercentage > 0 ? '+' : ''}${stats.profitLossPercentage.toFixed(2)}%` : undefined}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="green"
                    emoji={'\u{1F4C8}'}
                    loading={loading}
                />
                <QuickStatCard
                    title="Total Assets"
                    value={loading ? "..." : (stats?.totalAssets || 0).toString()}
                    subtitle="Items"
                    icon={<PieChart className="w-6 h-6" />}
                    color="purple"
                    emoji={'\u2728'}
                    loading={loading}
                />
                <QuickStatCard
                    title="Open Positions"
                    value={loading ? "..." : (stats?.openPositions || 0).toString()}
                    subtitle="Items"
                    icon={<Target className="w-6 h-6" />}
                    color="orange"
                    emoji={'\u{1F3AF}'}
                    loading={loading}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card variant="gradient" className="card-hover">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CardTitle>Get Started</CardTitle>
                            <span>{'\u{1F680}'}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-[#A1A1AA]">
                            Start adding investments to see allocation.
                        </p>
                        <Link
                            href="/dashboard/investments"
                            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium group"
                        >
                            Go to Investment
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </CardContent>
                </Card>

                <Card variant="gradient" className="card-hover">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CardTitle>Main Features</CardTitle>
                            <span>{'\u{1F4A1}'}</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-[#A1A1AA]">
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                Track your assets
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Record history
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                                Analyze portfolio
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                Calculate profit
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
    emoji?: string;
    loading?: boolean;
}

function QuickStatCard({ title, value, change, subtitle, icon, color, emoji, loading }: QuickStatCardProps) {
    const colorMap = {
        blue: 'from-blue-600 to-blue-700 shadow-blue-500/20 text-white',
        green: 'from-emerald-600 to-emerald-700 shadow-emerald-500/20 text-white',
        purple: 'from-teal-600 to-teal-700 shadow-teal-500/20 text-white',
        orange: 'from-[#FF8F80] to-[#FFB3A7] shadow-[#FF8F80]/20 text-white',
    };

    return (
        <Card className="relative overflow-hidden hover-lift card-hover group">
            <CardContent className="flex items-center gap-4">
                <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]} shadow-lg transition-transform group-hover:scale-105`}
                >
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="text-sm text-[#A1A1AA]">{title}</p>
                    {loading ? (
                        <div className="h-8 w-24 bg-[#2E2C24] animate-pulse rounded mt-1"></div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-[#FAFAFA]">{value}</p>
                            {emoji && <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">{emoji}</span>}
                        </div>
                    )}

                    {!loading && change && (
                        <p className={`text-sm ${change.startsWith('+') ? 'text-[#059669]' : change.startsWith('-') ? 'text-red-500' : 'text-[#A1A1AA]'}`}>
                            {change} {change.startsWith('+') && '\u{1F389}'}
                        </p>
                    )}
                    {!loading && subtitle && <p className="text-sm text-[#A1A1AA]">{subtitle}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

