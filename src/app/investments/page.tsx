'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { SummaryCards, AssetAllocation, InvestmentTable, InvestmentForm } from '@/components/investments';
import { Button, Input, Select, Modal, Badge, Loading, EmptyState } from '@/components/ui';
import { useAuthStore, useInvestmentStore, useUIStore, useToastStore } from '@/lib/store';
import { useTranslation } from '@/lib/useTranslation';
import { Investment, InvestmentFormData, InvestmentFilters } from '@/types';
import { Plus, Search, Filter, X, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function InvestmentsPage() {
    const { token, user } = useAuthStore();
    const { t } = useTranslation();
    const {
        investments,
        pagination,
        filters,
        isLoading,
        setInvestments,
        setFilters,
        setPage,
        setLimit,
        setLoading,
        setSelectedInvestment,
        selectedInvestment,
        addInvestment,
        updateInvestment,
        removeInvestment,
    } = useInvestmentStore();
    const { modalOpen, modalType, openModal, closeModal } = useUIStore();
    const { addToast } = useToastStore();

    const [activeTab, setActiveTab] = useState<'overview' | 'list'>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<Investment | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Calculate summary data
    const [summaryData, setSummaryData] = useState({
        totalValue: 0,
        totalProfitLoss: 0,
        profitLossPercentage: 0,
        totalAssets: 0,
        openPositions: 0,
        closedPositions: 0,
    });

    const [allocationData, setAllocationData] = useState<
        { category: string; value: number; percentage: number; color: string }[]
    >([]);

    const colors = {
        GOLD: '#f59e0b',
        CRYPTO: '#8b5cf6',
        STOCK: '#3b82f6',
    };

    // Fetch investments
    const fetchInvestments = async () => {
        if (!token) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            if (filters.asset_category) params.set('asset_category', filters.asset_category);
            if (filters.strategy_type) params.set('strategy_type', filters.strategy_type);
            if (filters.status) params.set('status', filters.status);
            if (searchQuery) params.set('search', searchQuery);

            const response = await apiClient.fetch(`/api/investments?${params}`);

            const data = await response.json();
            if (data.success) {
                setInvestments(data);

                // Use aggregate stats from backend
                if (data.stats) {
                    const stats = data.stats;
                    setSummaryData({
                        totalValue: stats.totalValue,
                        totalProfitLoss: stats.totalProfitLoss,
                        profitLossPercentage: stats.profitLossPercentage,
                        totalAssets: data.total,
                        openPositions: stats.openPositions,
                        closedPositions: stats.closedPositions,
                    });

                    // Update allocation data with colors
                    const allocation = stats.assetAllocation.map((item: any) => ({
                        ...item,
                        color: colors[item.category as keyof typeof colors] || '#6b7280',
                    }));
                    setAllocationData(allocation);
                }
            }
        } catch (error) {
            console.error('Fetch investments error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced fetch to prevent multiple rapid calls
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchInvestments();
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [token, pagination.page, pagination.limit, filters.asset_category, filters.strategy_type, filters.status, searchQuery]);

    // Handle Tab Switch - Reset filters when going to overview
    const handleTabChange = (tab: 'overview' | 'list') => {
        if (tab === 'overview' && activeTab !== 'overview') {
            // Batch all resets together
            setFilters({});
            setSearchQuery('');
            setPage(1);
        }
        setActiveTab(tab);
    };

    // Handle add investment
    // Handle add investment
    const handleAddInvestment = async (data: InvestmentFormData) => {
        if (!token || isLoading) return;

        try {
            const response = await apiClient.fetch('/api/investments', {
                method: 'POST',
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.success) {
                addInvestment(result.data);
                fetchInvestments();
                closeModal(); // Ensure modal is closed on success
                addToast(t('investment.addSuccess'), 'success');
            } else {
                console.error('Failed to add investment:', result.error);
                addToast(result.error || t('common.error'), 'error');
            }
        } catch (error) {
            console.error('Add investment network error:', error);
            addToast(t('common.error'), 'error');
        }
    };

    // Handle edit investment
    const handleEditInvestment = async (data: InvestmentFormData) => {
        if (!token || !selectedInvestment || isLoading) return;

        const response = await apiClient.fetch(`/api/investments/${selectedInvestment.id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (result.success) {
            updateInvestment(result.data);
            fetchInvestments();
            closeModal();
            setSelectedInvestment(null);
            addToast(t('investment.updateSuccess'), 'success');
        }
    };

    // Handle delete investment
    const handleDeleteInvestment = async () => {
        if (!token || !deleteConfirm || deleting) return;

        setDeleting(true);
        try {
            const response = await apiClient.fetch(`/api/investments/${deleteConfirm.id}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            if (result.success) {
                removeInvestment(deleteConfirm.id);
                setDeleteConfirm(null);
                fetchInvestments();
                addToast(t('investment.deleteSuccess'), 'success');
            }
        } finally {
            setDeleting(false);
        }
    };

    // Handle search
    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setPage(1);
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({});
        setSearchQuery('');
        setPage(1);
    };

    const hasActiveFilters = filters.asset_category || filters.strategy_type || filters.status || searchQuery;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{t('common.investment')}</h1>
                        <p className="text-muted-foreground">{t('investment.managePortfolio')}</p>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedInvestment(null);
                            openModal('add');
                        }}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        {t('investment.addInvestment')}
                    </Button>
                </div>

                {/* Tabs */}
                <div className="border-b border-border">
                    <nav className="flex gap-8">
                        <button
                            onClick={() => handleTabChange('overview')}
                            className={`py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {t('common.overview')}
                        </button>
                        <button
                            onClick={() => handleTabChange('list')}
                            className={`py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'list'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {t('investment.investmentList')}
                        </button>
                    </nav>
                </div>

                {/* Content */}
                {isLoading && investments.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <Loading size="lg" text={t('common.loading')} />
                    </div>
                ) : activeTab === 'overview' ? (
                    <div className="space-y-6">
                        <SummaryCards data={summaryData} />
                        <AssetAllocation data={allocationData} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Filters Bar */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder={t('investment.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    leftIcon={<Search className="w-4 h-4" />}
                                    rightIcon={
                                        searchQuery ? (
                                            <button onClick={() => handleSearch('')}>
                                                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                            </button>
                                        ) : undefined
                                    }
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={showFilters ? 'primary' : 'outline'}
                                    onClick={() => setShowFilters(!showFilters)}
                                    leftIcon={<Filter className="w-4 h-4" />}
                                    className={showFilters
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-transparent'
                                        : 'bg-transparent border-border text-muted-foreground hover:text-primary hover:border-primary hover:bg-muted/5'
                                    }
                                >
                                    {t('common.filter')}
                                    {hasActiveFilters && (
                                        <span className="ml-1.5 w-2 h-2 rounded-full bg-primary-foreground" />
                                    )}
                                </Button>
                                {hasActiveFilters && (
                                    <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground hover:bg-muted/10">
                                        {t('common.clear')}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Filter Panel */}
                        {showFilters && (
                            <div className="p-4 rounded-xl bg-card border border-border grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <Select
                                    label={t('investment.assetType')}
                                    placeholder={t('common.all')}
                                    options={[
                                        { value: 'GOLD', label: t('investment.type.gold') },
                                        { value: 'CRYPTO', label: t('investment.type.crypto') },
                                        { value: 'STOCK', label: t('investment.type.stock') },
                                    ]}
                                    value={filters.asset_category || ''}
                                    onChange={(value) =>
                                        setFilters({ ...filters, asset_category: value as InvestmentFilters['asset_category'] || undefined })
                                    }
                                />
                                <Select
                                    label={t('investment.strategy')}
                                    placeholder={t('common.all')}
                                    options={[
                                        { value: 'DCA', label: 'DCA' },
                                        { value: 'LONG_TERM', label: 'Long Term' },
                                        { value: 'TRADE', label: 'Trade' },
                                    ]}
                                    value={filters.strategy_type || ''}
                                    onChange={(value) =>
                                        setFilters({ ...filters, strategy_type: value as InvestmentFilters['strategy_type'] || undefined })
                                    }
                                />
                                <Select
                                    label={t('common.status')}
                                    placeholder={t('common.all')}
                                    options={[
                                        { value: 'OPEN', label: t('investment.status.open') },
                                        { value: 'CLOSED', label: t('investment.status.closed') },
                                    ]}
                                    value={filters.status || ''}
                                    onChange={(value) =>
                                        setFilters({ ...filters, status: value as InvestmentFilters['status'] || undefined })
                                    }
                                />
                            </div>
                        )}

                        {/* Table */}
                        <InvestmentTable
                            investments={investments}
                            isLoading={isLoading}
                            pagination={pagination}
                            onPageChange={setPage}
                            onLimitChange={setLimit}
                            onEdit={(inv) => {
                                setSelectedInvestment(inv);
                                openModal('edit');
                            }}
                            onDelete={(inv) => setDeleteConfirm(inv)}
                        />
                    </div>
                )}

                {/* Add/Edit Modal */}
                {(modalType === 'add' || modalType === 'edit') && (
                    <InvestmentForm
                        isOpen={modalOpen}
                        onClose={() => {
                            closeModal();
                            setSelectedInvestment(null);
                        }}
                        onSubmit={modalType === 'add' ? handleAddInvestment : handleEditInvestment}
                        initialData={selectedInvestment ? {
                            ...selectedInvestment,
                            note: selectedInvestment.note ?? '',
                        } : undefined}
                        mode={modalType}
                    />
                )}

                {/* View Modal Removed */}

                {/* Delete Confirmation */}
                {deleteConfirm && (
                    <Modal
                        isOpen={!!deleteConfirm}
                        onClose={() => setDeleteConfirm(null)}
                        title={t('common.deleteTitle')}
                        size="sm"
                    >
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                {t('common.deleteMessage').replace('{item}', `${deleteConfirm.asset_code} (${deleteConfirm.asset_name})`)}
                            </p>
                            <p className="text-sm text-rose-500">{t('common.cannotUndo')}</p>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
                                    {t('common.cancel')}
                                </Button>
                                <Button variant="danger" onClick={handleDeleteInvestment} isLoading={deleting}>
                                    {t('common.delete')}
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </DashboardLayout>
    );
}
