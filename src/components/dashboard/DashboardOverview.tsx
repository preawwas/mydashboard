'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
    TrendingUp, TrendingDown, Wallet, PiggyBank,
    ArrowUpRight, ArrowDownRight, Loader2, ExternalLink
} from 'lucide-react';
import {
    ResponsiveContainer, PieChart, Pie, Cell,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    BarChart, Bar
} from 'recharts';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { PortfolioSummary } from '@/types';
import { apiClient } from '@/lib/api-client';

// Color palette for charts
const COLORS = {
    GOLD: '#F5C542',
    CRYPTO: '#8B5CF6',
    STOCK: '#10B981',
    expense: '#EF4444',
    income: '#22C55E'
};

const CATEGORY_COLORS = ['#F5C542', '#8B5CF6', '#10B981', '#3B82F6', '#EC4899'];

export default function DashboardOverview() {
    const { token, user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [investmentStats, setInvestmentStats] = useState<PortfolioSummary | null>(null);
    const [expenseData, setExpenseData] = useState<{
        totalExpenses: number;
        categories: any[];
        monthlyData: any[];
    }>({ totalExpenses: 0, categories: [], monthlyData: [] });

    useEffect(() => {
        if (token && user) {
            fetchAllData();
        }
    }, [token, user]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch investment stats
            const statsRes = await apiClient.fetch('/api/dashboard/stats');
            const statsData = await statsRes.json();
            if (statsData.success) {
                setInvestmentStats(statsData.data);
            }

            // Fetch expense data
            const catRes = await apiClient.fetch('/api/categories');
            const catData = await catRes.json();

            const expRes = await apiClient.fetch(`/api/expenses/user/${user?.id}?limit=1`);
            const expData = await expRes.json();

            if (catData.success && expData.success && expData.stats) {
                const { totalAmount, byCategory, byMonth } = expData.stats;

                const cats = catData.data.map((cat: any) => ({
                    ...cat,
                    amount: byCategory[cat.id] || 0
                })).filter((c: any) => c.amount > 0).sort((a: any, b: any) => b.amount - a.amount);

                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const chartData = months.map(m => ({
                    name: m,
                    expense: byMonth[m] || 0
                }));

                setExpenseData({
                    totalExpenses: totalAmount || 0,
                    categories: cats,
                    monthlyData: chartData
                });
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center h-[600px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-[#F5C542]" />
                    <p className="text-[#A1A1AA]">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#FAFAFA]">Dashboard</h1>
                    <p className="text-sm text-[#A1A1AA]">ภาพรวมการเงินของคุณ</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/investments"
                        className="px-4 py-2 bg-[#1C1B16] border border-[#2E2C24] rounded-lg text-sm hover:border-[#F5C542] transition-colors flex items-center gap-2"
                    >
                        Investment <ExternalLink className="w-3 h-3" />
                    </Link>
                    <Link
                        href="/expenses"
                        className="px-4 py-2 bg-[#1C1B16] border border-[#2E2C24] rounded-lg text-sm hover:border-[#F5C542] transition-colors flex items-center gap-2"
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
                    subtitle="รายการ"
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
                        <p className="text-sm text-[#A1A1AA]">สัดส่วนการลงทุน</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
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
                                                backgroundColor: '#0F0F0C',
                                                borderColor: '#F5C542',
                                                borderRadius: '8px',
                                                color: '#FAFAFA',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                            }}
                                            itemStyle={{ color: '#FAFAFA' }}
                                            labelStyle={{ color: '#F5C542', fontWeight: 'bold' }}
                                            formatter={(value) => formatCurrency(Number(value) || 0)}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            formatter={(value) => <span className="text-[#FAFAFA] text-sm">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-[#71717A]">
                                    <p>ยังไม่มีข้อมูลการลงทุน</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Monthly Expenses</CardTitle>
                        <p className="text-sm text-[#A1A1AA]">ค่าใช้จ่ายรายเดือน</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={expenseData.monthlyData}>
                                    <defs>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F5C542" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#F5C542" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2E2C24" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#71717A"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#71717A"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1C1B16',
                                            borderColor: '#2E2C24',
                                            borderRadius: '8px'
                                        }}
                                        formatter={(value) => [formatCurrency(Number(value) || 0), 'Expense']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="expense"
                                        stroke="#F5C542"
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
                            <p className="text-sm text-[#A1A1AA]">{investmentStats?.openPositions || 0} positions</p>
                        </div>
                        <Link
                            href="/investments"
                            className="text-[#F5C542] text-sm hover:underline flex items-center gap-1"
                        >
                            ดูทั้งหมด <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {investmentStats?.assetAllocation && investmentStats.assetAllocation.length > 0 ? (
                            <div className="space-y-3">
                                {investmentStats.assetAllocation.map((asset, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-[#15140F] rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: COLORS[asset.category as keyof typeof COLORS] }}
                                            />
                                            <span className="text-[#FAFAFA] font-medium">{asset.category}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[#FAFAFA] font-semibold">{formatCurrency(asset.value)}</p>
                                            <p className="text-xs text-[#A1A1AA]">{asset.percentage.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-[#71717A]">
                                <PiggyBank className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>ยังไม่มีการลงทุน</p>
                                <Link href="/investments" className="text-[#F5C542] text-sm mt-2 inline-block">
                                    เริ่มลงทุน →
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
                            <p className="text-sm text-[#A1A1AA]">หมวดหมู่ค่าใช้จ่ายสูงสุด</p>
                        </div>
                        <Link
                            href="/expenses"
                            className="text-[#F5C542] text-sm hover:underline flex items-center gap-1"
                        >
                            ดูทั้งหมด <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {expenseData.categories.length > 0 ? (
                            <div className="space-y-3">
                                {expenseData.categories.slice(0, 5).map((cat, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: cat.color + '20' }}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: cat.color }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[#FAFAFA] font-medium truncate">{cat.name}</p>
                                            <div className="w-full bg-[#2E2C24] rounded-full h-1.5 mt-1">
                                                <div
                                                    className="h-1.5 rounded-full transition-all"
                                                    style={{
                                                        width: `${(cat.amount / expenseData.totalExpenses) * 100}%`,
                                                        backgroundColor: cat.color
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[#FAFAFA] font-semibold whitespace-nowrap">
                                            {formatCurrency(cat.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-[#71717A]">
                                <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>ยังไม่มีค่าใช้จ่าย</p>
                                <Link href="/expenses" className="text-[#F5C542] text-sm mt-2 inline-block">
                                    บันทึกค่าใช้จ่าย →
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
        gold: 'bg-gradient-to-br from-[#F5C542]/20 to-[#F5C542]/5 border-[#F5C542]/30',
        green: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
        red: 'bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500/30',
        purple: 'bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30'
    };

    const iconColors = {
        gold: 'text-[#F5C542]',
        green: 'text-emerald-500',
        red: 'text-red-500',
        purple: 'text-purple-500'
    };

    return (
        <div className={`p-4 rounded-xl border ${colorStyles[color]} transition-all hover:scale-[1.02]`}>
            <div className="flex items-start justify-between mb-2">
                <span className={iconColors[color]}>{icon}</span>
                {trend !== undefined && (
                    <span className={`text-xs flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trendLabel}
                    </span>
                )}
            </div>
            <p className="text-xs text-[#A1A1AA] mb-1">{title}</p>
            <p className="text-xl font-bold text-[#FAFAFA]">{value}</p>
            {subtitle && <p className="text-xs text-[#71717A]">{subtitle}</p>}
        </div>
    );
}
