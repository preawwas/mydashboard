import { useEffect, useState, useCallback } from 'react';
import { useAuthStore, useInvestmentStore, useUIStore, useToastStore } from '@/lib/store';
import { useTranslation } from '@/lib/useTranslation';
import { apiClient } from '@/lib/api-client';
import { Investment, InvestmentFormData, InvestmentFilters } from '@/types';

// ── Types ──
interface SummaryData {
    totalValue: number;
    totalProfitLoss: number;
    profitLossPercentage: number;
    totalAssets: number;
    openPositions: number;
    closedPositions: number;
}

interface AllocationItem {
    category: string;
    value: number;
    percentage: number;
    color: string;
}

interface UseInvestmentsReturn {
    // Data
    investments: Investment[];
    summaryData: SummaryData;
    allocationData: AllocationItem[];
    // State
    isLoading: boolean;
    deleting: boolean;
    activeTab: 'overview' | 'list';
    searchQuery: string;
    showFilters: boolean;
    deleteConfirm: Investment | null;
    hasActiveFilters: boolean;
    // Store proxies
    pagination: { page: number; limit: number; total: number; totalPages: number };
    filters: InvestmentFilters;
    modalOpen: boolean;
    modalType: string;
    selectedInvestment: Investment | null;
    // Actions
    setActiveTab: (tab: 'overview' | 'list') => void;
    setSearchQuery: (q: string) => void;
    setShowFilters: (show: boolean) => void;
    setDeleteConfirm: (inv: Investment | null) => void;
    handleSearch: (value: string) => void;
    clearFilters: () => void;
    handleAddInvestment: (data: InvestmentFormData) => Promise<void>;
    handleEditInvestment: (data: InvestmentFormData) => Promise<void>;
    handleDeleteInvestment: () => Promise<void>;
    openAddModal: () => void;
    openEditModal: (inv: Investment) => void;
    closeFormModal: () => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setFilters: (f: InvestmentFilters) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    GOLD: '#f59e0b',
    CRYPTO: '#8b5cf6',
    STOCK: '#3b82f6',
};

export function useInvestments(): UseInvestmentsReturn {
    const { token } = useAuthStore();
    const { t } = useTranslation();
    const store = useInvestmentStore();
    const { modalOpen, modalType, openModal, closeModal } = useUIStore();
    const { addToast } = useToastStore();

    const [activeTab, setActiveTabState] = useState<'overview' | 'list'>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<Investment | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [summaryData, setSummaryData] = useState<SummaryData>({
        totalValue: 0, totalProfitLoss: 0, profitLossPercentage: 0,
        totalAssets: 0, openPositions: 0, closedPositions: 0,
    });
    const [allocationData, setAllocationData] = useState<AllocationItem[]>([]);

    // Fetch investments
    const fetchInvestments = useCallback(async () => {
        if (!token) return;
        store.setLoading(true);
        try {
            const params = new URLSearchParams({
                page: store.pagination.page.toString(),
                limit: store.pagination.limit.toString(),
            });
            if (store.filters.asset_category) params.set('asset_category', store.filters.asset_category);
            if (store.filters.strategy_type) params.set('strategy_type', store.filters.strategy_type);
            if (store.filters.status) params.set('status', store.filters.status);
            if (searchQuery) params.set('search', searchQuery);

            const response = await apiClient.fetch(`/api/investments?${params}`);
            const data = await response.json();

            if (data.success) {
                store.setInvestments(data);
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
                    setAllocationData(
                        stats.assetAllocation.map((item: { category: string; value: number; percentage: number }) => ({
                            ...item,
                            color: CATEGORY_COLORS[item.category] || '#6b7280',
                        }))
                    );
                }
            }
        } catch (error) {
            console.error('Fetch investments error:', error);
        } finally {
            store.setLoading(false);
        }
    }, [token, store.pagination.page, store.pagination.limit, store.filters, searchQuery]);

    // Debounced fetch
    useEffect(() => {
        const timeoutId = setTimeout(() => { fetchInvestments(); }, 100);
        return () => clearTimeout(timeoutId);
    }, [fetchInvestments]);

    // Tab change
    const setActiveTab = useCallback((tab: 'overview' | 'list') => {
        if (tab === 'overview' && activeTab !== 'overview') {
            store.setFilters({});
            setSearchQuery('');
            store.setPage(1);
        }
        setActiveTabState(tab);
    }, [activeTab, store]);

    // Search
    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value);
        store.setPage(1);
    }, [store]);

    // Clear filters
    const clearFilters = useCallback(() => {
        store.setFilters({});
        setSearchQuery('');
        store.setPage(1);
    }, [store]);

    // CRUD
    const handleAddInvestment = useCallback(async (data: InvestmentFormData) => {
        if (!token || store.isLoading) return;
        try {
            const response = await apiClient.fetch('/api/investments', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                store.addInvestment(result.data);
                fetchInvestments();
                closeModal();
                addToast(t('investment.addSuccess'), 'success');
            } else {
                addToast(result.error || t('common.error'), 'error');
            }
        } catch (error) {
            console.error('Add investment error:', error);
            addToast(t('common.error'), 'error');
        }
    }, [token, store, fetchInvestments, closeModal, addToast, t]);

    const handleEditInvestment = useCallback(async (data: InvestmentFormData) => {
        if (!token || !store.selectedInvestment || store.isLoading) return;
        const response = await apiClient.fetch(`/api/investments/${store.selectedInvestment.id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (result.success) {
            store.updateInvestment(result.data);
            fetchInvestments();
            closeModal();
            store.setSelectedInvestment(null);
            addToast(t('investment.updateSuccess'), 'success');
        }
    }, [token, store, fetchInvestments, closeModal, addToast, t]);

    const handleDeleteInvestment = useCallback(async () => {
        if (!token || !deleteConfirm || deleting) return;
        setDeleting(true);
        try {
            const response = await apiClient.fetch(`/api/investments/${deleteConfirm.id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                store.removeInvestment(deleteConfirm.id);
                setDeleteConfirm(null);
                fetchInvestments();
                addToast(t('investment.deleteSuccess'), 'success');
            }
        } finally {
            setDeleting(false);
        }
    }, [token, deleteConfirm, deleting, store, fetchInvestments, addToast, t]);

    // Modal helpers
    const openAddModal = useCallback(() => {
        store.setSelectedInvestment(null);
        openModal('add');
    }, [store, openModal]);

    const openEditModal = useCallback((inv: Investment) => {
        store.setSelectedInvestment(inv);
        openModal('edit');
    }, [store, openModal]);

    const closeFormModal = useCallback(() => {
        closeModal();
        store.setSelectedInvestment(null);
    }, [closeModal, store]);

    const hasActiveFilters = !!(store.filters.asset_category || store.filters.strategy_type || store.filters.status || searchQuery);

    return {
        investments: store.investments,
        summaryData,
        allocationData,
        isLoading: store.isLoading,
        deleting,
        activeTab,
        searchQuery,
        showFilters,
        deleteConfirm,
        hasActiveFilters,
        pagination: store.pagination,
        filters: store.filters,
        modalOpen,
        modalType: modalType || '',
        selectedInvestment: store.selectedInvestment,
        setActiveTab,
        setSearchQuery,
        setShowFilters,
        setDeleteConfirm,
        handleSearch,
        clearFilters,
        handleAddInvestment,
        handleEditInvestment,
        handleDeleteInvestment,
        openAddModal,
        openEditModal,
        closeFormModal,
        setPage: store.setPage,
        setLimit: store.setLimit,
        setFilters: store.setFilters,
    };
}
