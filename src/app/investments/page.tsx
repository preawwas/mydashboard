'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { SummaryCards, AssetAllocation, InvestmentTable, InvestmentForm } from '@/components/investments';
import { Button, Input, Select, Modal } from '@/components/ui';
import { useLoading } from '@/components/providers/LoadingProvider';
import { InvestmentFilters } from '@/types';
import { Plus, Search, Filter, X } from 'lucide-react';
import { useInvestments } from '@/hooks';

export default function InvestmentsPage() {
    const { startLoading, stopLoading } = useLoading();
    const {
        investments,
        summaryData,
        allocationData,
        isLoading,
        deleting,
        activeTab,
        searchQuery,
        showFilters,
        deleteConfirm,
        hasActiveFilters,
        pagination,
        filters,
        modalOpen,
        modalType,
        selectedInvestment,
        setActiveTab,
        handleSearch,
        setShowFilters,
        setDeleteConfirm,
        clearFilters,
        setPage,
        setLimit,
        setFilters,
        handleAddInvestment,
        handleEditInvestment,
        handleDeleteInvestment,
        openAddModal,
        openEditModal,
        closeFormModal,
    } = useInvestments();

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
        if (!isLoading || investments.length > 0) {
            stopLoading();
        }
    }, [isLoading, investments.length, stopLoading]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Investment</h1>
                        <p className="text-muted-foreground">Manage your investment portfolio effectively.</p>
                    </div>
                    <Button
                        onClick={openAddModal}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Add Investment
                    </Button>
                </div>

                {/* Tabs */}
                <div className="border-b border-border">
                    <nav className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'list'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Investment List
                        </button>
                    </nav>
                </div>

                {/* Content */}
                {isLoading && investments.length === 0 ? null : activeTab === 'overview' ? (
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
                                    placeholder="Search"
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
                                    Filter
                                    {hasActiveFilters && (
                                        <span className="ml-1.5 w-2 h-2 rounded-full bg-primary-foreground" />
                                    )}
                                </Button>
                                {hasActiveFilters && (
                                    <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground hover:bg-muted/10">
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Filter Panel */}
                        {showFilters && (
                            <div className="p-4 rounded-xl bg-card border border-border grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <Select
                                    label="Assetype"
                                    placeholder="All"
                                    options={[
                                        { value: 'GOLD', label: 'Gold' },
                                        { value: 'CRYPTO', label: 'Crypto' },
                                        { value: 'STOCK', label: 'Stock' },
                                    ]}
                                    value={filters.asset_category || ''}
                                    onChange={(value) =>
                                        setFilters({ ...filters, asset_category: value as InvestmentFilters['asset_category'] || undefined })
                                    }
                                />
                                <Select
                                    label="Strategy"
                                    placeholder="All"
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
                                    label="Status"
                                    placeholder="All"
                                    options={[
                                        { value: 'OPEN', label: 'Open' },
                                        { value: 'CLOSED', label: 'Closed' },
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
                            onEdit={openEditModal}
                            onDelete={(inv) => setDeleteConfirm(inv)}
                        />
                    </div>
                )}

                {/* Add/Edit Modal */}
                {(modalType === 'add' || modalType === 'edit') && (
                    <InvestmentForm
                        isOpen={modalOpen}
                        onClose={closeFormModal}
                        onSubmit={modalType === 'add' ? handleAddInvestment : handleEditInvestment}
                        initialData={selectedInvestment ? {
                            ...selectedInvestment,
                            note: selectedInvestment.note ?? '',
                        } : undefined}
                        mode={modalType}
                    />
                )}

                {/* Delete Confirmation */}
                {deleteConfirm && (
                    <Modal
                        isOpen={!!deleteConfirm}
                        onClose={() => setDeleteConfirm(null)}
                        title="Delete Item"
                        size="sm"
                    >
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                Are you sure you want to delete {deleteConfirm.asset_code} ({deleteConfirm.asset_name})?
                            </p>
                            <p className="text-sm text-rose-500">This action cannot be undone.</p>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
                                    Cancel
                                </Button>
                                <Button variant="danger" onClick={handleDeleteInvestment} isLoading={deleting}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </DashboardLayout>
    );
}
