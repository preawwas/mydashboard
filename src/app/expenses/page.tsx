'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Table, Modal } from '@/components/ui';
import { Plus, Search, Filter, Calendar, Edit, Trash2, Bell } from 'lucide-react';
import { cn, getMonthlyPendingAmount } from '@/lib/utils';
import ExpenseFormModal from '@/components/expenses/ExpenseFormModal';
import MonthlyRemindersCard from '@/components/expenses/MonthlyRemindersCard';
import { useExpenses, Expense } from '@/hooks';
import { useLoading } from '@/components/providers/LoadingProvider';
import dynamic from 'next/dynamic';
import { TableSkeleton } from '@/components/ui';

// Lazy load heavy expense dashboard components (Recharts)
const ExpenseDashboard = dynamic(() => import('@/components/dashboard/ExpenseDashboard'), {
    ssr: false,
    loading: () => <TableSkeleton rows={3} columns={3} />, // Or a more specific chart skeleton if available
});

export default function ExpensesPage() {
    const { startLoading, stopLoading } = useLoading();

    const {
        expenses, categories, paymentChannels,
        pendingExpenses, totalPending, totalItems, totalPages,
        loading, deleting,
        sortField, sortOrder, currentPage, itemsPerPage,
        searchTerm, filters,
        setSortField, setSortOrder, setCurrentPage, setSearchTerm,
        setFilters, clearFilters, toggleSort,
        deleteExpense, refreshAll,
    } = useExpenses();

    // Start global loading overlay on mount, stop when data is loaded
    useEffect(() => {
        // Small delay to ensure this runs after RouteChangeListener's stopLoading
        const timer = setTimeout(() => {
            startLoading();
        }, 50);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!loading || expenses.length > 0) {
            stopLoading();
        }
    }, [loading, expenses.length, stopLoading]);

    // UI-only state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Expense | null>(null);
    const [showExpenseFilters, setShowExpenseFilters] = useState(false);

    const hasActiveExpenseFilters = filters.category !== 'ALL' || filters.payment !== 'ALL' || filters.status !== 'ALL' || filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount;

    const confirmDelete = (item: Expense) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        await deleteExpense(itemToDelete);
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    };

    const formatHeader = (text: string) => {
        return text.toUpperCase();
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
                    aria-label={`Sort by date ${sortField === 'date' ? (sortOrder === 'asc' ? 'descending' : 'ascending') : ''}`}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                    {formatHeader('DATE')}
                    {sortField === 'date' && (
                        <span className="text-[10px]">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                </button>
            ),
            render: (item: any) => <span className="text-foreground">{formatDate(item.transaction_date)}</span>
        },
        {
            key: 'item_name',
            header: formatHeader('ITEM'),
            render: (item: any) => <span className="font-medium text-foreground">{item.item_name}</span>
        },
        {
            key: 'category',
            header: formatHeader('CATEGORY'),
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
                    aria-label={`Sort by amount ${sortField === 'amount' ? (sortOrder === 'asc' ? 'descending' : 'ascending') : ''}`}
                    className={cn(
                        "flex items-center gap-1 hover:text-foreground transition-colors",
                        (filters.minAmount || filters.maxAmount) && "text-primary"
                    )}
                >
                    {formatHeader('AMOUNT')}
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
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB' }).format(item.amount_total)}
                </span>
            )
        },
        {
            key: 'payment',
            header: formatHeader('PAYMENT'),
            render: (item: any) => (
                <span className="text-muted-foreground">
                    {item.payment_channels?.name}
                    {item.payment_type === 'INSTALLMENT' && <span className="ml-1 text-xs text-orange-400">(Installment)</span>}
                </span>
            )
        },
        {
            key: 'status',
            header: formatHeader('STATUS'),
            render: (item: any) => (
                <span className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    item.status === 'PAID'
                        ? "bg-teal-400/10 text-teal-400"
                        : "bg-orange-500/10 text-orange-500"
                )}>
                    {item.status === 'PAID' ? 'Paid' : 'Pending'}
                </span>
            )
        },
        {
            key: 'manage',
            header: formatHeader('MANAGE'),
            render: (item: any) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setEditId(item.id);
                            setIsModalOpen(true);
                        }}
                        aria-label="Edit expense"
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => confirmDelete(item)}
                        aria-label="Delete expense"
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
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground uppercase tracking-tight">Expenses</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">Track and manage your daily spending.</p>
                    </div>
                    <Button
                        onClick={() => { setEditId(null); setIsModalOpen(true); }}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 sm:py-2.5 text-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Expense
                    </Button>
                </div>

                {/* Monthly Reminders */}
                <MonthlyRemindersCard
                    pendingExpenses={pendingExpenses}
                    totalPending={totalPending}
                    formatDate={formatDate}
                    getMonthlyPendingAmount={getMonthlyPendingAmount}
                    refreshAll={refreshAll}
                    onEdit={(id) => { setEditId(id); setIsModalOpen(true); }}
                />

                {/* History Table with Integrated Filters */}
                <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader className="pb-0 px-0">
                        <div className="flex flex-col space-y-4">
                            <h2 className="text-lg sm:text-xl font-bold">Expense History</h2>

                            <div className="bg-[#f8f8f9] rounded-[32px] p-4 sm:p-6 flex flex-col gap-5">
                                {/* Row 1: Search + Filter Button */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            placeholder="Search item..."
                                            aria-label="Search expenses"
                                            className="h-[52px] rounded-full border-transparent hover:border-transparent focus:border-transparent focus:ring-2 focus:ring-[#0D3B38]/20 shadow-sm pl-[44px] pr-4 bg-white text-sm text-[#18181b] w-full"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => setShowExpenseFilters(!showExpenseFilters)}
                                            leftIcon={<Filter className={`w-4 h-4 sm:w-5 sm:h-5 ${showExpenseFilters ? 'text-[#0D3B38]' : 'text-white'}`} />}
                                            className={`h-[52px] rounded-full px-6 sm:px-8 text-sm sm:text-base font-medium transition-colors border-0 ${
                                                showExpenseFilters
                                                    ? 'bg-white text-[#0D3B38] hover:bg-gray-50 shadow-sm'
                                                    : 'bg-[#062d2a] text-white hover:bg-[#0c3935] shadow-sm'
                                            }`}
                                        >
                                            Filter
                                            {hasActiveExpenseFilters && (
                                                <span className={`ml-2 w-2 h-2 rounded-full ${showExpenseFilters ? 'bg-[#0D3B38]' : 'bg-white'}`} />
                                            )}
                                        </Button>
                                        {(hasActiveExpenseFilters || searchTerm) && (
                                            <Button
                                                variant="ghost"
                                                onClick={clearFilters}
                                                className="h-[52px] rounded-full px-6 text-gray-500 hover:text-gray-900 bg-white shadow-sm border border-transparent"
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Expandable Filters */}
                                <div className={`flex flex-col gap-4 transition-all duration-300 origin-top ${showExpenseFilters ? 'opacity-100 scale-y-100 h-auto' : 'opacity-0 scale-y-0 h-0 overflow-hidden hidden'}`}>
                                    {/* Dropdowns */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <select
                                            className="h-[48px] rounded-full border-transparent bg-white shadow-sm px-5 text-xs sm:text-sm font-bold text-[#374151] uppercase tracking-wide focus:ring-2 focus:ring-[#0D3B38]/20 focus:outline-none appearance-none cursor-pointer"
                                            value={filters.category}
                                            aria-label="Filter by category"
                                            onChange={(e) => setFilters({ category: e.target.value })}
                                        >
                                            <option value="ALL">All Categories</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="h-[48px] rounded-full border-transparent bg-white shadow-sm px-5 text-xs sm:text-sm font-bold text-[#374151] uppercase tracking-wide focus:ring-2 focus:ring-[#0D3B38]/20 focus:outline-none appearance-none cursor-pointer"
                                            value={filters.payment}
                                            aria-label="Filter by payment channel"
                                            onChange={(e) => setFilters({ payment: e.target.value })}
                                        >
                                            <option value="ALL">All Payments</option>
                                            {paymentChannels.map(chan => (
                                                <option key={chan.id} value={chan.id}>{chan.name}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="h-[48px] rounded-full border-transparent bg-white shadow-sm px-5 text-xs sm:text-sm font-bold text-[#374151] uppercase tracking-wide focus:ring-2 focus:ring-[#0D3B38]/20 focus:outline-none appearance-none cursor-pointer"
                                            value={filters.status}
                                            aria-label="Filter by status"
                                            onChange={(e) => setFilters({ status: e.target.value })}
                                        >
                                            <option value="ALL">All Status</option>
                                            <option value="PAID">Paid</option>
                                            <option value="PENDING">Pending</option>
                                        </select>
                                    </div>

                                    {/* Date Range + Amount Range */}
                                    <div className="flex flex-col md:flex-row items-stretch gap-3">
                                        <div className="flex items-center gap-2 bg-white rounded-full shadow-sm px-4 h-[48px]">
                                            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                            <Input
                                                type="date"
                                                aria-label="Start date"
                                                className="h-9 py-1 text-xs bg-transparent border-none shadow-none focus:ring-0 px-1 w-[120px]"
                                                value={filters.startDate}
                                                onChange={(e) => setFilters({ startDate: e.target.value })}
                                            />
                                            <span className="text-xs text-gray-400 font-medium">to</span>
                                            <Input
                                                type="date"
                                                aria-label="End date"
                                                className="h-9 py-1 text-xs bg-transparent border-none shadow-none focus:ring-0 px-1 w-[120px]"
                                                value={filters.endDate}
                                                onChange={(e) => setFilters({ endDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 bg-white rounded-full shadow-sm px-4 h-[48px]">
                                            <Filter className={cn("w-4 h-4 shrink-0", (filters.minAmount || filters.maxAmount) ? "text-[#0D3B38]" : "text-gray-400")} />
                                            <Input
                                                type="number"
                                                inputMode="decimal"
                                                placeholder="MIN"
                                                aria-label="Minimum amount"
                                                className="h-9 py-1 text-xs bg-transparent border-none shadow-none focus:ring-0 px-1 w-[80px] uppercase font-bold placeholder:text-gray-300 placeholder:font-bold"
                                                value={filters.minAmount}
                                                onChange={(e) => setFilters({ minAmount: e.target.value })}
                                            />
                                            <span className="text-xs text-gray-400 font-medium">-</span>
                                            <Input
                                                type="number"
                                                inputMode="decimal"
                                                placeholder="MAX"
                                                aria-label="Maximum amount"
                                                className="h-9 py-1 text-xs bg-transparent border-none shadow-none focus:ring-0 px-1 w-[80px] uppercase font-bold placeholder:text-gray-300 placeholder:font-bold"
                                                value={filters.maxAmount}
                                                onChange={(e) => setFilters({ maxAmount: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 space-y-4">
                        <Table
                            data={expenses}
                            columns={columns}
                            keyExtractor={(item) => item.id}
                            isLoading={loading}
                            emptyMessage="No expenses found."
                            pagination={{
                                page: currentPage,
                                limit: itemsPerPage,
                                total: totalItems,
                                totalPages,
                                onPageChange: (page) => setCurrentPage(page),
                                onLimitChange: () => { },
                            }}
                        />
                    </CardContent>
                </Card>
            </div>

            <ExpenseFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setCurrentPage(1);
                    setSortField('date');
                    setSortOrder('desc');
                    refreshAll();
                }}
                editId={editId}
            />

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Item"
                description="Are you sure you want to delete this expense?"
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
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            isLoading={deleting}
                            className="bg-red-500 text-white hover:bg-red-600 border-none min-w-[80px]"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout >
    );
}
