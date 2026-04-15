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
import { apiClient } from '@/lib/api-client';

interface ExpenseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editId?: string | null;
}

export default function ExpenseFormModal({ isOpen, onClose, onSuccess, editId }: ExpenseFormModalProps) {
    const { token, user } = useAuthStore();
    const { addToast } = useToastStore();
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
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
                apiClient.fetch('/api/categories'),
                apiClient.fetch('/api/payment-channels')
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
        if (!newCategoryName.trim() || !token || actionLoading) return;
        setActionLoading(true);
        try {
            const response = await apiClient.fetch('/api/categories', {
                method: 'POST',
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
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddChannel = async () => {
        if (!newChannelName.trim() || !token || actionLoading) return;
        setActionLoading(true);
        try {
            const response = await apiClient.fetch('/api/payment-channels', {
                method: 'POST',
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
        } finally {
            setActionLoading(false);
        }
    };

    const fetchExpenseDetail = async (id: string) => {
        if (!token) return;
        setFetching(true);
        try {
            const response = await apiClient.fetch(`/api/expenses/${id}`);
            const result = await response.json();
            if (result.success) {
                const exp = result.data;
                setFormData({
                    itemName: exp.item_name,
                    amount: exp.amount_total.toString(),
                    paymentChannelId: exp.payment_channel_id?.toString() || '',
                    paymentType: (exp.expense_installments && exp.expense_installments.length > 0) ? 'INSTALLMENT' : (exp.payment_type?.toUpperCase() || 'FULL'),
                    installmentPeriods: exp.expense_installments?.length.toString() || '',
                    necessity: exp.necessity || 'NEED',
                    note: exp.note || '',
                    status: exp.status || 'PAID',
                    transactionDate: exp.transaction_date ? exp.transaction_date.split('T')[0] : new Date().toLocaleDateString('sv-SE'),
                    categoryId: exp.category_id?.toString() || '',
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
            if (name === 'paymentType') {
                if (value === 'INSTALLMENT') {
                    newData.status = 'PENDING';
                } else if (value === 'FULL') {
                    newData.installmentPeriods = ''; // Clear installments
                }
            }
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || loading) return;

        const newErrors: Record<string, string> = {};
        if (!formData.categoryId) newErrors.categoryId = 'Category is required';
        if (!formData.paymentChannelId) newErrors.paymentChannelId = 'Payment channel is required';
        if (!formData.itemName) newErrors.itemName = 'Item name is required';
        if (!formData.amount) newErrors.amount = 'Amount is required';

        if (formData.paymentType === 'INSTALLMENT') {
            if (!formData.installmentPeriods || parseInt(formData.installmentPeriods) <= 0) {
                // No error message as requested, just block submission
                setLoading(false);
                return;
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            addToast('Please fill in all required fields', 'warning');
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const url = editId ? `/api/expenses/${editId}` : '/api/expenses';
            const method = editId ? 'PATCH' : 'POST';
            const computedTotal = (parseFloat(formData.amount) || 0) * (parseInt(formData.duration) || 1);

            const payload: any = {
                ...formData,
                amount: computedTotal.toString(),
                transactionDate: formData.transactionDate,
                installments: formData.paymentType === 'FULL' ? [] : installments
            };

            // Ensure installmentPeriods is NOT sent as an empty string (prevents Number("") -> 0 issue)
            if (formData.paymentType === 'FULL') {
                delete payload.installmentPeriods;
            }

            const response = await apiClient.fetch(url, {
                method,
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.success) {
                addToast(editId ? 'Expense updated successfully' : 'Expense added successfully', 'success');
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
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
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
                isSelected ? "bg-primary-foreground/20" : "bg-muted/10"
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
            title={editId ? 'Edit Expense' : 'Add Expense'}
            size="lg"
        >
            {fetching ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Top Row: Category Label + Necessity Toggle + Rearrange */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <label className={cn("text-xs font-medium", errors.categoryId ? "text-destructive" : "text-muted-foreground")}>
                                Category {errors.categoryId && <span className="text-destructive">*</span>}
                            </label>
                            <div className="flex items-center gap-2">
                                {/* Necessity Toggle - Compact */}
                                <div className="flex bg-background p-0.5 rounded-full border border-border">
                                    {['NEED', 'WANT'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handleChange('necessity', type)}
                                            className={cn(
                                                "px-2.5 py-1 text-[10px] font-bold uppercase rounded-full transition-all",
                                                formData.necessity === type
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {type === 'NEED' ? 'Need' : 'Want'}
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
                                        isReorderMode ? "bg-primary text-primary-foreground" : "bg-muted/20 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Settings2 className="w-3 h-3" />
                                    {isReorderMode ? 'Done' : 'Rearrange'}
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
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all text-xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Custom</span>
                            </button>
                        </div>

                        {showAddCategory && (
                            <div className="flex items-center gap-2 animate-in fade-in">
                                <Input
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Enter category name"
                                    className="h-8 text-xs bg-background border-border flex-1"
                                    autoFocus
                                />
                                <button type="button" onClick={handleAddCategory} disabled={actionLoading} className="p-1.5 text-primary hover:bg-primary/10 rounded-full disabled:opacity-50">
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </button>
                                <button type="button" onClick={() => setShowAddCategory(false)} className="p-1.5 text-muted-foreground hover:bg-muted/10 rounded-full">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Item Name */}
                    <div className="space-y-1.5">
                        <label className={cn("text-xs font-medium", errors.itemName ? "text-destructive" : "text-muted-foreground")}>
                            Item Name {errors.itemName && <span className="text-destructive">*</span>}
                        </label>
                        <Input
                            value={formData.itemName}
                            onChange={(e) => {
                                handleChange('itemName', e.target.value);
                                setErrors(prev => ({ ...prev, itemName: '' }));
                            }}
                            className={cn("h-10 bg-background border-border text-foreground", errors.itemName && "border-destructive/50")}
                            placeholder="e.g. Weekly Groceries"
                        />
                    </div>

                    {/* Amount Row - Mobile Friendly */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className={cn("text-xs font-medium", errors.amount ? "text-destructive" : "text-muted-foreground")}>
                                Amount {errors.amount && <span className="text-destructive">*</span>}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">฿</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    inputMode="decimal"
                                    value={formData.amount}
                                    onChange={(e) => {
                                        handleChange('amount', e.target.value);
                                        setErrors(prev => ({ ...prev, amount: '' }));
                                    }}
                                    className={cn("h-10 bg-background border-border text-foreground pl-8", errors.amount && "border-destructive/50")}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Qty</label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                min="1"
                                value={formData.duration}
                                onChange={(e) => handleChange('duration', e.target.value)}
                                className="h-10 bg-background border-border text-foreground"
                                placeholder="1"
                            />
                        </div>
                    </div>

                    {/* Date & Total Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Date</label>
                            <Input
                                type="date"
                                value={formData.transactionDate}
                                onChange={(e) => handleChange('transactionDate', e.target.value)}
                                className="h-10 bg-background border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-primary">Total Amount</label>
                            <div className="h-10 px-3 flex items-center bg-background border border-primary/30 rounded-lg text-primary font-bold">
                                ฿{((parseFloat(formData.amount) || 0) * (parseInt(formData.duration) || 1)).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Payment Channel - Grid Wrap */}
                    <div className="space-y-2">
                        <label className={cn("text-xs font-medium", errors.paymentChannelId ? "text-destructive" : "text-muted-foreground")}>
                            Payment Channel {errors.paymentChannelId && <span className="text-destructive">*</span>}
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
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all text-xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Channel</span>
                            </button>
                        </div>

                        {showAddChannel && (
                            <div className="flex items-center gap-2 animate-in fade-in">
                                <Input
                                    value={newChannelName}
                                    onChange={(e) => setNewChannelName(e.target.value)}
                                    placeholder="Enter channel name"
                                    className="h-8 text-xs bg-background border-border flex-1"
                                    autoFocus
                                />
                                <button type="button" onClick={handleAddChannel} disabled={actionLoading} className="p-1.5 text-primary hover:bg-primary/10 rounded-full disabled:opacity-50">
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </button>
                                <button type="button" onClick={() => setShowAddChannel(false)} className="p-1.5 text-muted-foreground hover:bg-muted/10 rounded-full">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Payment Type - Compact Toggle */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Payment Type</label>
                            <div className="flex bg-background p-0.5 rounded-lg border border-border">
                                {[
                                    { key: 'FULL', icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Full' },
                                    { key: 'INSTALLMENT', icon: <CalendarDays className="w-3.5 h-3.5" />, label: 'Installment' }
                                ].map((type) => (
                                    <button
                                        key={type.key}
                                        type="button"
                                        disabled={!!editId}
                                        onClick={() => handleChange('paymentType', type.key)}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md transition-all text-xs font-medium",
                                            formData.paymentType === type.key
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground",
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
                                <label className="text-xs font-medium text-muted-foreground">Periods</label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    min="1"
                                    value={formData.installmentPeriods}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '0') return; // Block 0
                                        handleChange('installmentPeriods', val);
                                    }}
                                    className="h-10 bg-background border-border text-foreground"
                                    placeholder="6"
                                    disabled={!!editId}
                                />
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Status</label>
                                <div className="flex bg-background p-0.5 rounded-lg border border-border">
                                    {['PAID', 'PENDING'].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => handleChange('status', s)}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-1 py-2 rounded-md transition-all text-xs font-medium",
                                                formData.status === s
                                                    ? (s === 'PAID' ? "bg-teal-400/20 text-teal-300 border border-teal-400/30" : "bg-orange-500/20 text-orange-400 border border-orange-500/30")
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            {s === 'PAID' && <CheckCircle className="w-3 h-3" />}
                                            {s === 'PAID' ? 'Paid' : 'Pending'}
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
                            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <StickyNote className="w-3.5 h-3.5" />
                            Notes
                            {formData.note && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                            {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {showNotes && (
                            <textarea
                                value={formData.note}
                                onChange={(e) => handleChange('note', e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary min-h-[60px] outline-none resize-none animate-in fade-in slide-in-from-top-1"
                                placeholder="Add some notes..."
                            />
                        )}
                    </div>

                    {/* Installment Schedule - Collapsible */}
                    {editId && formData.paymentType === 'INSTALLMENT' && installments.length > 0 && (
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setShowInstallments(!showInstallments)}
                                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <CalendarDays className="w-3.5 h-3.5" />
                                Installment Schedule ({installments.length})
                                {showInstallments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                            {showInstallments && (
                                <div className="max-h-32 overflow-y-auto bg-background rounded-lg p-2 animate-in fade-in slide-in-from-top-1">
                                    <div className="space-y-1">
                                        {installments.map((inst, index) => (
                                            <div key={inst.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-card">
                                                <span className="text-muted/60">#{inst.period_number}</span>
                                                <span className="text-muted-foreground">{new Date(inst.due_date).toLocaleDateString('en-GB')}</span>
                                                <span className="text-foreground font-medium">฿{inst.amount.toLocaleString()}</span>
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
                                                        inst.status === 'PAID' ? "text-teal-300" : "text-yellow-400"
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
                    <div className="flex flex-col md:flex-row gap-2 pt-3 border-t border-border">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1 h-11 w-full md:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={loading}
                            className="flex-1 h-11 uppercase tracking-wider w-full md:w-auto"
                        >
                            {editId ? 'Save' : 'Add Expense'}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
