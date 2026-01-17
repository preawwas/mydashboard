'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Table, Modal } from '@/components/ui';
import { Plus, Search, Filter, Calendar, Edit, Trash2, Bell, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import ExpenseFormModal from '@/components/expenses/ExpenseFormModal';

export default function ExpensesPage() {
    const { token } = useAuthStore();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);

    // Filter states
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [filterPayment, setFilterPayment] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
            } else {
                alert(result.error || 'Failed to delete expense');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred while deleting.');
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

            const matchesCategory = filterCategory === 'ALL' || expense.category_id.toString() === filterCategory;
            const matchesPayment = filterPayment === 'ALL' || expense.payment_channel_id.toString() === filterPayment;
            const matchesStatus = filterStatus === 'ALL' || expense.status === filterStatus;

            const expenseDate = expense.transaction_date.split('T')[0];
            const matchesStartDate = !startDate || expenseDate >= startDate;
            const matchesEndDate = !endDate || expenseDate <= endDate;

            return matchesSearch && matchesCategory && matchesPayment && matchesStatus && matchesStartDate && matchesEndDate;
        })
        .sort((a, b) => {
            // Stable sort: by date desc, then by id desc
            const dateA = new Date(a.transaction_date).getTime();
            const dateB = new Date(b.transaction_date).getTime();
            if (dateB !== dateA) return dateB - dateA;
            return b.id - a.id;
        });

    const pendingExpenses = expenses.filter(exp => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // 1. FULL payment: Must be PENDING and from current month or older
        if (exp.payment_type === 'FULL') {
            const d = new Date(exp.transaction_date);
            return exp.status === 'PENDING' && (
                (d.getFullYear() < currentYear) ||
                (d.getFullYear() === currentYear && d.getMonth() <= currentMonth)
            );
        }

        // 2. INSTALLMENT: Must have at least one PENDING installment due this month or earlier
        if (exp.payment_type === 'INSTALLMENT') {
            return exp.expense_installments?.some((i: any) => {
                const due = new Date(i.due_date);
                return i.status === 'PENDING' && (
                    (due.getFullYear() < currentYear) ||
                    (due.getFullYear() === currentYear && due.getMonth() <= currentMonth)
                );
            });
        }

        return false;
    });

    const totalPending = pendingExpenses.reduce((sum, exp) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        if (exp.payment_type === 'FULL') {
            return sum + exp.amount_total;
        }

        if (exp.payment_type === 'INSTALLMENT') {
            // Only sum installments due this month or earlier that are still PENDING
            const pendingAmount = exp.expense_installments
                ?.filter((i: any) => {
                    const due = new Date(i.due_date);
                    return i.status === 'PENDING' && (
                        (due.getFullYear() < currentYear) ||
                        (due.getFullYear() === currentYear && due.getMonth() <= currentMonth)
                    );
                })
                .reduce((s: number, i: any) => s + i.amount, 0) || 0;
            return sum + pendingAmount;
        }

        return sum;
    }, 0);

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    };

    const columns = [
        {
            key: 'transaction_date',
            header: 'Date',
            render: (item: any) => <span className="text-[#FAFAFA]">{formatDate(item.transaction_date)}</span>
        },
        {
            key: 'item_name',
            header: 'Item',
            render: (item: any) => <span className="font-medium text-[#FAFAFA]">{item.item_name}</span>
        },
        {
            key: 'category',
            header: 'Category',
            render: (item: any) => (
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-[#2E2C24] text-[#FAFAFA]">
                    {item.categories?.name || 'Uncategorized'}
                </span>
            )
        },
        {
            key: 'amount_total',
            header: 'Amount',
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
            header: 'Payment',
            render: (item: any) => (
                <span className="text-[#A1A1AA]">
                    {item.payment_channels?.name}
                    {item.payment_type === 'INSTALLMENT' && <span className="ml-1 text-xs text-orange-400">(Installment)</span>}
                </span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (item: any) => (
                <span className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    item.status === 'PAID'
                        ? "bg-green-500/10 text-green-500"
                        : "bg-orange-500/10 text-orange-500"
                )}>
                    {item.status}
                </span>
            )
        },
        {
            key: 'manage',
            header: 'Manage',
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
                        <h1 className="text-2xl font-bold text-[#FAFAFA]">Expense</h1>
                        <p className="text-[#A1A1AA]">Manage and track your daily expenses.</p>
                    </div>
                    <Button
                        onClick={() => { setEditId(null); setIsModalOpen(true); }}
                        className="bg-[#F5C542] text-[#15140F] hover:bg-[#FFC83D] font-medium"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Expense
                    </Button>
                </div>

                {/* Monthly Reminders */}
                {pendingExpenses.length > 0 && (
                    <Card className="border-[#F5C542]/30 bg-[#F5C542]/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#F5C542]/10 rounded-lg">
                                    <Bell className="w-5 h-5 text-[#F5C542]" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-lg text-[#FAFAFA]">Monthly Reminders</CardTitle>
                                        <span className="bg-[#F5C542] text-[#15140F] px-2 py-0.5 rounded-full text-xs font-bold">
                                            ฿{totalPending.toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#A1A1AA]">You have {pendingExpenses.length} pending items to pay this month.</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <ul className="space-y-2">
                                    {pendingExpenses.map(exp => {
                                        let progressText = "";
                                        if (exp.payment_type === 'INSTALLMENT' && exp.expense_installments) {
                                            const total = exp.expense_installments.length;
                                            const paid = exp.expense_installments.filter((i: any) => i.status === 'PAID').length;
                                            progressText = ` (${paid}/${total})`;
                                        }

                                        return (
                                            <li key={exp.id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
                                                    <span className="text-[#FAFAFA]">{exp.item_name}{progressText}</span>
                                                    <span className="text-xs text-[#71717A]">({formatDate(exp.transaction_date)})</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-[#FAFAFA]">฿{exp.amount_total.toLocaleString()}</span>
                                                    <button
                                                        onClick={() => { setEditId(exp.id); setIsModalOpen(true); }}
                                                        className="p-1.5 text-[#71717A] hover:text-[#F5C542] hover:bg-[#F5C542]/10 rounded-lg transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(exp)}
                                                        className="p-1.5 text-[#71717A] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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
                            <CardTitle>History</CardTitle>

                            <div className="space-y-4 bg-[#15140F] p-4 rounded-xl border border-[#2E2C24]">
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                                        <Input
                                            placeholder="Search expenses..."
                                            className="pl-9 w-full bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:w-[600px]">
                                        <select
                                            className="bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] rounded-lg px-3 py-2 text-sm focus:ring-[#F5C542] focus:outline-none"
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                        >
                                            <option value="ALL">All Categories</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] rounded-lg px-3 py-2 text-sm focus:ring-[#F5C542] focus:outline-none"
                                            value={filterPayment}
                                            onChange={(e) => setFilterPayment(e.target.value)}
                                        >
                                            <option value="ALL">All Payments</option>
                                            {paymentChannels.map(chan => (
                                                <option key={chan.id} value={chan.id}>{chan.name}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] rounded-lg px-3 py-2 text-sm focus:ring-[#F5C542] focus:outline-none col-span-2 md:col-span-1"
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                        >
                                            <option value="ALL">All Status</option>
                                            <option value="PAID">Paid</option>
                                            <option value="PENDING">Pending</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-[#2E2C24]">
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Calendar className="w-4 h-4 text-[#71717A]" />
                                        <span className="text-sm text-[#A1A1AA]">Date Range:</span>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Input
                                            type="date"
                                            className="h-9 py-1 text-xs bg-[#1C1B16]"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                        <span className="text-[#71717A]">-</span>
                                        <Input
                                            type="date"
                                            className="h-9 py-1 text-xs bg-[#1C1B16]"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                    {(startDate || endDate || filterCategory !== 'ALL' || filterPayment !== 'ALL' || filterStatus !== 'ALL') && (
                                        <Button
                                            variant="ghost"
                                            className="text-xs text-[#F5C542] hover:bg-[#F5C542]/10 h-8"
                                            onClick={() => {
                                                setStartDate('');
                                                setEndDate('');
                                                setFilterCategory('ALL');
                                                setFilterPayment('ALL');
                                                setFilterStatus('ALL');
                                                setSearchTerm('');
                                            }}
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        <Table
                            data={filteredExpenses}
                            columns={columns}
                            keyExtractor={(item) => item.id}
                            isLoading={loading}
                            emptyMessage="No expenses found."
                        />
                    </CardContent>
                </Card>
            </div>

            <ExpenseFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchExpenses}
                editId={editId}
            />

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Expense"
                description="Are you sure you want to delete this expense? This action cannot be undone."
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
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-500 text-white hover:bg-red-600 border-none min-w-[80px]"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
