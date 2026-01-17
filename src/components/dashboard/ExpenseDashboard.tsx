'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Wallet, TrendingDown, LayoutGrid, Calendar, Loader2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { useAuthStore } from '@/lib/store';
import CategoryDetailModal from './CategoryDetailModal';

export default function ExpenseDashboard() {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string } | null>(null);

    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch categories for the "Top Layers"
            const catRes = await fetch('/api/categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const catData = await catRes.json();

            // Fetch recent expenses to calculate totals
            const expRes = await fetch('/api/expenses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const expData = await expRes.json();

            if (catData.success && expData.success) {
                const expenses = expData.data;
                const cats = catData.data.map((cat: any) => {
                    const total = expenses
                        .filter((e: any) => e.category_id === cat.id)
                        .reduce((sum: number, e: any) => sum + e.amount_total, 0);
                    return { ...cat, amount: total };
                }).sort((a: any, b: any) => b.amount - a.amount);

                setCategories(cats);

                // Calculate monthly data for chart
                const monthlyMap: { [key: string]: number } = {};
                expenses.forEach((e: any) => {
                    const date = new Date(e.transaction_date);
                    const name = date.toLocaleString('default', { month: 'short' });
                    monthlyMap[name] = (monthlyMap[name] || 0) + e.amount_total;
                });

                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const chartData = months.map(m => ({ name: m, amount: monthlyMap[m] || 0 }));
                setMonthlyData(chartData);
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#F5C542]" />
            </div>
        );
    }

    const totalStats = categories.reduce((sum, c) => sum + c.amount, 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#FAFAFA] mb-1 sm:mb-2 uppercase tracking-wide">Expense Analytics</h2>
                <p className="text-xs sm:text-sm text-[#A1A1AA]">วิเคราะห์ค่าใช้จ่ายของคุณ</p>
            </div>

            {/* Top Categories */}
            <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-[#FAFAFA]">Top Layers</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    {categories.slice(0, 5).map((cat, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedCategory({ id: cat.id, name: cat.name })}
                            className="bg-[#1C1B16] border border-[#2E2C24] p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center gap-2 sm:gap-3 hover:border-[#F5C542] transition-colors cursor-pointer group"
                        >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#15140F] flex items-center justify-center border border-[#2E2C24] group-hover:border-[#F5C542]">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" style={{ backgroundColor: cat.color }} />
                            </div>
                            <div className="text-center">
                                <p className="text-xs sm:text-sm text-[#FAFAFA] font-medium truncate w-full max-w-[80px] sm:max-w-none">{cat.name}</p>
                                <p className="text-[10px] sm:text-xs text-[#A1A1AA]">฿{cat.amount.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {/* Monthly Expenses Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg font-bold">Total Monthly Expenses</CardTitle>
                        <p className="text-xl sm:text-2xl font-black text-[#F5C542]">฿{totalStats.toLocaleString()}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] sm:h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F5C542" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#F5C542" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2E2C24" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#71717A"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#71717A"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `฿${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1C1B16', borderColor: '#2E2C24', color: '#FAFAFA' }}
                                        itemStyle={{ color: '#F5C542' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#F5C542"
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg font-bold">Expenses by Category</CardTitle>
                        <p className="text-sm sm:text-base font-medium text-[#A1A1AA]">Top Spending Breakdown</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] sm:h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={categories.slice(0, 5)} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2E2C24" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        stroke="#71717A"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        width={70}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#2E2C24', opacity: 0.4 }}
                                        contentStyle={{ backgroundColor: '#1C1B16', borderColor: '#2E2C24', color: '#FAFAFA' }}
                                    />
                                    <Bar dataKey="amount" fill="#F5C542" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <CategoryDetailModal
                isOpen={!!selectedCategory}
                onClose={() => setSelectedCategory(null)}
                categoryId={selectedCategory?.id || null}
                categoryName={selectedCategory?.name || ''}
            />
        </div>
    );
}
