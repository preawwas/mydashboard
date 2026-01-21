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
    CheckCircle, CalendarDays, GripVertical, Settings2, EyeOff,
    ChevronDown, ChevronUp, StickyNote
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

    // Collapsible states
    const [showNotes, setShowNotes] = useState(false);
    const [showInstallments, setShowInstallments] = useState(false);

    // Reorder & Hiding Mode
    const [isReorderMode, setIsReorderMode] = useState(false);
    const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'category' | 'channel' } | null>(null);
    const [hiddenItems, setHiddenItems] = useState<{ category: string[]; channel: string[] }>({ category: [], channel: [] });

    // Icon mapping - smaller for mobile
    const getIcon = (name: string, size: string = "w-4 h-4") => {
        const n = name.toLowerCase();
        if (n.includes('food')) return <Utensils className={size} />;
        if (n.includes('travel') || n.includes('trip')) return <Plane className={size} />;
        if (n.includes('elect') || n.includes('gadget')) return <Tv className={size} />;
        if (n.includes('bill') || n.includes('utility')) return <FileText className={size} />;
        if (n.includes('health') || n.includes('medical')) return <Activity className={size} />;
        if (n.includes('shop')) return <ShoppingBag className={size} />;
        if (n.includes('edu')) return <GraduationCap className={size} />;
        if (n.includes('bank') || n.includes('transfer')) return <Landmark className={size} />;
        if (n.includes('credit') || n.includes('card')) return <CreditCard className={size} />;
        if (n.includes('cash')) return <Coins className={size} />;
        if (n.includes('wallet') || n.includes('digital')) return <Smartphone className={size} />;
        return <Grid className={size} />;
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
            setShowNotes(false);
            setShowInstallments(false);
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
            if (catData.success) setCategories(sortData(catData.data, 'category'));
            if (chanData.success) setPaymentChannels(sortData(chanData.data, 'channel'));
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
        setHiddenItems((prev) => ({ ...prev, [type]: [...prev[type], id] }));
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim() || !token) return;
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
            const response = await fetch(`/api/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
                    duration: '1'
                });
                if (exp.expense_installments) {
                    setInstallments(exp.expense_installments.sort((a: any, b: any) => a.period_number - b.period_number));
                }
                if (exp.note) setShowNotes(true);
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
            if (name === 'paymentType' && value === 'INSTALLMENT') newData.status = 'PENDING';
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

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
                amount: computedTotal.toString(),
                transactionDate: formData.transactionDate,
                installments: installments
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

    // Compact chip button for Category/Channel
    const ChipButton = ({
        item,
        type,
        isSelected
    }: {
        item: Category | PaymentChannel;
        type: 'category' | 'channel';
        isSelected: boolean;
    }) => (
        <button
            type="button"
            draggable={isReorderMode}
            onDragStart={() => handleDragStart(item.id.toString(), type)}
            onDragOver={(e) => handleDragOver(e, item.id.toString(), type)}
            onDragEnd={() => setDraggedItem(null)}
            onClick={() => {
                if (isReorderMode) return;
                handleChange(type === 'category' ? 'categoryId' : 'paymentChannelId', item.id.toString());
                setErrors(prev => ({ ...prev, [type === 'category' ? 'categoryId' : 'paymentChannelId']: '' }));
            }}
            className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all text-xs font-medium relative",
                isSelected
                    ? "bg-[#F5C542] border-[#F5C542] text-[#15140F]"
                    : "bg-[#1C1B16] border-[#2E2C24] text-[#A1A1AA] hover:border-[#F5C542]/50 hover:text-[#FAFAFA]",
                isReorderMode && "cursor-move border-dashed animate-pulse",
                draggedItem?.id === item.id.toString() && "opacity-20"
            )}
        >
            {isReorderMode && (
                <button
                    type="button"
                    onClick={(e) => handleHideItem(e, item.id.toString(), type)}
                    className="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-500 text-white hover:bg-red-600 z-10"
                >
                    <X className="w-2.5 h-2.5" />
                </button>
            )}
            <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                isSelected ? "bg-[#15140F]/20" : "bg-[#2E2C24]"
            )}>
                {getIcon(item.name, "w-3 h-3")}
            </span>
            <span className="truncate max-w-[80px]">{item.name}</span>
        </button>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editId ? t('expenses.editTitle') : t('expenses.addTitle')}
            size="lg"
        >
            {fetching ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#F5C542]" />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Top Row: Category Label + Necessity Toggle + Rearrange */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <label className={cn("text-xs font-medium", errors.categoryId ? "text-red-500" : "text-[#A1A1AA]")}>
                                {t('expenses.category')} {errors.categoryId && <span className="text-red-500">*</span>}
                            </label>
                            <div className="flex items-center gap-2">
                                {/* Necessity Toggle - Compact */}
                                <div className="flex bg-[#15140F] p-0.5 rounded-full border border-[#2E2C24]">
                                    {['NEED', 'WANT'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handleChange('necessity', type)}
                                            className={cn(
                                                "px-2.5 py-1 text-[10px] font-bold uppercase rounded-full transition-all",
                                                formData.necessity === type
                                                    ? "bg-[#F5C542] text-[#15140F]"
                                                    : "text-[#71717A] hover:text-[#FAFAFA]"
                                            )}
                                        >
                                            {type === 'NEED' ? t('expenses.need') : t('expenses.want')}
                                        </button>
                                    ))}
                                </div>
                                {/* Rearrange Button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isReorderMode && user?.id) {
                                            localStorage.setItem(`expense_order_category_${user.id}`, JSON.stringify(categories.map(c => c.id.toString())));
                                            localStorage.setItem(`expense_order_channel_${user.id}`, JSON.stringify(paymentChannels.map(pc => pc.id.toString())));
                                            localStorage.setItem(`expense_hidden_${user.id}`, JSON.stringify(hiddenItems));
                                        }
                                        setIsReorderMode(!isReorderMode);
                                    }}
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                                        isReorderMode ? "bg-[#F5C542] text-[#15140F]" : "bg-[#2E2C24] text-[#71717A] hover:text-[#FAFAFA]"
                                    )}
                                >
                                    <Settings2 className="w-3 h-3" />
                                    {isReorderMode ? t('common.done') : t('common.rearrange')}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {categories
                                .filter(cat => !hiddenItems.category.includes(cat.id.toString()))
                                .map((cat) => (
                                    <ChipButton
                                        key={cat.id}
                                        item={cat}
                                        type="category"
                                        isSelected={formData.categoryId === cat.id.toString()}
                                    />
                                ))}
                            <button
                                type="button"
                                onClick={() => setShowAddCategory(true)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-dashed border-[#2E2C24] text-[#71717A] hover:border-[#F5C542] hover:text-[#F5C542] transition-all text-xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{t('common.custom')}</span>
                            </button>
                        </div>

                        {showAddCategory && (
                            <div className="flex items-center gap-2 animate-in fade-in">
                                <Input
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder={t('expenses.enterCategoryName')}
                                    className="h-8 text-xs bg-[#1C1B16] border-[#2E2C24] flex-1"
                                    autoFocus
                                />
                                <button type="button" onClick={handleAddCategory} className="p-1.5 text-[#F5C542] hover:bg-[#F5C542]/10 rounded-full">
                                    <Check className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={() => setShowAddCategory(false)} className="p-1.5 text-[#71717A] hover:bg-white/5 rounded-full">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Item Name */}
                    <div className="space-y-1.5">
                        <label className={cn("text-xs font-medium", errors.itemName ? "text-red-500" : "text-[#A1A1AA]")}>
                            {t('expenses.itemName')} {errors.itemName && <span className="text-red-500">*</span>}
                        </label>
                        <Input
                            value={formData.itemName}
                            onChange={(e) => {
                                handleChange('itemName', e.target.value);
                                setErrors(prev => ({ ...prev, itemName: '' }));
                            }}
                            className={cn("h-10 bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA]", errors.itemName && "border-red-500/50")}
                            placeholder="e.g. Weekly Groceries"
                        />
                    </div>

                    {/* Amount Row - Mobile Friendly */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className={cn("text-xs font-medium", errors.amount ? "text-red-500" : "text-[#A1A1AA]")}>
                                {t('expenses.amount')} {errors.amount && <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] text-sm font-medium">฿</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    inputMode="decimal"
                                    value={formData.amount}
                                    onChange={(e) => {
                                        handleChange('amount', e.target.value);
                                        setErrors(prev => ({ ...prev, amount: '' }));
                                    }}
                                    className={cn("h-10 bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA] pl-8", errors.amount && "border-red-500/50")}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[#A1A1AA]">{t('expenses.qty')}</label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                min="1"
                                value={formData.duration}
                                onChange={(e) => handleChange('duration', e.target.value)}
                                className="h-10 bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA]"
                                placeholder="1"
                            />
                        </div>
                    </div>

                    {/* Date & Total Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[#A1A1AA]">{t('common.date')}</label>
                            <Input
                                type="date"
                                value={formData.transactionDate}
                                onChange={(e) => handleChange('transactionDate', e.target.value)}
                                className="h-10 bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[#F5C542]">{t('expenses.totalAmount')}</label>
                            <div className="h-10 px-3 flex items-center bg-[#1C1B16] border border-[#F5C542]/30 rounded-lg text-[#F5C542] font-bold">
                                ฿{((parseFloat(formData.amount) || 0) * (parseInt(formData.duration) || 1)).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Payment Channel - Grid Wrap */}
                    <div className="space-y-2">
                        <label className={cn("text-xs font-medium", errors.paymentChannelId ? "text-red-500" : "text-[#A1A1AA]")}>
                            {t('expenses.paymentChannel')} {errors.paymentChannelId && <span className="text-red-500">*</span>}
                        </label>

                        <div className="flex flex-wrap gap-2">
                            {paymentChannels
                                .filter(chan => !hiddenItems.channel.includes(chan.id.toString()))
                                .map((chan) => (
                                    <ChipButton
                                        key={chan.id}
                                        item={chan}
                                        type="channel"
                                        isSelected={formData.paymentChannelId === chan.id.toString()}
                                    />
                                ))}
                            <button
                                type="button"
                                onClick={() => setShowAddChannel(true)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-dashed border-[#2E2C24] text-[#71717A] hover:border-[#F5C542] hover:text-[#F5C542] transition-all text-xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{t('expenses.addChannel')}</span>
                            </button>
                        </div>

                        {showAddChannel && (
                            <div className="flex items-center gap-2 animate-in fade-in">
                                <Input
                                    value={newChannelName}
                                    onChange={(e) => setNewChannelName(e.target.value)}
                                    placeholder={t('expenses.enterChannelName')}
                                    className="h-8 text-xs bg-[#1C1B16] border-[#2E2C24] flex-1"
                                    autoFocus
                                />
                                <button type="button" onClick={handleAddChannel} className="p-1.5 text-[#F5C542] hover:bg-[#F5C542]/10 rounded-full">
                                    <Check className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={() => setShowAddChannel(false)} className="p-1.5 text-[#71717A] hover:bg-white/5 rounded-full">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Payment Type - Compact Toggle */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[#A1A1AA]">{t('expenses.paymentType')}</label>
                            <div className="flex bg-[#15140F] p-0.5 rounded-lg border border-[#2E2C24]">
                                {[
                                    { key: 'FULL', icon: <CheckCircle className="w-3.5 h-3.5" />, label: t('expenses.fullPayment') },
                                    { key: 'INSTALLMENT', icon: <CalendarDays className="w-3.5 h-3.5" />, label: t('expenses.installment') }
                                ].map((type) => (
                                    <button
                                        key={type.key}
                                        type="button"
                                        disabled={!!editId}
                                        onClick={() => handleChange('paymentType', type.key)}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md transition-all text-xs font-medium",
                                            formData.paymentType === type.key
                                                ? "bg-[#F5C542] text-[#15140F]"
                                                : "text-[#71717A] hover:text-[#FAFAFA]",
                                            editId && "opacity-50"
                                        )}
                                    >
                                        {type.icon}
                                        <span className="hidden sm:inline">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {formData.paymentType === 'INSTALLMENT' ? (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-[#A1A1AA]">{t('expenses.installmentPeriods')}</label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    value={formData.installmentPeriods}
                                    onChange={(e) => handleChange('installmentPeriods', e.target.value)}
                                    className="h-10 bg-[#1C1B16] border-[#2E2C24] text-[#FAFAFA]"
                                    placeholder="6"
                                    disabled={!!editId}
                                />
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-[#A1A1AA]">{t('common.status')}</label>
                                <div className="flex bg-[#15140F] p-0.5 rounded-lg border border-[#2E2C24]">
                                    {['PAID', 'PENDING'].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => handleChange('status', s)}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-1 py-2 rounded-md transition-all text-xs font-medium",
                                                formData.status === s
                                                    ? (s === 'PAID' ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30")
                                                    : "text-[#71717A]"
                                            )}
                                        >
                                            {s === 'PAID' && <CheckCircle className="w-3 h-3" />}
                                            {s === 'PAID' ? t('expenses.filters.paid') : t('expenses.filters.pending')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>



                    {/* Notes - Collapsible */}
                    <div className="space-y-1.5">
                        <button
                            type="button"
                            onClick={() => setShowNotes(!showNotes)}
                            className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
                        >
                            <StickyNote className="w-3.5 h-3.5" />
                            {t('expenses.notes')}
                            {formData.note && <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />}
                            {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {showNotes && (
                            <textarea
                                value={formData.note}
                                onChange={(e) => handleChange('note', e.target.value)}
                                className="w-full bg-[#1C1B16] border border-[#2E2C24] rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#F5C542] min-h-[60px] outline-none resize-none animate-in fade-in slide-in-from-top-1"
                                placeholder={t('expenses.notesPlaceholder')}
                            />
                        )}
                    </div>

                    {/* Installment Schedule - Collapsible */}
                    {editId && formData.paymentType === 'INSTALLMENT' && installments.length > 0 && (
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setShowInstallments(!showInstallments)}
                                className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
                            >
                                <CalendarDays className="w-3.5 h-3.5" />
                                {t('expenses.installmentSchedule')} ({installments.length})
                                {showInstallments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                            {showInstallments && (
                                <div className="max-h-32 overflow-y-auto bg-[#15140F] rounded-lg p-2 animate-in fade-in slide-in-from-top-1">
                                    <div className="space-y-1">
                                        {installments.map((inst, index) => (
                                            <div key={inst.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-[#1C1B16]">
                                                <span className="text-[#71717A]">#{inst.period_number}</span>
                                                <span className="text-[#A1A1AA]">{new Date(inst.due_date).toLocaleDateString('en-GB')}</span>
                                                <span className="text-[#FAFAFA] font-medium">฿{inst.amount.toLocaleString()}</span>
                                                <select
                                                    value={inst.status}
                                                    onChange={(e) => {
                                                        const updated = [...installments];
                                                        updated[index] = { ...inst, status: e.target.value };
                                                        setInstallments(updated);
                                                        handleChange('status', updated.every(i => i.status === 'PAID') ? 'PAID' : 'PENDING');
                                                    }}
                                                    className={cn(
                                                        "bg-transparent border-none text-[10px] font-bold uppercase focus:ring-0 cursor-pointer",
                                                        inst.status === 'PAID' ? "text-green-400" : "text-yellow-400"
                                                    )}
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="PAID">Paid</option>
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex gap-2 pt-3 border-t border-[#2E2C24]">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-11 bg-transparent border-[#2E2C24] hover:bg-[#2E2C24]"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-11 bg-[#F5C542] text-[#15140F] hover:bg-[#FFC83D] font-bold uppercase tracking-wider"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editId ? t('common.save') : t('expenses.addExpense'))}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
