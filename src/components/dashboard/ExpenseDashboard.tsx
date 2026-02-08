'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Wallet, TrendingDown, LayoutGrid, Calendar, Loader2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { useAuthStore } from '@/lib/store';
import CategoryDetailModal from './CategoryDetailModal';
import { apiClient } from '@/lib/api-client';

export default function ExpenseDashboard() {
    const { token, user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        if (token && user) {
            fetchDashboardData();
        }
    }, [token, user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch categories for the "Top Layers"
            const catRes = await apiClient.fetch('/api/categories');
            const catData = await catRes.json();

            // Fetch stats (limit=1 because we only want the stats object)
            const expRes = await apiClient.fetch(`/api/expenses/user/${user?.id}?limit=1`);
            const expData = await expRes.json();

            if (catData.success && expData.success && expData.stats) {
                const { totalAmount, byCategory, byMonth } = expData.stats;

                // Merge category stats
                // Ensure we have an entry for every category even if 0
                const cats = catData.data.map((cat: any) => {
                    const amount = byCategory[cat.id] || 0;
                    return { ...cat, amount };
                }).sort((a: any, b: any) => b.amount - a.amount);

                setCategories(cats);

                // Format monthly data for chart
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const chartData = months.map(m => ({ name: m, amount: byMonth[m] || 0 }));
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
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const totalStats = categories.reduce((sum, c) => sum + c.amount, 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-wide">Expense Analytics</h2>
                    <span className="text-lg">💸</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">วิเคราะห์ค่าใช้จ่ายของคุณ ✨</p>
            </div>

            {/* Top Categories */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">Top Layers</h3>
                    <span className="text-sm">🏆</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    {categories.slice(0, 5).map((cat, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedCategory({ id: cat.id, name: cat.name })}
                            className="bg-card border border-border p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center gap-2 sm:gap-3 hover:border-primary transition-all hover-lift cursor-pointer group"
                        >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background flex items-center justify-center border border-border group-hover:border-primary transition-all group-hover:scale-105">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-transform group-hover:scale-110" style={{ backgroundColor: cat.color }} />
                            </div>
                            <div className="text-center">
                                <p className="text-xs sm:text-sm text-foreground font-medium truncate w-full max-w-[80px] sm:max-w-none group-hover:text-primary transition-colors">{cat.name}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">฿{cat.amount.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {/* Monthly Expenses Chart */}
                <Card className="card-hover">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base sm:text-lg font-bold">Total Monthly Expenses</CardTitle>
                            <span>📈</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-primary">฿{totalStats.toLocaleString()} 💰</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] sm:h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="var(--muted-foreground)"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="var(--muted-foreground)"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `฿${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                        itemStyle={{ color: 'var(--primary)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="var(--primary)"
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories Bar Chart */}
                <Card className="card-hover">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base sm:text-lg font-bold">Expenses by Category</CardTitle>
                            <span>🎯</span>
                        </div>
                        <p className="text-sm sm:text-base font-medium text-muted-foreground">Top Spending Breakdown</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] sm:h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={categories.slice(0, 5)} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        stroke="var(--muted-foreground)"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        width={70}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                    />
                                    <Bar dataKey="amount" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
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
