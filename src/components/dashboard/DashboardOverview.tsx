'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, DashboardSkeleton } from '@/components/ui';
import {
    TrendingUp, TrendingDown, Wallet, PiggyBank, Plus,
    ArrowUpRight, ArrowDownRight, ExternalLink, Sparkles, BookOpen, Receipt, Utensils,
    Eye, EyeOff
} from 'lucide-react';
import {
    ResponsiveContainer, PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area
} from 'recharts';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useDashboardData } from '@/hooks';
import { useLoading } from '@/components/providers/LoadingProvider';
import { apiClient } from '@/lib/api-client';

import { useAuthStore } from '@/lib/store';

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

    const today = new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-[28px] font-extrabold text-[#0D3B38] tracking-tight">Dashboard</h1>
                    <p className="text-xs text-muted-foreground font-medium">{today}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href="/investments"
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#0D3B38] text-[#0D3B38] text-[13px] font-bold rounded-xl shadow-sm hover:bg-[#0D3B38] hover:text-white transition-all"
                    >
                        Investment <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link 
                        href="/expenses"
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#0D3B38] text-[#0D3B38] text-[13px] font-bold rounded-xl shadow-sm hover:bg-[#0D3B38] hover:text-white transition-all"
                    >
                        Expenses <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Row 1: Portfolio & Asset Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PortfolioValueCard
                        value={formatCurrency(investmentStats?.totalValue || 0)}
                        trend={investmentStats?.totalProfitLoss || 0}
                        trendLabel={investmentStats?.profitLossPercentage?.toFixed(1) + '%'}
                    />
                </div>
                <div className="col-span-1">
                    <AssetAllocationCard allocation={investmentStats?.assetAllocation || []} />
                </div>
            </div>

            {/* Row 2: Seasonal Fluctuations & Top Spending */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[340px]">
                    <SeasonalFluctuations monthlyData={expenseData.monthlyData} totalFiltered={expenseData.totalExpenses} />
                </div>
                <div className="col-span-1 h-[340px]">
                    <TopSpendingNarrative categories={expenseData.categories} />
                </div>
            </div>

            {/* Row 3: Investment Portfolio Summary */}
            <div className="w-full">
                <InvestmentSummaryTable allocation={investmentStats?.assetAllocation || []} totalValue={investmentStats?.totalValue || 0} />
            </div>

        </div>
    );
}

// Custom specialized card for Portfolio Value
interface PortfolioValueCardProps {
    value: string;
    trend: number;
    trendLabel: string;
}

function PortfolioValueCard({ value, trend, trendLabel }: PortfolioValueCardProps) {
    const isPositive = trend >= 0;
    const { user } = useAuthStore();
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
    const [showValue, setShowValue] = React.useState(false);
    
    const hiddenValue = value.replace(/[0-9]/g, 'X');
    const trendString = `${isPositive ? '+' : '-'}${formatCurrency(Math.abs(trend))} (${trendLabel})`;
    const hiddenTrendString = trendString.replace(/[0-9]/g, 'X');
    
    return (
        <div 
            className="relative overflow-hidden rounded-[30px] bg-[#0b4d46] p-7 shadow-xl flex flex-col justify-between h-full min-h-[220px]"
            role="region"
            aria-label={`Portfolio Value: ${value}`}
        >
            {/* Organic Background Shape */}
            <div 
                className="absolute top-0 right-0 w-[110%] sm:w-[70%] h-[160%] bg-[#12615a] rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] pointer-events-none transform translate-x-[15%] -translate-y-[15%]"
            />
            
            <div className="relative z-10 flex flex-col items-start gap-1">
                <div className="flex items-center gap-2 mb-2">
                    <p className="text-[10px] tracking-widest font-semibold text-emerald-50/70 uppercase">
                        Aggregate Portfolio Value
                    </p>
                    <button 
                        onClick={() => setShowValue(!showValue)}
                        className="text-emerald-50/70 hover:text-white transition-colors focus:outline-none"
                        aria-label={showValue ? "Hide value" : "Show value"}
                    >
                        {showValue ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                </div>
                <h2 className="text-[40px] lg:text-[46px] font-extrabold text-white tracking-tight drop-shadow-sm mb-4">
                    {showValue ? value : hiddenValue}
                </h2>
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white text-xs font-semibold rounded-full border border-white/15 backdrop-blur-md shadow-sm">
                    {isPositive ? <TrendingUp className="w-3 h-3 text-emerald-300" /> : <TrendingDown className="w-3 h-3 text-rose-300" />}
                    <span className="tracking-wide text-white">
                        {showValue ? trendString : hiddenTrendString}
                    </span>
                </div>
            </div>

            <div className="relative z-10 flex items-end justify-between mt-10">
                <div>
                    <p className="text-[10px] text-emerald-50/60 mb-1">Reporting Period</p>
                    <p className="text-sm font-bold text-white tracking-wide">Currently Fiscal Narrative</p>
                </div>
                
                <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-[#fcdba0] flex items-center justify-center text-[14px] font-black text-[#6b4c10] shadow-sm border border-[#e4c07b]">
                        {userInitial}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AssetAllocationCard({ allocation }: { allocation: any[] }) {
    // Hide text if there are more than 2 items to ensure everything fits the space nicely
    const showText = allocation.length <= 2;
    const sortedAllocation = [...allocation].sort((a, b) => b.percentage - a.percentage);
    const displayAssets = sortedAllocation.slice(0, 4);

    return (
        <div className="bg-white rounded-[30px] p-7 shadow-sm border border-border/40 h-full flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-bold tracking-widest text-[#a1a1aa] uppercase">Asset Allocation</h3>
                    <PieChart className="w-5 h-5 text-gray-300" />
                </div>
                
                {displayAssets.length > 0 ? (
                    <div className="flex flex-col gap-5 mb-6">
                        {displayAssets.map((asset, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-extrabold text-[#0D3B38]">{asset.category}</span>
                                    <span className="text-sm font-extrabold text-[#0D3B38]">{asset.percentage.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 w-full bg-orange-50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-[#fde047] rounded-full" 
                                        style={{ width: `${asset.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-gray-400 mb-6">No assets recorded.</div>
                )}
            </div>

            {showText && (
                <div className="mt-2 bg-[#fffbf2] rounded-[20px] p-5 text-[11px] font-medium text-[#b58f4a] leading-relaxed border border-[#fef0c7]/50">
                    This section displays your current investment proportions, showing how your capital is distributed across different assets.
                </div>
            )}
        </div>
    );
}

function SeasonalFluctuations({ monthlyData, totalFiltered }: { monthlyData: any[], totalFiltered: number }) {
    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Map data to 12 months ensuring we have a complete timeline
    const data = allMonths.map(monthName => {
        const existing = monthlyData?.find(d => d.name === monthName);
        return {
            name: monthName,
            expense: existing ? existing.expense || existing.amount : 0
        };
    });

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-[#2b7a71] rounded-xl p-3 shadow-lg min-w-[150px]">
                    <p className="text-[13px] font-medium text-gray-700 mb-1">{label}</p>
                    <p className="text-[13px] font-semibold text-gray-600">
                        Expense : {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };
    
    return (
        <div className="bg-[#f9faf9] rounded-[30px] p-7 shadow-sm border border-transparent h-full relative flex flex-col">
            <div className="flex justify-between items-start mb-2 z-10 w-full">
                <h3 className="text-base font-extrabold text-[#0D3B38]">Expenses (YTD)</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2b7a71]"></span>
                    <span className="text-[9px] font-bold tracking-widest text-[#2b7a71] uppercase">Net Flow</span>
                </div>
            </div>
            
            <div className="flex-1 w-full relative -ml-4 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2b7a71" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#2b7a71" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#e5e5e5" strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            tickFormatter={(value) => `${value >= 1000 ? (value / 1000) + 'k' : value}`}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2b7a71', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area 
                            type="monotone" 
                            dataKey="expense" 
                            stroke="#2b7a71" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorExpense)" 
                            activeDot={{ r: 4, fill: '#2b7a71', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Overlay Summary Card */}
            <div className="absolute right-7 bottom-12 bg-white/95 backdrop-blur-sm rounded-[24px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] w-[220px] border border-gray-100 hidden sm:block z-10">
                <p className="text-[9px] font-bold tracking-widest text-[#a1a1aa] uppercase mb-1.5">Total Period</p>
                <p className="text-[26px] font-extrabold text-[#0D3B38] mb-3">{formatCurrency(totalFiltered || 0)}</p>
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed border-t border-gray-100 pt-4">
                    Represents cumulative expenses across all recorded periods.
                </p>
            </div>
        </div>
    );
}

function TopSpendingNarrative({ categories }: { categories: any[] }) {
    const displayData = categories && categories.length > 0 ? categories.slice(0, 3).map((c) => ({
        name: c.name || c.category?.name || 'Unknown', 
        amount: c.amount || c.totalAmount || 0,
        color: c.color || c.category?.color || '#52525b',
        icon: <Wallet className="w-5 h-5" />
    })) : [];

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-extrabold text-[#0D3B38]">Top Spending</h3>
                <Link href="/expenses" className="text-[11px] font-bold tracking-widest text-[#a1a1aa] uppercase hover:text-[#0D3B38] transition-colors flex items-center gap-1">
                    View All <ArrowUpRight className="w-3 h-3" />
                </Link>
            </div>
            <div className="space-y-4 flex-1">
                {displayData.length > 0 ? displayData.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-[24px] p-5 flex items-center gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100 transition-transform hover:-translate-y-1">
                        <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" 
                            style={{ backgroundColor: `${item.color}15`, color: item.color }}
                        >
                            {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-extrabold text-[#0D3B38] truncate">{item.name}</p>
                        </div>
                        <p className="text-sm font-extrabold text-[#0D3B38] shrink-0">
                            {formatCurrency(item.amount)}
                        </p>
                    </div>
                )) : (
                    <div className="text-sm text-gray-400 p-4 border border-dashed border-gray-200 rounded-2xl flex items-center justify-center h-full min-h-[120px]">
                        No spending data currently.
                    </div>
                )}
            </div>
        </div>
    );
}

function InvestmentSummaryTable({ allocation, totalValue }: { allocation: any[], totalValue: number }) {
    const defaultData = [
        { name: 'Gold Bullion (XAU)', weight: 100, value: 142850 }
    ];
    const data = allocation?.length > 0 ? allocation.map(a => ({
        name: a.category, weight: a.percentage.toFixed(1), value: a.value
    })) : defaultData;
    
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    return (
        <div className="bg-[#fcfdfc] rounded-[30px] p-8 shadow-sm border border-transparent h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-extrabold text-[#0D3B38]">Investment Portfolio Summary</h3>
                <Link href="/investments" className="text-[11px] font-bold tracking-widest text-[#a1a1aa] uppercase hover:text-[#0D3B38] transition-colors flex items-center gap-1">
                    View All <ArrowUpRight className="w-3 h-3" />
                </Link>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="pb-4 text-[9px] font-bold tracking-widest text-[#a1a1aa] uppercase w-[40%]">Asset Identity</th>
                            <th className="pb-4 text-[9px] font-bold tracking-widest text-[#a1a1aa] uppercase w-[30%]">Weight</th>
                            <th className="pb-4 text-[9px] font-bold tracking-widest text-[#a1a1aa] uppercase w-[30%]">Current Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.slice(0, 3).map((item, idx) => (
                            <tr key={idx} className="group">
                                <td className="py-4 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded bg-[#fae8b1] flex items-center justify-center text-[#92400e] text-[11px] font-extrabold">
                                            {item.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-bold text-[#0D3B38]">{item.name}</span>
                                    </div>
                                </td>
                                <td className="py-4 border-b border-gray-50 last:border-0 text-xs font-semibold text-[#71717a]">{item.weight}%</td>
                                <td className="py-4 border-b border-gray-50 last:border-0 text-sm font-extrabold text-[#0D3B38]">{formatCurrency(item.value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}



