'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, DashboardSkeleton } from '@/components/ui';
import {
    TrendingUp, TrendingDown, Wallet, PiggyBank,
    ArrowUpRight, ArrowDownRight, ExternalLink
} from 'lucide-react';
import {
    ResponsiveContainer, PieChart, Pie, Cell,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useDashboardData } from '@/hooks';
import { useLoading } from '@/components/providers/LoadingProvider';

// Color palette for charts
const COLORS = {
    GOLD: '#F59E0B', // Amber 500
    CRYPTO: '#5FAFAF',
    STOCK: '#10B981',
    FUND: '#38A169',
    USD: '#FF8F80',
    OTHER: '#718096',
    expense: '#EF4444',
    income: '#22C55E'
};

// Fallback colors for unknown categories (preventing overlap with main COLORS)
const CATEGORY_COLORS = [
    '#3B82F6', // Blue
    '#FF7A6B', // Orange
    '#06B6D4', // Cyan
    '#2E7D7F', // Teal (primary)
    '#EC4899', // Pink
    '#FF8F80', // Coral (accent)
];

export default function DashboardOverview() {
    const { loading, investmentStats, expenseData } = useDashboardData();
    const { startLoading, stopLoading } = useLoading();

    React.useEffect(() => {
        if (loading) {
            startLoading();
        } else {
            stopLoading();
        }
    }, [loading, startLoading, stopLoading]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Your financial overview</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/investments"
                        aria-label="Navigate to Investments page"
                        className="px-4 py-2 bg-card border border-border rounded-lg text-sm hover:border-primary transition-colors flex items-center gap-2 text-foreground"
                    >
                        Investment <ExternalLink className="w-3 h-3" />
                    </Link>
                    <Link
                        href="/expenses"
                        aria-label="Navigate to Expenses page"
                        className="px-4 py-2 bg-card border border-border rounded-lg text-sm hover:border-primary transition-colors flex items-center gap-2 text-foreground"
                    >
                        Expenses <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Portfolio Value"
                    value={formatCurrency(investmentStats?.totalValue || 0)}
                    icon={<PiggyBank className="w-5 h-5" />}
                    trend={investmentStats?.totalProfitLoss || 0}
                    trendLabel={investmentStats?.profitLossPercentage?.toFixed(1) + '%'}
                    color="gold"
                />
                <StatCard
                    title="Total P&L"
                    value={formatCurrency(investmentStats?.totalProfitLoss || 0)}
                    icon={<TrendingUp className="w-5 h-5" />}
                    trend={investmentStats?.totalProfitLoss || 0}
                    color="green"
                />
                <StatCard
                    title="Expenses (YTD)"
                    value={formatCurrency(expenseData.totalExpenses)}
                    icon={<Wallet className="w-5 h-5" />}
                    color="red"
                />
                <StatCard
                    title="Open Positions"
                    value={(investmentStats?.openPositions || 0).toString()}
                    subtitle="Positions"
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="purple"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Asset Allocation Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Asset Allocation</CardTitle>
                        <p className="text-sm text-muted-foreground">Investment allocation</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]" role="img" aria-label="Pie chart showing asset allocation by category">
                            {investmentStats?.assetAllocation && investmentStats.assetAllocation.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={investmentStats.assetAllocation}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                            nameKey="category"
                                        >
                                            {investmentStats.assetAllocation.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[entry.category as keyof typeof COLORS] || CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--card)',
                                                borderColor: 'var(--primary)',
                                                borderRadius: '12px',
                                                color: 'var(--foreground)',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                            }}
                                            itemStyle={{ color: 'var(--foreground)' }}
                                            labelStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                                            formatter={(value) => formatCurrency(Number(value) || 0)}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-[#71717A]">
                                    <p>No investment data available</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Monthly Expenses</CardTitle>
                        <p className="text-sm text-muted-foreground">Monthly expense trend</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]" role="img" aria-label="Area chart showing monthly expense trend">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={expenseData.monthlyData}>
                                    <defs>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="var(--muted-foreground)"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="var(--muted-foreground)"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--card)',
                                            borderColor: 'var(--primary)',
                                            borderRadius: '12px',
                                            color: 'var(--foreground)'
                                        }}
                                        itemStyle={{ color: 'var(--foreground)' }}
                                        formatter={(value) => [formatCurrency(Number(value) || 0), 'Expense']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="expense"
                                        stroke="var(--primary)"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorExpense)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section - Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Investment Positions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold">Investment Portfolio</CardTitle>
                            <p className="text-sm text-muted-foreground">{investmentStats?.openPositions || 0} positions</p>
                        </div>
                        <Link
                            href="/investments"
                            className="text-primary text-sm hover:underline flex items-center gap-1"
                        >
                            View All <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {investmentStats?.assetAllocation && investmentStats.assetAllocation.length > 0 ? (
                            <div className="space-y-3">
                                {investmentStats.assetAllocation.map((asset, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: COLORS[asset.category as keyof typeof COLORS] }}
                                            />
                                            <span className="text-foreground font-bold">{asset.category}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-foreground font-black">{formatCurrency(asset.value)}</p>
                                            <p className="text-xs text-muted-foreground font-bold">{asset.percentage.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <PiggyBank className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No investments yet</p>
                                <Link href="/investments" className="text-primary text-sm mt-2 inline-block">
                                    Start investing -&gt;
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Expense Categories */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold">Top Spending</CardTitle>
                            <p className="text-sm text-muted-foreground">Top expense categories</p>
                        </div>
                        <Link
                            href="/expenses"
                            className="text-primary text-sm hover:underline flex items-center gap-1"
                        >
                            View All <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {expenseData.categories.length > 0 ? (
                            <div className="space-y-3">
                                {expenseData.categories.slice(0, 5).map((cat, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: (cat.color || '#718096') + '20' }}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: cat.color || '#718096' }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-foreground font-medium truncate">{cat.name}</p>
                                            <div className="w-full bg-muted/20 rounded-full h-1.5 mt-1">
                                                <div
                                                    className="h-1.5 rounded-full"
                                                    style={{
                                                        width: `${(cat.amount / expenseData.totalExpenses) * 100}%`,
                                                        backgroundColor: cat.color || '#718096'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-foreground font-semibold whitespace-nowrap">
                                            {formatCurrency(cat.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No expenses yet</p>
                                <Link href="/expenses" className="text-primary text-sm mt-2 inline-block">
                                    Record expense -&gt;
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Stat Card Component
interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: number;
    trendLabel?: string;
    color: 'gold' | 'green' | 'red' | 'purple';
}

function StatCard({ title, value, subtitle, icon, trend, trendLabel, color }: StatCardProps) {
    const colorStyles = {
        gold: 'bg-card border-primary/30 shadow-md',
        green: 'bg-card border-emerald-500/30 shadow-md',
        red: 'bg-card border-rose-500/30 shadow-md',
        purple: 'bg-card border-purple-500/30 shadow-md'
    };

    const iconColors = {
        gold: 'text-primary',
        green: 'text-emerald-500',
        red: 'text-rose-500',
        purple: 'text-purple-500'
    };

    return (
        <div 
            className={`p-4 rounded-xl border ${colorStyles[color]}`}
            role="region"
            aria-label={`${title}: ${value}${trendLabel ? `, Trend: ${trendLabel}` : ''}${subtitle ? `, ${subtitle}` : ''}`}
        >
            <div className="flex items-start justify-between mb-2">
                <span className={iconColors[color]}>{icon}</span>
                {trend !== undefined && (
                    <span className={`text-xs flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trendLabel}
                    </span>
                )}
            </div>
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground/60">{subtitle}</p>}
        </div>
    );
}

