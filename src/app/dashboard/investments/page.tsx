'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { SummaryCards, AssetAllocation, InvestmentTable, InvestmentForm } from '@/components/investments';
import { Button, Input, Select, Modal, Badge, Loading, EmptyState } from '@/components/ui';
import { useAuthStore, useInvestmentStore, useUIStore } from '@/lib/store';
import { Investment, InvestmentFormData, InvestmentFilters } from '@/types';
import { Plus, Search, Filter, X, TrendingUp } from 'lucide-react';

export default function InvestmentsPage() {
    const { token, user } = useAuthStore();
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

    const [activeTab, setActiveTab] = useState<'overview' | 'list'>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<Investment | null>(null);

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

            const response = await fetch(`/api/investments?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setInvestments(data);

                // Calculate summary
                let totalValue = 0;
                let totalProfitLoss = 0;
                let openPositions = 0;
                let closedPositions = 0;
                const categoryValues: Record<string, number> = {};

                for (const inv of data.data as Investment[]) {
                    const cost = inv.buy_quantity * inv.buy_price_per_unit + inv.buy_fee;
                    totalValue += cost;

                    if (inv.status === 'OPEN') openPositions++;
                    else closedPositions++;

                    categoryValues[inv.asset_category] = (categoryValues[inv.asset_category] || 0) + cost;

                    // Calculate profit/loss from sell history
                    for (const sell of inv.sell_history) {
                        const sellValue = sell.qty * sell.price - sell.fee;
                        const sellCost = (sell.qty / inv.buy_quantity) * cost;
                        totalProfitLoss += sellValue - sellCost;
                    }
                }

                setSummaryData({
                    totalValue,
                    totalProfitLoss,
                    profitLossPercentage: totalValue > 0 ? (totalProfitLoss / totalValue) * 100 : 0,
                    totalAssets: data.total,
                    openPositions,
                    closedPositions,
                });

                // Calculate allocation
                const allocation = Object.entries(categoryValues).map(([category, value]) => ({
                    category,
                    value,
                    percentage: (value / totalValue) * 100 || 0,
                    color: colors[category as keyof typeof colors] || '#6b7280',
                }));
                setAllocationData(allocation);
            }
        } catch (error) {
            console.error('Fetch investments error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvestments();
    }, [token, pagination.page, pagination.limit, filters, searchQuery]);

    // Handle add investment
    // Handle add investment
    const handleAddInvestment = async (data: InvestmentFormData) => {
        if (!token) return;

        try {
            const response = await fetch('/api/investments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.success) {
                addInvestment(result.data);
                fetchInvestments();
                closeModal(); // Ensure modal is closed on success
            } else {
                console.error('Failed to add investment:', result.error);
                alert(`เกิดข้อผิดพลาด: ${result.error}`); // Temporary user feedback
            }
        } catch (error) {
            console.error('Add investment network error:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
        }
    };

    // Handle edit investment
    const handleEditInvestment = async (data: InvestmentFormData) => {
        if (!token || !selectedInvestment) return;

        const response = await fetch(`/api/investments/${selectedInvestment.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (result.success) {
            updateInvestment(result.data);
            fetchInvestments();
            closeModal();
            setSelectedInvestment(null);
        }
    };

    // Handle delete investment
    const handleDeleteInvestment = async () => {
        if (!token || !deleteConfirm) return;

        const response = await fetch(`/api/investments/${deleteConfirm.id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const result = await response.json();
        if (result.success) {
            removeInvestment(deleteConfirm.id);
            setDeleteConfirm(null);
            fetchInvestments();
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
                        <h1 className="text-2xl font-bold text-gray-900">Investment</h1>
                        <p className="text-gray-500">จัดการพอร์ตการลงทุนของคุณ</p>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedInvestment(null);
                            openModal('add');
                        }}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        เพิ่มการลงทุน
                    </Button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'list'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            รายการลงทุน
                        </button>
                    </nav>
                </div>

                {/* Content */}
                {activeTab === 'overview' ? (
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
                                    placeholder="ค้นหารหัสหรือชื่อสินทรัพย์..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    leftIcon={<Search className="w-4 h-4" />}
                                    rightIcon={
                                        searchQuery ? (
                                            <button onClick={() => handleSearch('')}>
                                                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
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
                                >
                                    ตัวกรอง
                                    {hasActiveFilters && (
                                        <span className="ml-1.5 w-2 h-2 rounded-full bg-blue-400" />
                                    )}
                                </Button>
                                {hasActiveFilters && (
                                    <Button variant="ghost" onClick={clearFilters}>
                                        ล้าง
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Filter Panel */}
                        {showFilters && (
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Select
                                    label="ประเภทสินทรัพย์"
                                    placeholder="ทั้งหมด"
                                    options={[
                                        { value: 'GOLD', label: 'ทองคำ' },
                                        { value: 'CRYPTO', label: 'คริปโต' },
                                        { value: 'STOCK', label: 'หุ้น' },
                                    ]}
                                    value={filters.asset_category || ''}
                                    onChange={(value) =>
                                        setFilters({ ...filters, asset_category: value as InvestmentFilters['asset_category'] || undefined })
                                    }
                                />
                                <Select
                                    label="กลยุทธ์"
                                    placeholder="ทั้งหมด"
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
                                    label="สถานะ"
                                    placeholder="ทั้งหมด"
                                    options={[
                                        { value: 'OPEN', label: 'เปิดอยู่' },
                                        { value: 'CLOSED', label: 'ปิดแล้ว' },
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
                            onView={(inv) => {
                                setSelectedInvestment(inv);
                                openModal('view');
                            }}
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

                {/* View Modal */}
                {modalType === 'view' && selectedInvestment && (
                    <Modal
                        isOpen={modalOpen}
                        onClose={() => {
                            closeModal();
                            setSelectedInvestment(null);
                        }}
                        title="รายละเอียดการลงทุน"
                        size="lg"
                    >
                        <div className="space-y-6">
                            {/* Asset Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                    {selectedInvestment.asset_code.slice(0, 2)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedInvestment.asset_code}</h3>
                                    <p className="text-gray-500">{selectedInvestment.asset_name}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge className={`${selectedInvestment.asset_category === 'GOLD' ? 'bg-yellow-100 text-yellow-800' : selectedInvestment.asset_category === 'CRYPTO' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {selectedInvestment.asset_category}
                                        </Badge>
                                        <Badge className={selectedInvestment.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {selectedInvestment.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-gray-50">
                                    <p className="text-sm text-gray-500">ตลาด</p>
                                    <p className="font-semibold">{selectedInvestment.market}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-50">
                                    <p className="text-sm text-gray-500">กลยุทธ์</p>
                                    <p className="font-semibold">{selectedInvestment.strategy_type}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-50">
                                    <p className="text-sm text-gray-500">จำนวนซื้อ</p>
                                    <p className="font-semibold">{selectedInvestment.buy_quantity}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-50">
                                    <p className="text-sm text-gray-500">ราคาต่อหน่วย</p>
                                    <p className="font-semibold">
                                        {new Intl.NumberFormat('th-TH', { style: 'currency', currency: selectedInvestment.buy_currency }).format(selectedInvestment.buy_price_per_unit)}
                                    </p>
                                </div>
                            </div>

                            {/* Sell History */}
                            {selectedInvestment.sell_history.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">ประวัติการขาย</h4>
                                    <div className="space-y-2">
                                        {selectedInvestment.sell_history.map((sell, i) => (
                                            <div key={i} className="p-3 rounded-lg bg-gray-50 flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{sell.qty} @ {sell.price} {sell.currency}</p>
                                                    <p className="text-sm text-gray-500">{new Date(sell.datetime).toLocaleString('th-TH')}</p>
                                                </div>
                                                <p className="text-green-600 font-medium">
                                                    +{(sell.qty * sell.price - sell.fee).toLocaleString()} {sell.currency}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Note */}
                            {selectedInvestment.note && (
                                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                                    <p className="text-sm text-blue-600 font-medium mb-1">หมายเหตุ</p>
                                    <p className="text-gray-700">{selectedInvestment.note}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        closeModal();
                                        setSelectedInvestment(null);
                                    }}
                                >
                                    ปิด
                                </Button>
                                <Button
                                    onClick={() => {
                                        openModal('edit');
                                    }}
                                >
                                    แก้ไข
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}

                {/* Delete Confirmation */}
                {deleteConfirm && (
                    <Modal
                        isOpen={!!deleteConfirm}
                        onClose={() => setDeleteConfirm(null)}
                        title="ยืนยันการลบ"
                        size="sm"
                    >
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                คุณต้องการลบ <strong>{deleteConfirm.asset_code}</strong> ({deleteConfirm.asset_name}) หรือไม่?
                            </p>
                            <p className="text-sm text-red-600">การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                                    ยกเลิก
                                </Button>
                                <Button variant="danger" onClick={handleDeleteInvestment}>
                                    ลบ
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </DashboardLayout>
    );
}
