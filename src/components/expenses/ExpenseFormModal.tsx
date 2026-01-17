'use client';

import React, { useEffect, useState } from 'react';
import {
    Button,
    Input,
    Modal
} from '@/components/ui';
import {
    Loader2, Plus, Check, X,
    Utensils, Plane, Tv, FileText, Activity,
    ShoppingBag, GraduationCap, Grid,
    Landmark, CreditCard, Coins, Smartphone,
    CheckCircle, CalendarDays, Wallet, GripVertical, Settings2, EyeOff
} from 'lucide-react';
import { useAuthStore, useToastStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Category, PaymentChannel } from '@/types';
import { useTranslation } from '@/lib/useTranslation';

interface ExpenseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editId?: string | null;
}

export default function ExpenseFormModal({ isOpen, onClose, onSuccess, editId }: ExpenseFormModalProps) {
    const { token, user } = useAuthStore();
    const { addToast } = useToastStore();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Dropdown data
    const [categories, setCategories] = useState<Category[]>([]);
    const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>([]);
    const [installments, setInstallments] = useState<any[]>([]);

    // Quick Add states
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showAddChannel, setShowAddChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');

    // Reorder & Hiding Mode
    const [isReorderMode, setIsReorderMode] = useState(false);
    const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'category' | 'channel' } | null>(null);
    const [hiddenItems, setHiddenItems] = useState<{ category: string[]; channel: string[] }>({ category: [], channel: [] });

    // Icon mapping
    const getIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('food')) return <Utensils className="w-5 h-5" />;
        if (n.includes('travel') || n.includes('trip')) return <Plane className="w-5 h-5" />;
        if (n.includes('elect') || n.includes('gadget')) return <Tv className="w-5 h-5" />;
        if (n.includes('bill') || n.includes('utility')) return <FileText className="w-5 h-5" />;
        if (n.includes('health') || n.includes('medical')) return <Activity className="w-5 h-5" />;
        if (n.includes('shop')) return <ShoppingBag className="w-5 h-5" />;
        if (n.includes('edu')) return <GraduationCap className="w-5 h-5" />;

        // Payment Channels
        if (n.includes('bank') || n.includes('transfer')) return <Landmark className="w-5 h-5" />;
        if (n.includes('credit') || n.includes('card')) return <CreditCard className="w-5 h-5" />;
        if (n.includes('cash')) return <Coins className="w-5 h-5" />;
        if (n.includes('wallet') || n.includes('digital')) return <Smartphone className="w-5 h-5" />;

        return <Grid className="w-5 h-5" />;
    };

    const [formData, setFormData] = useState({
        transactionDate: new Date().toLocaleDateString('sv-SE'),
        categoryId: '',
        itemName: '',
        amount: '',
        duration: '1',
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
            fetchDropdownData();
            if (editId) {
                fetchExpenseDetail(editId);
            } else {
                setFormData({
                    transactionDate: new Date().toLocaleDateString('sv-SE'),
                    categoryId: '',
                    itemName: '',
                    amount: '',
                    duration: '1',
                    paymentChannelId: '',
                    paymentType: 'FULL',
                    installmentPeriods: '',
                    necessity: 'NEED',
                    note: '',
                    status: 'PAID'
                });
                setInstallments([]);
            }

            // Load hidden items
            if (user?.id) {
                const savedHidden = localStorage.getItem(`expense_hidden_${user.id}`);
                setHiddenItems(savedHidden ? JSON.parse(savedHidden) : { category: [], channel: [] });
            } else {
                setHiddenItems({ category: [], channel: [] });
            }

            setShowAddCategory(false);
            setNewCategoryName('');
            setShowAddChannel(false);
            setNewChannelName('');
            setIsReorderMode(false);
            setErrors({});
        }
    }, [isOpen, editId, user?.id]);

    const sortData = (items: any[], type: 'category' | 'channel') => {
        if (!user?.id) return items;
        const savedOrder = localStorage.getItem(`expense_order_${type}_${user.id}`);
        if (!savedOrder) return items;

        const orderIds = JSON.parse(savedOrder) as string[];
        return [...items].sort((a, b) => {
            const indexA = orderIds.indexOf(a.id.toString());
            const indexB = orderIds.indexOf(b.id.toString());
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    };

    const fetchDropdownData = async () => {
        if (!token) return;
        try {
            const [catRes, chanRes] = await Promise.all([
                fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/payment-channels', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            const [catData, chanData] = await Promise.all([catRes.json(), chanRes.json()]);
            if (catData.success) {
                setCategories(sortData(catData.data, 'category'));
            }
            if (chanData.success) {
                setPaymentChannels(sortData(chanData.data, 'channel'));
            }
        } catch (error) {
            console.error('Failed to fetch dropdown data:', error);
        }
    };

    const handleDragStart = (id: string, type: 'category' | 'channel') => {
        if (!isReorderMode) return;
        setDraggedItem({ id, type });
    };

    const handleDragOver = (e: React.DragEvent, id: string, type: 'category' | 'channel') => {
        e.preventDefault();
        if (!isReorderMode || !draggedItem || draggedItem.type !== type || draggedItem.id === id) return;

        if (type === 'category') {
            const list = [...categories];
            const draggedIdx = list.findIndex(item => item.id.toString() === draggedItem.id);
            const targetIdx = list.findIndex(item => item.id.toString() === id);

            const [removed] = list.splice(draggedIdx, 1);
            list.splice(targetIdx, 0, removed);
            setCategories(list);
        } else {
            const list = [...paymentChannels];
            const draggedIdx = list.findIndex(item => item.id.toString() === draggedItem.id);
            const targetIdx = list.findIndex(item => item.id.toString() === id);

            const [removed] = list.splice(draggedIdx, 1);
            list.splice(targetIdx, 0, removed);
            setPaymentChannels(list);
        }
    };

    const handleHideItem = (e: React.MouseEvent, id: string, type: 'category' | 'channel') => {
        e.stopPropagation();
        setHiddenItems((prev: { category: string[]; channel: string[] }) => ({
            ...prev,
            [type]: [...prev[type], id]
        }));
    };

    const handleToggleHide = (id: string, type: 'category' | 'channel') => {
        setHiddenItems((prev: { category: string[]; channel: string[] }) => {
            const currentHidden = prev[type];
            const newHidden = currentHidden.includes(id)
                ? currentHidden.filter(item => item !== id)
                : [...currentHidden, id];
            return { ...prev, [type]: newHidden };
        });
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
                    categoryId: exp.category_id.toString(),
                    duration: '1' // Reset duration to 1 when editing, as we usually store total
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

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.categoryId) newErrors.categoryId = t('expenses.errors.categoryRequired');
        if (!formData.paymentChannelId) newErrors.paymentChannelId = t('expenses.errors.paymentRequired');
        if (!formData.itemName) newErrors.itemName = t('expenses.errors.itemRequired');
        if (!formData.amount) newErrors.amount = t('expenses.errors.amountRequired');

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            addToast(t('expenses.errors.fillRequired'), 'warning');
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const url = editId ? `/api/expenses/${editId}` : '/api/expenses';
            const method = editId ? 'PATCH' : 'POST';

            const computedTotal = (parseFloat(formData.amount) || 0) * (parseInt(formData.duration) || 1);

            const payload = {
                ...formData,
                amount: computedTotal.toString(), // Send calculated total as the "amount"
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
                addToast(editId ? t('expenses.errors.updateSuccess') : t('expenses.errors.addSuccess'), 'success');
                onSuccess();
                onClose();
            } else {
                addToast(result.error || 'Failed to save expense', 'error');
            }
        } catch (error) {
            console.error('Submit error:', error);
            addToast('An error occurred while saving.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editId ? t('expenses.editTitle') : t('expenses.addTitle')}
            description={t('expenses.formDescription')}
        >
            {fetching ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F5C542]" />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className={cn("text-sm font-medium", errors.categoryId ? "text-red-500" : "text-[#A1A1AA]")}>
                                {t('expenses.category')} {errors.categoryId && <span className="text-xs ml-1">({t('common.required')})</span>}
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    if (isReorderMode && user?.id) {
                                        // Commit changes to localStorage only when clicking "Done"
                                        localStorage.setItem(`expense_order_category_${user.id}`, JSON.stringify(categories.map(c => c.id.toString())));
                                        localStorage.setItem(`expense_order_channel_${user.id}`, JSON.stringify(paymentChannels.map(pc => pc.id.toString())));
                                        localStorage.setItem(`expense_hidden_${user.id}`, JSON.stringify(hiddenItems));
                                    }
                                    setIsReorderMode(!isReorderMode);
                                }}
                                className={cn(
                                    "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                    isReorderMode
                                        ? "bg-[#F5C542] text-[#15140F] shadow-lg shadow-[#F5C542]/20"
                                        : "bg-[#2E2C24] text-[#A1A1AA] hover:text-[#FAFAFA]"
                                )}
                            >
                                <Settings2 className="w-3 h-3" />
                                {isReorderMode ? t('common.done') : t('common.rearrange')}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {categories
                                .filter(cat => !hiddenItems.category.includes(cat.id.toString()))
                                .map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        draggable={isReorderMode}
                                        onDragStart={() => handleDragStart(cat.id.toString(), 'category')}
                                        onDragOver={(e) => handleDragOver(e, cat.id.toString(), 'category')}
                                        onDragEnd={() => setDraggedItem(null)}
                                        onClick={() => {
                                            if (isReorderMode) return;
                                            handleChange('categoryId', cat.id.toString());
                                            setErrors(prev => ({ ...prev, categoryId: '' }));
                                        }}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 group relative overflow-hidden",
                                            formData.categoryId === cat.id.toString()
                                                ? "bg-[#1C1B16] border-[#F5C542] text-[#F5C542] shadow-[0_0_15px_rgba(245,197,66,0.1)]"
                                                : "bg-[#1C1B16] border-[#2E2C24] text-[#71717A] hover:border-[#F5C542] hover:text-[#FAFAFA]",
                                            isReorderMode && "cursor-move border-dashed border-[#F5C542]/50 scale-[0.98]",
                                            draggedItem?.id === cat.id.toString() && "opacity-20"
                                        )}
                                    >
                                        {isReorderMode && (
                                            <div className="absolute top-1 right-1 flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleHideItem(e, cat.id.toString(), 'category')}
                                                    className="p-1 rounded-md hover:bg-red-500/20 text-[#71717A] hover:text-red-500 transition-colors"
                                                >
                                                    <EyeOff className="w-3 h-3" />
                                                </button>
                                                <GripVertical className="w-3 h-3 text-[#F5C542] opacity-40 cursor-move" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                            formData.categoryId === cat.id.toString() ? "bg-[#F5C542] text-[#15140F]" : "bg-[#15140F] text-[#71717A] group-hover:text-[#F5C542]"
                                        )}>
                                            {getIcon(cat.name)}
                                        </div>
                                        <span className="text-xs font-medium truncate w-full text-center">
                                            {cat.name}
                                            {cat.is_system && <span className="ml-1 text-[9px] text-yellow-500/70" title="System Category">●</span>}
                                        </span>
                                    </button>
                                ))}
                            <button
                                type="button"
                                onClick={() => setShowAddCategory(true)}
                                className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-[#2E2C24] text-[#71717A] hover:border-[#F5C542] hover:text-[#F5C542] transition-all gap-2 bg-[#1C1B16]/50"
                            >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#15140F]">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-medium">{t('common.custom')}</span>
                            </button>
                        </div>

                        {showAddCategory && (
                            <div className="flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
                                <Input
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder={t('expenses.enterCategoryName')}
                                    className="h-9 text-sm bg-[#1C1B16] border-[#2E2C24]"
                                    autoFocus
                                />
                                <button type="button" onClick={handleAddCategory} className="p-2 text-[#F5C542] hover:bg-[#F5C542]/10 rounded-lg">
                                    <Check className="w-5 h-5" />
                                </button>
                                <button type="button" onClick={() => setShowAddCategory(false)} className="p-2 text-[#71717A] hover:bg-white/5 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Main Input Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <label className={cn("text-sm font-medium", errors.itemName ? "text-red-500" : "text-[#A1A1AA]")}>
                                {t('expenses.itemName')} {errors.itemName && <span className="text-xs ml-1">*</span>}
                            </label>
                            <Input
                                value={formData.itemName}
                                onChange={(e) => {
                                    handleChange('itemName', e.target.value);
                                    setErrors(prev => ({ ...prev, itemName: '' }));
                                }}
                                className={cn("bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] focus:ring-[#F5C542]", errors.itemName && "border-red-500/50")}
                                placeholder="e.g. Weekly Groceries"
                            />
                        </div>

                        {/* Row: Date & Amount (Equal Width) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#A1A1AA]">{t('common.date')}</label>
                            <div className="relative group">
                                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] w-4 h-4 pointer-events-none group-focus-within:text-[#F5C542] transition-colors" />
                                <Input
                                    type="date"
                                    value={formData.transactionDate}
                                    onChange={(e) => handleChange('transactionDate', e.target.value)}
                                    className="bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] focus:ring-[#F5C542] pl-10 h-10 w-full"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className={cn("text-sm font-medium", errors.amount ? "text-red-500" : "text-[#A1A1AA]")}>
                                {t('expenses.amount')} {errors.amount && <span className="text-xs ml-1">*</span>}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] text-sm">฿</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => {
                                        handleChange('amount', e.target.value);
                                        setErrors(prev => ({ ...prev, amount: '' }));
                                    }}
                                    className={cn("bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] focus:ring-[#F5C542] pl-8 h-10 w-full", errors.amount && "border-red-500/50")}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Row: Qty & Total */}
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#A1A1AA]">{t('expenses.qty')}</label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.duration}
                                    onChange={(e) => handleChange('duration', e.target.value)}
                                    className="bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] focus:ring-[#F5C542]"
                                    placeholder="1"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#F5C542]">{t('expenses.totalAmount')}</label>
                                <div className="h-10 px-3 flex items-center bg-[#1C1B16] border border-[#F5C542]/30 rounded-lg text-[#F5C542] font-black">
                                    ฿{((parseFloat(formData.amount) || 0) * (parseInt(formData.duration) || 1)).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Channel Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className={cn("text-sm font-medium", errors.paymentChannelId ? "text-red-500" : "text-[#A1A1AA]")}>
                                {t('expenses.paymentChannel')} {errors.paymentChannelId && <span className="text-xs ml-1">({t('common.required')})</span>}
                            </label>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                            {paymentChannels
                                .filter(chan => !hiddenItems.channel.includes(chan.id.toString()))
                                .map((chan) => (
                                    <button
                                        key={chan.id}
                                        type="button"
                                        draggable={isReorderMode}
                                        onDragStart={() => handleDragStart(chan.id.toString(), 'channel')}
                                        onDragOver={(e) => handleDragOver(e, chan.id.toString(), 'channel')}
                                        onDragEnd={() => setDraggedItem(null)}
                                        onClick={() => {
                                            if (isReorderMode) return;
                                            handleChange('paymentChannelId', chan.id.toString());
                                            setErrors(prev => ({ ...prev, paymentChannelId: '' }));
                                        }}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 group relative overflow-hidden",
                                            formData.paymentChannelId === chan.id.toString()
                                                ? "bg-[#1C1B16] border-[#F5C542] text-[#F5C542] shadow-[0_0_15px_rgba(245,197,66,0.1)]"
                                                : "bg-[#1C1B16] border-[#2E2C24] text-[#71717A] hover:border-[#F5C542] hover:text-[#FAFAFA]",
                                            isReorderMode && "cursor-move border-dashed border-[#F5C542]/50 scale-[0.98]",
                                            draggedItem?.id === chan.id.toString() && "opacity-20"
                                        )}
                                    >
                                        {isReorderMode && (
                                            <div className="absolute top-1 right-1 flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleHideItem(e, chan.id.toString(), 'channel')}
                                                    className="p-1 rounded-md hover:bg-red-500/20 text-[#71717A] hover:text-red-500 transition-colors"
                                                >
                                                    <EyeOff className="w-3 h-3" />
                                                </button>
                                                <GripVertical className="w-3 h-3 text-[#F5C542] opacity-40 cursor-move" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                            formData.paymentChannelId === chan.id.toString() ? "bg-[#F5C542] text-[#15140F]" : "bg-[#15140F] text-[#71717A] group-hover:text-[#F5C542]"
                                        )}>
                                            {getIcon(chan.name)}
                                        </div>
                                        <span className="text-xs font-medium truncate w-full text-center">
                                            {chan.name}
                                            {chan.is_system && <span className="ml-1 text-[9px] text-yellow-500/70" title="System Channel">●</span>}
                                        </span>
                                    </button>
                                ))}
                            <button
                                type="button"
                                onClick={() => setShowAddChannel(true)}
                                className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-[#2E2C24] text-[#71717A] hover:border-[#F5C542] hover:text-[#F5C542] transition-all gap-2 bg-[#1C1B16]/50"
                            >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#15140F]">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-medium">{t('expenses.addChannel')}</span>
                            </button>
                        </div>

                        {showAddChannel && (
                            <div className="flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
                                <Input
                                    value={newChannelName}
                                    onChange={(e) => setNewChannelName(e.target.value)}
                                    placeholder={t('expenses.enterChannelName')}
                                    className="h-9 text-sm bg-[#1C1B16] border-[#2E2C24]"
                                    autoFocus
                                />
                                <button type="button" onClick={handleAddChannel} className="p-2 text-[#F5C542] hover:bg-[#F5C542]/10 rounded-lg">
                                    <Check className="w-5 h-5" />
                                </button>
                                <button type="button" onClick={() => setShowAddChannel(false)} className="p-2 text-[#71717A] hover:bg-white/5 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Payment Type Grid Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-[#A1A1AA]">{t('expenses.paymentType')}</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                disabled={!!editId}
                                onClick={() => handleChange('paymentType', 'FULL')}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                                    formData.paymentType === 'FULL'
                                        ? "bg-[#1C1B16] border-[#F5C542] text-[#F5C542] shadow-[0_0_15px_rgba(245,197,66,0.1)]"
                                        : "bg-[#1C1B16] border-[#2E2C24] text-[#71717A] hover:border-[#F5C542] hover:text-[#FAFAFA]",
                                    editId && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                    formData.paymentType === 'FULL' ? "bg-[#F5C542] text-[#15140F]" : "bg-[#15140F] text-[#71717A]"
                                )}>
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold uppercase tracking-wide">{t('expenses.fullPayment')}</p>
                                    <p className="text-[10px] opacity-60">{t('expenses.fullPaymentDesc')}</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                disabled={!!editId}
                                onClick={() => handleChange('paymentType', 'INSTALLMENT')}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                                    formData.paymentType === 'INSTALLMENT'
                                        ? "bg-[#1C1B16] border-[#F5C542] text-[#F5C542] shadow-[0_0_15px_rgba(245,197,66,0.1)]"
                                        : "bg-[#1C1B16] border-[#2E2C24] text-[#71717A] hover:border-[#F5C542] hover:text-[#FAFAFA]",
                                    editId && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                    formData.paymentType === 'INSTALLMENT' ? "bg-[#F5C542] text-[#15140F]" : "bg-[#15140F] text-[#71717A]"
                                )}>
                                    <CalendarDays className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold uppercase tracking-wide">{t('expenses.installment')}</p>
                                    <p className="text-[10px] opacity-60">{t('expenses.installmentDesc')}</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Installment Periods & Note Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.paymentType === 'INSTALLMENT' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#A1A1AA]">{t('expenses.installmentPeriods')}</label>
                                <Input
                                    type="number"
                                    value={formData.installmentPeriods}
                                    onChange={(e) => handleChange('installmentPeriods', e.target.value)}
                                    className="bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] focus:ring-[#F5C542]"
                                    placeholder={t('expenses.installmentPlaceholder')}
                                    disabled={!!editId}
                                />
                            </div>
                        )}
                    </div>
                    {/* Note Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#A1A1AA]">{t('expenses.notes')}</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => handleChange('note', e.target.value)}
                            className="w-full bg-[#1C1B16] border border-[#2E2C24] rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-[#F5C542] min-h-[80px] outline-none resize-none"
                            placeholder={t('expenses.notesPlaceholder')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#A1A1AA]">{t('expenses.necessity')}</label>
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
                                        {type === 'NEED' ? t('expenses.need') : t('expenses.want')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#A1A1AA]">{t('common.status')}</label>
                            <div className={cn(
                                "flex p-1 rounded-xl border border-[#2E2C24]",
                                formData.paymentType === 'INSTALLMENT' ? "bg-black/20 opacity-60" : "bg-[#1C1B16]"
                            )}>
                                {['PAID', 'PENDING'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        disabled={formData.paymentType === 'INSTALLMENT'}
                                        onClick={() => handleChange('status', s)}
                                        className={cn(
                                            "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5",
                                            formData.status === s
                                                ? (s === 'PAID' ? "bg-green-500/20 text-green-500 border border-green-500/30" : "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30")
                                                : "text-[#71717A]"
                                        )}
                                    >
                                        {s === 'PAID' && <CheckCircle className="w-3.5 h-3.5" />}
                                        {s === 'PAID' ? t('expenses.filters.paid').toUpperCase() : t('expenses.filters.pending').toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            {formData.paymentType === 'INSTALLMENT' && (
                                <p className="text-[10px] text-[#71717A] mt-1 italic">
                                    * Status will be updated based on installments
                                </p>
                            )}
                        </div>
                    </div>

                    {editId && formData.paymentType === 'INSTALLMENT' && installments.length > 0 && (
                        <div className="space-y-4 border-t border-[#2E2C24] pt-4 mt-2">
                            <h3 className="text-sm font-medium text-[#FAFAFA]">{t('expenses.installmentSchedule')}</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-[#A1A1AA]">
                                    <thead>
                                        <tr className="text-left border-b border-[#2E2C24]">
                                            <th className="pb-2 font-medium">{t('expenses.period')}</th>
                                            <th className="pb-2 font-medium">{t('expenses.dueDate')}</th>
                                            <th className="pb-2 font-medium text-right">{t('expenses.amount')}</th>
                                            <th className="pb-2 font-medium pl-4">{t('common.status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#2E2C24]">
                                        {installments.map((inst, index) => (
                                            <tr key={inst.id}>
                                                <td className="py-3">{inst.period_number}</td>
                                                <td className="py-3">{new Date(inst.due_date).toLocaleDateString('en-GB')}</td>
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
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[#F5C542] text-[#15140F] hover:bg-[#FFC83D] min-w-[160px] h-12 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-[#F5C542]/10"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editId ? t('common.save') : t('expenses.addExpense'))}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
