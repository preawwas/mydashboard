'use client';

import React, { useEffect, useState } from 'react';
import {
    Button,
    Input,
    Modal
} from '@/components/ui';
import { Loader2, Plus, Check, X } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface ExpenseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editId?: string | null;
}

export default function ExpenseFormModal({ isOpen, onClose, onSuccess, editId }: ExpenseFormModalProps) {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Dropdown data
    const [categories, setCategories] = useState<any[]>([]);
    const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
    const [installments, setInstallments] = useState<any[]>([]);

    // Quick Add states
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showAddChannel, setShowAddChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');

    const [formData, setFormData] = useState({
        transactionDate: new Date().toLocaleDateString('sv-SE'),
        categoryId: '',
        itemName: '',
        amount: '',
        paymentChannelId: '',
        paymentType: 'FULL',
        installmentPeriods: '',
        necessity: 'NEED',
        note: '',
        status: 'PAID'
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (editId) {
                fetchExpenseDetail(editId);
            } else {
                setFormData({
                    transactionDate: new Date().toLocaleDateString('sv-SE'),
                    categoryId: '',
                    itemName: '',
                    amount: '',
                    paymentChannelId: '',
                    paymentType: 'FULL',
                    installmentPeriods: '',
                    necessity: 'NEED',
                    note: '',
                    status: 'PAID'
                });
                setInstallments([]);
            }
            fetchDropdownData();
            setShowAddCategory(false);
            setShowAddChannel(false);
        }
    }, [isOpen, editId]);

    const fetchDropdownData = async () => {
        if (!token) return;
        try {
            const [catRes, chanRes] = await Promise.all([
                fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/payment-channels', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            const [catData, chanData] = await Promise.all([catRes.json(), chanRes.json()]);
            if (catData.success) setCategories(catData.data);
            if (chanData.success) setPaymentChannels(chanData.data);
        } catch (error) {
            console.error('Failed to fetch dropdown data:', error);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim() || !token) return;
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: newCategoryName })
            });
            const result = await response.json();
            if (result.success) {
                setCategories([...categories, result.data]);
                setFormData(prev => ({ ...prev, categoryId: result.data.id.toString() }));
                setNewCategoryName('');
                setShowAddCategory(false);
            }
        } catch (error) {
            console.error('Add category error:', error);
        }
    };

    const handleAddChannel = async () => {
        if (!newChannelName.trim() || !token) return;
        try {
            const response = await fetch('/api/payment-channels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: newChannelName })
            });
            const result = await response.json();
            if (result.success) {
                setPaymentChannels([...paymentChannels, result.data]);
                setFormData(prev => ({ ...prev, paymentChannelId: result.data.id.toString() }));
                setNewChannelName('');
                setShowAddChannel(false);
            }
        } catch (error) {
            console.error('Add channel error:', error);
        }
    };

    const fetchExpenseDetail = async (id: string) => {
        if (!token) return;
        setFetching(true);
        try {
            const response = await fetch(`/api/expenses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                const exp = result.data;
                setFormData({
                    itemName: exp.item_name,
                    amount: exp.amount_total.toString(),
                    paymentChannelId: exp.payment_channel_id.toString(),
                    paymentType: exp.payment_type,
                    installmentPeriods: exp.expense_installments?.length.toString() || '',
                    necessity: exp.necessity,
                    note: exp.note || '',
                    status: exp.status,
                    transactionDate: exp.transaction_date.split('T')[0],
                    categoryId: exp.category_id.toString()
                });
                if (exp.expense_installments) {
                    setInstallments(exp.expense_installments.sort((a: any, b: any) => a.period_number - b.period_number));
                }
            }
        } catch (error) {
            console.error('Failed to fetch expense detail:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (name: string, value: any) => {
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'paymentType' && value === 'INSTALLMENT') {
                newData.status = 'PENDING';
            }
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setLoading(true);

        try {
            const url = editId ? `/api/expenses/${editId}` : '/api/expenses';
            const method = editId ? 'PATCH' : 'POST';

            const payload = {
                ...formData,
                transactionDate: formData.transactionDate,
                installments: installments
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.success) {
                onSuccess();
                onClose();
            } else {
                alert(result.error || 'Failed to save expense');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${editId ? 'Edit' : 'Add New'} Expense`}
            description="Enter the details of your expense below."
        >
            {fetching ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F5C542]" />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#A1A1AA]">Date</label>
                            <Input
                                type="date"
                                value={formData.transactionDate}
                                onChange={(e) => handleChange('transactionDate', e.target.value)}
                                className="bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] focus:ring-[#F5C542]"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-[#A1A1AA]">Category</label>
                                {!showAddCategory && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAddCategory(true)}
                                        className="text-[10px] text-[#F5C542] hover:underline flex items-center gap-0.5"
                                    >
                                        <Plus className="w-2.5 h-2.5" /> Add New
                                    </button>
                                )}
                            </div>
                            {showAddCategory ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Name..."
                                        className="h-8 text-xs bg-[#1C1B16] border-[#2E2C24]"
                                        autoFocus
                                    />
                                    <button type="button" onClick={handleAddCategory} className="text-[#F5C542]">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button type="button" onClick={() => setShowAddCategory(false)} className="text-[#71717A]">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => handleChange('categoryId', e.target.value)}
                                    className="w-full h-10 bg-[#1C1B16] border border-[#2E2C24] text-[#FAFAFA] rounded-xl px-3 text-sm focus:ring-1 focus:ring-[#F5C542] appearance-none"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#A1A1AA]">Item Name</label>
                        <Input
                            value={formData.itemName}
                            onChange={(e) => handleChange('itemName', e.target.value)}
                            className="bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] focus:ring-[#F5C542]"
                            placeholder="e.g. Lunch, Rent, New Laptop"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#A1A1AA]">Amount (THB)</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => handleChange('amount', e.target.value)}
                                className="bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] focus:ring-[#F5C542]"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-[#A1A1AA]">Payment Channel</label>
                                {!showAddChannel && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAddChannel(true)}
                                        className="text-[10px] text-[#F5C542] hover:underline flex items-center gap-0.5"
                                    >
                                        <Plus className="w-2.5 h-2.5" /> Add New
                                    </button>
                                )}
                            </div>
                            {showAddChannel ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={newChannelName}
                                        onChange={(e) => setNewChannelName(e.target.value)}
                                        placeholder="Name..."
                                        className="h-8 text-xs bg-[#1C1B16] border-[#2E2C24]"
                                        autoFocus
                                    />
                                    <button type="button" onClick={handleAddChannel} className="text-[#F5C542]">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button type="button" onClick={() => setShowAddChannel(false)} className="text-[#71717A]">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <select
                                    value={formData.paymentChannelId}
                                    onChange={(e) => handleChange('paymentChannelId', e.target.value)}
                                    className="w-full h-10 bg-[#1C1B16] border border-[#2E2C24] text-[#FAFAFA] rounded-xl px-3 text-sm focus:ring-1 focus:ring-[#F5C542] appearance-none"
                                    required
                                >
                                    <option value="">Select Payment</option>
                                    {paymentChannels.map(chan => (
                                        <option key={chan.id} value={chan.id}>{chan.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#A1A1AA]">Payment Type</label>
                            <select
                                value={formData.paymentType}
                                onChange={(e) => handleChange('paymentType', e.target.value)}
                                className="w-full h-10 bg-[#1C1B16] border border-[#2E2C24] text-[#FAFAFA] rounded-xl px-3 text-sm focus:ring-1 focus:ring-[#F5C542] appearance-none"
                                disabled={!!editId}
                            >
                                <option value="FULL">Full Payment</option>
                                <option value="INSTALLMENT">Installment</option>
                            </select>
                        </div>
                        {formData.paymentType === 'INSTALLMENT' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#A1A1AA]">Periods (Months)</label>
                                <Input
                                    type="number"
                                    value={formData.installmentPeriods}
                                    onChange={(e) => handleChange('installmentPeriods', e.target.value)}
                                    className="bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] focus:ring-[#F5C542]"
                                    placeholder="Months"
                                    disabled={!!editId}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#A1A1AA]">Necessity</label>
                            <div className="flex bg-[#1C1B16] p-1 rounded-xl border border-[#2E2C24]">
                                {['NEED', 'WANT'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleChange('necessity', type)}
                                        className={cn(
                                            "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all",
                                            formData.necessity === type
                                                ? "bg-[#2E2C24] text-[#F5C542] shadow-sm"
                                                : "text-[#71717A] hover:text-[#FAFAFA]"
                                        )}
                                    >
                                        {type.charAt(0) + type.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#A1A1AA]">Status</label>
                            <div className="flex bg-[#1C1B16] p-1 rounded-xl border border-[#2E2C24]">
                                {['PAID', 'PENDING'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => handleChange('status', s)}
                                        className={cn(
                                            "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all",
                                            formData.status === s
                                                ? "bg-[#2E2C24] text-[#F5C542] shadow-sm"
                                                : "text-[#71717A] hover:text-[#FAFAFA]"
                                        )}
                                    >
                                        {s.charAt(0) + s.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#A1A1AA]">Note</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => handleChange('note', e.target.value)}
                            className="w-full bg-[#1C1B16] border border-[#2E2C24] text-[#FAFAFA] rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-[#F5C542] min-h-[80px] outline-none"
                            placeholder="Add any details..."
                        />
                    </div>

                    {editId && formData.paymentType === 'INSTALLMENT' && installments.length > 0 && (
                        <div className="space-y-4 border-t border-[#2E2C24] pt-4 mt-2">
                            <h3 className="text-sm font-medium text-[#FAFAFA]">Installment Schedule</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-[#A1A1AA]">
                                    <thead>
                                        <tr className="text-left border-b border-[#2E2C24]">
                                            <th className="pb-2 font-medium">Period</th>
                                            <th className="pb-2 font-medium">Due Date</th>
                                            <th className="pb-2 font-medium text-right">Amount</th>
                                            <th className="pb-2 font-medium pl-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#2E2C24]">
                                        {installments.map((inst, index) => (
                                            <tr key={inst.id}>
                                                <td className="py-3">{inst.period_number}</td>
                                                <td className="py-3">{inst.due_date}</td>
                                                <td className="py-3 text-[#FAFAFA] text-right">฿{inst.amount.toLocaleString()}</td>
                                                <td className="py-3 pl-4">
                                                    <select
                                                        value={inst.status}
                                                        onChange={(e) => {
                                                            const newStatus = e.target.value;
                                                            const updated = [...installments];
                                                            updated[index] = { ...inst, status: newStatus };
                                                            setInstallments(updated);
                                                            const allPaid = updated.every(i => i.status === 'PAID');
                                                            handleChange('status', allPaid ? 'PAID' : 'PENDING');
                                                        }}
                                                        className={cn(
                                                            "bg-[#1C1B16] border border-[#2E2C24] rounded-lg px-2 py-1 text-xs focus:ring-[#F5C542]",
                                                            inst.status === 'PAID' ? "text-green-500" : "text-yellow-500"
                                                        )}
                                                    >
                                                        <option value="PENDING">Pending</option>
                                                        <option value="PAID">Paid</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2E2C24]">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="bg-transparent border-[#2E2C24] hover:bg-[#2E2C24]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[#F5C542] text-[#15140F] hover:bg-[#FFC83D] min-w-[100px]"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editId ? 'Save Changes' : 'Add Expense')}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
