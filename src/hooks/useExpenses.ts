import { useEffect, useState, useCallback } from 'react';
import { useAuthStore, useToastStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import { getMonthlyPendingAmount } from '@/lib/utils';
import { Category, PaymentChannel } from '@/types';

// ── Types ──
export interface Expense {
    id: string;
    item_name: string;
    amount_total: number;
    transaction_date: string;
    status: 'PAID' | 'PENDING';
    payment_type: 'FULL' | 'INSTALLMENT';
    categories?: { name: string };
    payment_channels?: { name: string };
    expense_installments?: { status: string; due_date?: string; period_number?: number }[];
}

export interface ExpenseFilters {
    category: string;
    payment: string;
    status: string;
    startDate: string;
    endDate: string;
    minAmount: string;
    maxAmount: string;
}

interface UseExpensesReturn {
    // Data
    expenses: Expense[];
    allPendingExpenses: Expense[];
    categories: Category[];
    paymentChannels: PaymentChannel[];
    // Derived
    pendingExpenses: Expense[];
    totalPending: number;
    totalItems: number;
    totalPages: number;
    // State
    loading: boolean;
    deleting: boolean;
    // Sorting & Pagination
    sortField: 'date' | 'amount';
    sortOrder: 'asc' | 'desc';
    currentPage: number;
    itemsPerPage: number;
    // Filters
    searchTerm: string;
    filters: ExpenseFilters;
    // Actions
    setSortField: (field: 'date' | 'amount') => void;
    setSortOrder: (order: 'asc' | 'desc') => void;
    setCurrentPage: (page: number | ((prev: number) => number)) => void;
    setSearchTerm: (term: string) => void;
    setFilters: (filters: Partial<ExpenseFilters>) => void;
    clearFilters: () => void;
    toggleSort: (field: 'date' | 'amount') => void;
    // CRUD
    deleteExpense: (item: Expense) => Promise<void>;
    refreshAll: () => void;
}

const ITEMS_PER_PAGE = 10;

const DEFAULT_FILTERS: ExpenseFilters = {
    category: 'ALL',
    payment: 'ALL',
    status: 'ALL',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
};

export function useExpenses(): UseExpensesReturn {
    const { token, user } = useAuthStore();
    const { addToast } = useToastStore();

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [allPendingExpenses, setAllPendingExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [totalItems, setTotalItems] = useState(0);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFiltersState] = useState<ExpenseFilters>(DEFAULT_FILTERS);

    // Sort and Pagination
    const [sortField, setSortField] = useState<'date' | 'amount'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter options
    const [categories, setCategories] = useState<Category[]>([]);
    const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>([]);

    const setFilters = useCallback((partial: Partial<ExpenseFilters>) => {
        setFiltersState(prev => ({ ...prev, ...partial }));
    }, []);

    const clearFilters = useCallback(() => {
        setFiltersState(DEFAULT_FILTERS);
        setSearchTerm('');
    }, []);

    const toggleSort = useCallback((field: 'date' | 'amount') => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    }, [sortField]);

    // Fetch pending reminders
    const fetchPendingReminders = useCallback(async () => {
        if (!token || !user) return;
        try {
            const params = new URLSearchParams({
                page: '1',
                limit: '100',
                status: 'PENDING'
            });
            const response = await apiClient.fetch(`/api/expenses/user/${user.id}?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setAllPendingExpenses(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch pending reminders:', error);
        }
    }, [token, user]);

    // Fetch expenses
    const fetchExpenses = useCallback(async () => {
        if (!token || !user) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: ITEMS_PER_PAGE.toString(),
                sortField,
                sortOrder,
                search: searchTerm,
                category: filters.category,
                payment: filters.payment,
                status: filters.status,
                startDate: filters.startDate,
                endDate: filters.endDate,
                minAmount: filters.minAmount,
                maxAmount: filters.maxAmount
            });

            const response = await apiClient.fetch(`/api/expenses/user/${user.id}?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setExpenses(data.data);
                if (data.pagination) {
                    setTotalItems(data.pagination.total);
                }
            }
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        } finally {
            setLoading(false);
        }
    }, [token, user, currentPage, sortField, sortOrder, searchTerm, filters]);

    // Fetch filter data (categories, payment channels)
    const fetchFilterData = useCallback(async () => {
        if (!token) return;
        try {
            const [catRes, chanRes] = await Promise.all([
                apiClient.fetch('/api/categories'),
                apiClient.fetch('/api/payment-channels')
            ]);
            const [catData, chanData] = await Promise.all([catRes.json(), chanRes.json()]);
            if (catData.success) setCategories(catData.data);
            if (chanData.success) setPaymentChannels(chanData.data);
        } catch (error) {
            console.error('Failed to fetch filter data:', error);
        }
    }, [token]);

    // Delete expense
    const deleteExpense = useCallback(async (item: Expense) => {
        if (!token || deleting) return;
        setDeleting(true);
        try {
            const response = await apiClient.fetch(`/api/expenses/${item.id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                fetchExpenses();
                addToast('Expense deleted successfully', 'success');
            } else {
                addToast(result.error || 'Failed to delete expense', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            addToast('An error occurred while deleting.', 'error');
        } finally {
            setDeleting(false);
        }
    }, [token, deleting, fetchExpenses, addToast]);

    const refreshAll = useCallback(() => {
        fetchExpenses();
        fetchPendingReminders();
    }, [fetchExpenses, fetchPendingReminders]);

    // Debounced fetch
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchExpenses();
        }, searchTerm ? 500 : 100);
        return () => clearTimeout(timeoutId);
    }, [fetchExpenses]);

    // Initial load
    useEffect(() => {
        fetchFilterData();
        fetchPendingReminders();
    }, [fetchFilterData, fetchPendingReminders]);

    // Derived data
    const pendingExpenses = allPendingExpenses
        .filter(exp => getMonthlyPendingAmount(exp) > 0)
        .sort((a, b) => getMonthlyPendingAmount(b) - getMonthlyPendingAmount(a));

    const totalPending = pendingExpenses.reduce(
        (sum, exp) => sum + getMonthlyPendingAmount(exp), 0
    );

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return {
        expenses,
        allPendingExpenses,
        categories,
        paymentChannels,
        pendingExpenses,
        totalPending,
        totalItems,
        totalPages,
        loading,
        deleting,
        sortField,
        sortOrder,
        currentPage,
        itemsPerPage: ITEMS_PER_PAGE,
        searchTerm,
        filters,
        setSortField,
        setSortOrder,
        setCurrentPage,
        setSearchTerm,
        setFilters,
        clearFilters,
        toggleSort,
        deleteExpense,
        refreshAll,
    };
}
