'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Table, Modal } from '@/components/ui';
import { Plus, Search, Filter, Calendar, Edit, Trash2, Bell, Loader2, RefreshCw } from 'lucide-react';
import { useAuthStore, useToastStore, useLanguageStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/useTranslation';
import ExpenseFormModal from '@/components/expenses/ExpenseFormModal';

export default function ExpensesPage() {
    const { token } = useAuthStore();
    const { addToast } = useToastStore();
    const { language } = useLanguageStore();
    const { t } = useTranslation();
    const [expenses, setExpenses] = useState<any[]>([]);
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
    const [categories, setCategories] = useState<any[]>([]);
    const [paymentChannels, setPaymentChannels] = useState<any[]>([]);

    const fetchExpenses = async () => {
        if (!token) return;
        try {
            const response = await fetch('/api/expenses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setExpenses(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterData = async () => {
        if (!token) return;
        try {
            const [catRes, chanRes] = await Promise.all([
                fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/payment-channels', { headers: { Authorization: `Bearer ${token}` } })
            ]);
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
            const response = await fetch(`/api/expenses/${itemToDelete.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            const result = await response.json();
            if (result.success) {
                setExpenses(prev => prev.filter(e => e.id !== itemToDelete.id));
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
        fetchFilterData();
    }, [token]);

    const filteredExpenses = expenses
        .filter(expense => {
            const matchesSearch = expense.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.categories?.name.toLowerCase().includes(searchTerm.toLowerCase());

            expense.categories?.name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = filterCategory === 'ALL' || expense.category_id.toString() === filterCategory;
            const matchesPayment = filterPayment === 'ALL' || expense.payment_channel_id.toString() === filterPayment;
            const matchesStatus = filterStatus === 'ALL' || expense.status === filterStatus;

            const expenseDate = expense.transaction_date.split('T')[0];
            const matchesStartDate = !startDate || expenseDate >= startDate;
            const matchesEndDate = !endDate || expenseDate <= endDate;

            const matchesMinAmount = !minAmount || expense.amount_total >= parseFloat(minAmount);
            const matchesMaxAmount = !maxAmount || expense.amount_total <= parseFloat(maxAmount);

            return matchesSearch && matchesCategory && matchesPayment && matchesStatus && matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
        })
        .sort((a, b) => {
            if (sortField === 'date') {
                const dateA = new Date(a.created_at || a.transaction_date).getTime();
                const dateB = new Date(b.created_at || b.transaction_date).getTime();

                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                if (a.amount_total !== b.amount_total) return sortOrder === 'asc' ? a.amount_total - b.amount_total : b.amount_total - a.amount_total;
                return b.id - a.id;
            }
        });

    // Pagination logic
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    const paginatedExpenses = filteredExpenses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getMonthlyPendingAmount = (exp: any) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        if (exp.payment_type === 'FULL') {
            const d = new Date(exp.transaction_date);
            const isPending = exp.status === 'PENDING' && (
                (d.getFullYear() < currentYear) ||
                (d.getFullYear() === currentYear && d.getMonth() <= currentMonth)
            );
            return isPending ? exp.amount_total : 0;
        }

        if (exp.payment_type === 'INSTALLMENT') {
            return exp.expense_installments
                ?.filter((i: any) => {
                    const due = new Date(i.due_date);
                    return i.status === 'PENDING' && (
                        (due.getFullYear() < currentYear) ||
                        (due.getFullYear() === currentYear && due.getMonth() <= currentMonth)
                    );
                })
                .reduce((s: number, i: any) => s + i.amount, 0) || 0;
        }

        return 0;
    };

    const pendingExpenses = expenses.filter(exp => getMonthlyPendingAmount(exp) > 0)
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
                    className="flex items-center gap-1 hover:text-[#FAFAFA] transition-colors"
                >
                    {t('common.dateRange').split(' ')[0]} {/* Hacky, but works for "Date" */}
                    {sortField === 'date' && (
                        <span className="text-[10px]">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                </button>
            ),
            render: (item: any) => <span className="text-[#FAFAFA]">{formatDate(item.transaction_date)}</span>
        },
        {
            key: 'item_name',
            header: t('common.item'),
            render: (item: any) => <span className="font-medium text-[#FAFAFA]">{item.item_name}</span>
        },
        {
            key: 'category',
            header: t('common.category'),
            render: (item: any) => (
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-[#2E2C24] text-[#FAFAFA]">
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
                        "flex items-center gap-1 hover:text-[#FAFAFA] transition-colors",
                        (minAmount || maxAmount) && "text-[#F5C542]"
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
                    item.payment_type === 'INSTALLMENT' ? "text-orange-400" : "text-[#FAFAFA]"
                )}>
                    {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(item.amount_total)}
                </span>
            )
        },
        {
            key: 'payment',
            header: t('common.payment'),
            render: (item: any) => (
                <span className="text-[#A1A1AA]">
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
                        className="p-1.5 text-[#71717A] hover:text-[#F5C542] hover:bg-[#F5C542]/10 rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => confirmDelete(item)}
                        className="p-1.5 text-[#71717A] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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
                        <h1 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] uppercase tracking-tight">{t('expenses.title')}</h1>
                        <p className="text-xs sm:text-sm text-[#A1A1AA]">{t('expenses.subtitle')}</p>
                    </div>
                    <Button
                        onClick={() => { setEditId(null); setIsModalOpen(true); }}
                        className="bg-[#F5C542] text-[#15140F] hover:bg-[#FFC83D] font-bold py-2 sm:py-2.5 text-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('expenses.addExpense')}
                    </Button>
                </div>

                {/* Monthly Reminders */}
                {pendingExpenses.length > 0 && (
                    <Card className="border-[#F5C542]/30 bg-[#F5C542]/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={fetchExpenses}
                                    className="p-2 bg-[#F5C542]/10 rounded-lg shrink-0 hover:bg-[#F5C542]/20 transition-all active:scale-95"
                                    title="Refresh reminders"
                                >
                                    <Bell className="w-5 h-5 text-[#F5C542]" />
                                </button>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <CardTitle className="text-base sm:text-lg font-bold text-[#FAFAFA]">{t('expenses.monthlyReminders')}</CardTitle>
                                        <span className="bg-[#F5C542] text-[#15140F] px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black">
                                            ฿{totalPending.toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#A1A1AA] truncate">
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
                                            <li key={exp.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm border-b border-[#F5C542]/10 pb-2 sm:border-0 sm:pb-0">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#F5C542] shrink-0" />
                                                    <span className="text-[#FAFAFA] truncate font-medium">{exp.item_name}{progressText}</span>
                                                    <span className="text-[10px] sm:text-xs text-[#71717A] shrink-0">({formatDate(exp.transaction_date)})</span>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-1 sm:mt-0">
                                                    <span className="font-bold text-[#FAFAFA]">฿{getMonthlyPendingAmount(exp).toLocaleString()}</span>
                                                    <button
                                                        onClick={() => { setEditId(exp.id); setIsModalOpen(true); }}
                                                        className="p-1.5 text-[#71717A] hover:text-[#F5C542] hover:bg-[#F5C542]/10 rounded-lg transition-colors bg-[#15140F]/50 sm:bg-transparent"
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

                            <div className="space-y-4 bg-[#15140F] p-3 sm:p-4 rounded-xl border border-[#2E2C24]">
                                <div className="flex flex-col xl:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                                        <Input
                                            placeholder={t('common.search')}
                                            className="pl-9 w-full bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] text-sm h-10"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 xl:w-[600px]">
                                        <select
                                            className="bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-[#F5C542] focus:outline-none h-10"
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                        >
                                            <option value="ALL">{t('expenses.filters.allCategories')}</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-[#F5C542] focus:outline-none h-10"
                                            value={filterPayment}
                                            onChange={(e) => setFilterPayment(e.target.value)}
                                        >
                                            <option value="ALL">{t('expenses.filters.allPayments')}</option>
                                            {paymentChannels.map(chan => (
                                                <option key={chan.id} value={chan.id}>{chan.name}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-[#F5C542] focus:outline-none col-span-2 md:col-span-1 h-10"
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
                                        <Calendar className="w-4 h-4 text-[#71717A] shrink-0" />
                                        <Input
                                            type="date"
                                            className="flex-1 h-9 py-1 text-xs bg-[#1C1B16] border-[#2E2C24]"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                        <span className="text-[#71717A]">-</span>
                                        <Input
                                            type="date"
                                            className="flex-1 h-9 py-1 text-xs bg-[#1C1B16] border-[#2E2C24]"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>

                                    {/* Amount Range */}
                                    <div className="flex items-center gap-2 flex-1 w-full">
                                        <Filter className={cn("w-4 h-4 shrink-0", (minAmount || maxAmount) ? "text-[#F5C542]" : "text-[#71717A]")} />
                                        <div className="relative flex-1">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#71717A] text-xs">฿</span>
                                            <Input
                                                type="number"
                                                inputMode="decimal"
                                                placeholder={t('common.min')}
                                                className="h-9 py-1 text-xs bg-[#1C1B16] border-[#2E2C24] pl-6 w-full"
                                                value={minAmount}
                                                onChange={(e) => setMinAmount(e.target.value)}
                                            />
                                        </div>
                                        <span className="text-[#71717A]">-</span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#71717A] text-xs">฿</span>
                                            <Input
                                                type="number"
                                                inputMode="decimal"
                                                placeholder={t('common.max')}
                                                className="h-9 py-1 text-xs bg-[#1C1B16] border-[#2E2C24] pl-6 w-full"
                                                value={maxAmount}
                                                onChange={(e) => setMaxAmount(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {(startDate || endDate || filterCategory !== 'ALL' || filterPayment !== 'ALL' || filterStatus !== 'ALL' || searchTerm || minAmount || maxAmount) && (
                                        <Button
                                            variant="ghost"
                                            className="text-[10px] sm:text-xs text-[#F5C542] hover:bg-[#F5C542]/10 h-8 px-2 shrink-0"
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
                            <div className="flex items-center justify-between px-2 pt-4 border-t border-[#2E2C24]">
                                <p className="text-sm text-[#71717A]">
                                    Showing {Math.min(filteredExpenses.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredExpenses.length, currentPage * itemsPerPage)} of {filteredExpenses.length} entries
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="bg-transparent border-[#2E2C24] text-[#FAFAFA]"
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
                                                        ? "bg-[#F5C542] text-[#15140F]"
                                                        : "text-[#71717A] hover:bg-[#2E2C24] hover:text-[#FAFAFA]"
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
                                        className="bg-transparent border-[#2E2C24] text-[#FAFAFA]"
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
                        <div className="p-4 bg-[#1C1B16] border border-[#2E2C24] rounded-xl">
                            <p className="text-[#FAFAFA] font-medium">{itemToDelete.item_name}</p>
                            <p className="text-sm text-[#A1A1AA]">฿{itemToDelete.amount_total.toLocaleString()}</p>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2E2C24]">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="bg-transparent border-[#2E2C24]"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-500 text-white hover:bg-red-600 border-none min-w-[80px]"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.delete')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout >
    );
}
