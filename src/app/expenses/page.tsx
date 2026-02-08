'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Table, Modal } from '@/components/ui';
import { Plus, Search, Filter, Calendar, Edit, Trash2, Bell, Loader2, RefreshCw } from 'lucide-react';
import { useAuthStore, useToastStore, useLanguageStore } from '@/lib/store';
import { cn, getMonthlyPendingAmount } from '@/lib/utils';
import { useTranslation } from '@/lib/useTranslation';
import ExpenseFormModal from '@/components/expenses/ExpenseFormModal';
import { apiClient } from '@/lib/api-client';

export default function ExpensesPage() {
    const { token, user } = useAuthStore();
    const { addToast } = useToastStore();
    const { language } = useLanguageStore();
    const { t } = useTranslation();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [allPendingExpenses, setAllPendingExpenses] = useState<any[]>([]); // Separate state for reminders
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);


    // Filter states (Inputs)
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [filterPayment, setFilterPayment] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');


    // Sort and Pagination states
    const [sortField, setSortField] = useState<'date' | 'amount'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter options
    const [totalItems, setTotalItems] = useState(0);

    // Filter options
    const [categories, setCategories] = useState<any[]>([]);
    const [paymentChannels, setPaymentChannels] = useState<any[]>([]);

    // Fetch all pending expenses for Monthly Reminders (no pagination limit)
    const fetchPendingReminders = async () => {
        if (!token || !user) return;
        try {
            const params = new URLSearchParams({
                page: '1',
                limit: '100', // High limit to get all pending items
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
    };

    const fetchExpenses = async () => {
        if (!token || !user) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                sortField,
                sortOrder,
                search: searchTerm,
                category: filterCategory,
                payment: filterPayment,
                status: filterStatus,
                startDate,
                endDate
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
    };

    const fetchFilterData = async () => {
        // ... (keep existing)
        if (!token) return;
        try {
            const [catRes, chanRes] = await Promise.all([
                apiClient.fetch('/api/categories'),
                apiClient.fetch('/api/payment-channels')
            ]);
            // ... (keep rest)
            const [catData, chanData] = await Promise.all([catRes.json(), chanRes.json()]);
            if (catData.success) {
                setCategories(catData.data);
            }
            if (chanData.success) {
                setPaymentChannels(chanData.data);
            }
        } catch (error) {
            console.error('Failed to fetch filter data:', error);
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete || !token || deleting) return;
        setDeleting(true);

        try {
            const response = await apiClient.fetch(`/api/expenses/${itemToDelete.id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                // Refresh data instead of client-side filter to ensure correct pagination
                fetchExpenses();
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
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
    };

    const confirmDelete = (item: any) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    useEffect(() => {
        fetchExpenses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, currentPage, sortField, sortOrder, filterCategory, filterPayment, filterStatus, startDate, endDate]);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (token) fetchExpenses();
        }, 500);
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    useEffect(() => {
        fetchFilterData();
        fetchPendingReminders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);


    // Pagination logic
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedExpenses = expenses; // expenses is now the page data


    // Use allPendingExpenses for reminders (not limited by pagination)
    const pendingExpenses = allPendingExpenses.filter(exp => getMonthlyPendingAmount(exp) > 0)
        .sort((a, b) => getMonthlyPendingAmount(b) - getMonthlyPendingAmount(a));

    const totalPending = pendingExpenses.reduce((sum, exp) => sum + getMonthlyPendingAmount(exp), 0);

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    };

    const columns = [
        {
            key: 'transaction_date',
            header: (
                <button
                    onClick={() => {
                        if (sortField === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        else { setSortField('date'); setSortOrder('desc'); }
                    }}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                    {t('common.dateRange').split(' ')[0]} {/* Hacky, but works for "Date" */}
                    {sortField === 'date' && (
                        <span className="text-[10px]">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                </button>
            ),
            render: (item: any) => <span className="text-foreground">{formatDate(item.transaction_date)}</span>
        },
        {
            key: 'item_name',
            header: t('common.item'),
            render: (item: any) => <span className="font-medium text-foreground">{item.item_name}</span>
        },
        {
            key: 'category',
            header: t('common.category'),
            render: (item: any) => (
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-muted/10 text-foreground">
                    {item.categories?.name || 'Uncategorized'}
                </span>
            )
        },
        {
            key: 'amount_total',
            header: (
                <button
                    onClick={() => {
                        if (sortField === 'amount') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        else { setSortField('amount'); setSortOrder('desc'); }
                    }}
                    className={cn(
                        "flex items-center gap-1 hover:text-foreground transition-colors",
                        (minAmount || maxAmount) && "text-primary"
                    )}
                >
                    {t('expenses.amount')}
                    {sortField === 'amount' && (
                        <span className="text-[10px]">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                </button>
            ),
            render: (item: any) => (
                <span className={cn(
                    "font-medium",
                    item.payment_type === 'INSTALLMENT' ? "text-orange-400" : "text-foreground"
                )}>
                    {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(item.amount_total)}
                </span>
            )
        },
        {
            key: 'payment',
            header: t('common.payment'),
            render: (item: any) => (
                <span className="text-muted-foreground">
                    {item.payment_channels?.name}
                    {item.payment_type === 'INSTALLMENT' && <span className="ml-1 text-xs text-orange-400">(Installment)</span>}
                </span>
            )
        },
        {
            key: 'status',
            header: t('common.status'),
            render: (item: any) => (
                <span className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    item.status === 'PAID'
                        ? "bg-green-500/10 text-green-500"
                        : "bg-orange-500/10 text-orange-500"
                )}>
                    {item.status === 'PAID' ? t('expenses.filters.paid') : t('expenses.filters.pending')}
                </span>
            )
        },
        {
            key: 'manage',
            header: t('common.manage'),
            render: (item: any) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setEditId(item.id);
                            setIsModalOpen(true);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => confirmDelete(item)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground uppercase tracking-tight">{t('expenses.title')}</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">{t('expenses.subtitle')}</p>
                    </div>
                    <Button
                        onClick={() => { setEditId(null); setIsModalOpen(true); }}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 sm:py-2.5 text-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('expenses.addExpense')}
                    </Button>
                </div>

                {/* Monthly Reminders */}
                {pendingExpenses.length > 0 && (
                    <Card className="border-primary/30 bg-primary/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => { fetchExpenses(); fetchPendingReminders(); }}
                                    className="p-2 bg-primary/10 rounded-lg shrink-0 hover:bg-primary/20 transition-all active:scale-95"
                                    title="Refresh reminders"
                                >
                                    <Bell className="w-5 h-5 text-primary" />
                                </button>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <CardTitle className="text-base sm:text-lg font-bold text-foreground">{t('expenses.monthlyReminders')}</CardTitle>
                                        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black">
                                            ฿{totalPending.toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                        {t('expenses.pendingItems').replace('{count}', pendingExpenses.length.toString())}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <ul className="space-y-3 sm:space-y-2">
                                    {pendingExpenses.map(exp => {
                                        let progressText = "";
                                        if (exp.payment_type === 'INSTALLMENT' && exp.expense_installments) {
                                            const total = exp.expense_installments.length;
                                            const paid = exp.expense_installments.filter((i: any) => i.status === 'PAID').length;
                                            progressText = ` (${paid}/${total})`;
                                        }

                                        return (
                                            <li key={exp.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm border-b border-primary/10 pb-2 sm:border-0 sm:pb-0">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                    <span className="text-foreground truncate font-medium">{exp.item_name}{progressText}</span>
                                                    <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">({formatDate(exp.transaction_date)})</span>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-1 sm:mt-0">
                                                    <span className="font-bold text-foreground">฿{getMonthlyPendingAmount(exp).toLocaleString()}</span>
                                                    <button
                                                        onClick={() => { setEditId(exp.id); setIsModalOpen(true); }}
                                                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors bg-muted/5 sm:bg-transparent"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* History Table with Integrated Filters */}
                <Card>
                    <CardHeader className="pb-0">
                        <div className="flex flex-col space-y-4">
                            <CardTitle className="text-lg sm:text-xl font-bold">{t('expenses.history')}</CardTitle>

                            <div className="space-y-4 bg-muted/5 p-3 sm:p-4 rounded-xl border border-border">
                                <div className="flex flex-col xl:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder={t('common.search')}
                                            className="pl-9 w-full bg-background border-border text-foreground text-sm h-10"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 xl:w-[600px]">
                                        <select
                                            className="bg-background border-border text-foreground rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-primary focus:outline-none h-10"
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                        >
                                            <option value="ALL">{t('expenses.filters.allCategories')}</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="bg-background border-border text-foreground rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-primary focus:outline-none h-10"
                                            value={filterPayment}
                                            onChange={(e) => setFilterPayment(e.target.value)}
                                        >
                                            <option value="ALL">{t('expenses.filters.allPayments')}</option>
                                            {paymentChannels.map(chan => (
                                                <option key={chan.id} value={chan.id}>{chan.name}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="bg-background border-border text-foreground rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-primary focus:outline-none col-span-2 md:col-span-1 h-10"
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                        >
                                            <option value="ALL">{t('expenses.filters.allStatus')}</option>
                                            <option value="PAID">{t('expenses.filters.paid')}</option>
                                            <option value="PENDING">{t('expenses.filters.pending')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 pt-4 border-t border-[#2E2C24]">
                                    {/* Date Range */}
                                    <div className="flex items-center gap-2 flex-1 w-full">
                                        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <Input
                                            type="date"
                                            className="flex-1 h-9 py-1 text-xs bg-background border-border"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                        <span className="text-muted-foreground">-</span>
                                        <Input
                                            type="date"
                                            className="flex-1 h-9 py-1 text-xs bg-background border-border"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>

                                    {/* Amount Range */}
                                    <div className="flex items-center gap-2 flex-1 w-full">
                                        <Filter className={cn("w-4 h-4 shrink-0", (minAmount || maxAmount) ? "text-primary" : "text-muted-foreground")} />
                                        <div className="relative flex-1">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">฿</span>
                                            <Input
                                                type="number"
                                                inputMode="decimal"
                                                placeholder={t('common.min')}
                                                className="h-9 py-1 text-xs bg-background border-border pl-6 w-full"
                                                value={minAmount}
                                                onChange={(e) => setMinAmount(e.target.value)}
                                            />
                                        </div>
                                        <span className="text-muted-foreground">-</span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">฿</span>
                                            <Input
                                                type="number"
                                                inputMode="decimal"
                                                placeholder={t('common.max')}
                                                className="h-9 py-1 text-xs bg-background border-border pl-6 w-full"
                                                value={maxAmount}
                                                onChange={(e) => setMaxAmount(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {(startDate || endDate || filterCategory !== 'ALL' || filterPayment !== 'ALL' || filterStatus !== 'ALL' || searchTerm || minAmount || maxAmount) && (
                                        <Button
                                            variant="ghost"
                                            className="text-[10px] sm:text-xs text-primary hover:bg-primary/10 h-8 px-2 shrink-0"
                                            onClick={() => {
                                                setStartDate('');
                                                setEndDate('');
                                                setFilterCategory('ALL');
                                                setFilterPayment('ALL');
                                                setFilterStatus('ALL');
                                                setSearchTerm('');
                                                setMinAmount('');
                                                setMaxAmount('');
                                            }}
                                        >
                                            {t('common.clear')}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 space-y-4">
                        <Table
                            data={paginatedExpenses}
                            columns={columns}
                            keyExtractor={(item) => item.id}
                            isLoading={loading}
                            emptyMessage={t('expenses.noExpenses')}
                        />

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-2 pt-4 border-t border-border">
                                <p className="text-sm text-muted-foreground">
                                    Showing {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(totalItems, currentPage * itemsPerPage)} of {totalItems} entries
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="bg-transparent border-border text-foreground"
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1 mx-2">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg text-xs font-medium transition-colors",
                                                    currentPage === i + 1
                                                        ? "bg-primary text-primary-foreground"
                                                        : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                                                )}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="bg-transparent border-border text-foreground"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ExpenseFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    // Reset to page 1 and sort by date descending to show newest first
                    setCurrentPage(1);
                    setSortField('date');
                    setSortOrder('desc');
                    fetchExpenses();
                    fetchPendingReminders();
                }}
                editId={editId}
            />

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={t('common.deleteTitle')}
                description={t('common.confirmDelete')}
            >
                <div className="space-y-4">
                    {itemToDelete && (
                        <div className="p-4 bg-muted/5 border border-border rounded-xl">
                            <p className="text-foreground font-medium">{itemToDelete.item_name}</p>
                            <p className="text-sm text-muted-foreground">฿{itemToDelete.amount_total.toLocaleString()}</p>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="bg-transparent border-border"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleDelete}
                            isLoading={deleting}
                            className="bg-red-500 text-white hover:bg-red-600 border-none min-w-[80px]"
                        >
                            {t('common.delete')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout >
    );
}
