import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import { PortfolioSummary, Category } from '@/types';

// ── Types ──
interface CategoryExpense extends Category {
    amount: number;
}

interface MonthlyExpense {
    name: string;
    expense: number;
}

interface ExpenseSummary {
    totalExpenses: number;
    categories: CategoryExpense[];
    monthlyData: MonthlyExpense[];
}

interface UseDashboardDataReturn {
    loading: boolean;
    investmentStats: PortfolioSummary | null;
    expenseData: ExpenseSummary;
    refreshData: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function useDashboardData(): UseDashboardDataReturn {
    const { token, user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [investmentStats, setInvestmentStats] = useState<PortfolioSummary | null>(null);
    const [expenseData, setExpenseData] = useState<ExpenseSummary>({
        totalExpenses: 0, categories: [], monthlyData: []
    });

    const fetchAllData = useCallback(async () => {
        if (!token || !user) return;
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

            const expRes = await apiClient.fetch(`/api/expenses/user/${user.id}?limit=1`);
            const expData = await expRes.json();

            if (catData.success && expData.success && expData.stats) {
                const { totalAmount, byCategory, byMonth } = expData.stats;

                const cats: CategoryExpense[] = catData.data
                    .map((cat: Category) => ({
                        ...cat,
                        amount: (byCategory[cat.id] as number) || 0
                    }))
                    .filter((c: CategoryExpense) => c.amount > 0)
                    .sort((a: CategoryExpense, b: CategoryExpense) => b.amount - a.amount);

                const chartData: MonthlyExpense[] = MONTHS.map(m => ({
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
    }, [token, user]);

    useEffect(() => {
        if (token && user) {
            fetchAllData();
        }
    }, [token, user, fetchAllData]);

    return {
        loading,
        investmentStats,
        expenseData,
        refreshData: fetchAllData,
    };
}
