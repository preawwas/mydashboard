'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { InvestmentOverview, InvestmentTable, InvestmentForm } from '@/components/investments';
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
            <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6 pt-2">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-extrabold tracking-widest text-[#a1a1aa] uppercase drop-shadow-sm">Curated Portfolio</p>
                        <h1 className="text-[28px] font-extrabold text-[#0D3B38] tracking-tight leading-none">Investment Portfolio</h1>
                    </div>
                    
                    <div className="flex items-center gap-6 mt-4 sm:mt-0">
                        <nav className="flex gap-6 relative top-[9px]">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`pb-3 border-b-[3px] font-extrabold text-[12px] tracking-wide transition-colors ${activeTab === 'overview'
                                    ? 'border-[#0D3B38] text-[#0D3B38]'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`pb-3 border-b-[3px] font-extrabold text-[12px] tracking-wide transition-colors ${activeTab === 'list'
                                    ? 'border-[#0D3B38] text-[#0D3B38]'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                Investment List
                            </button>
                        </nav>
                        
                        <Button 
                            onClick={openAddModal} 
                            leftIcon={<Plus className="w-[18px] h-[18px]" />}
                            className="bg-[#2b7a71] text-white hover:bg-[#1f5c54] rounded-lg px-5 py-2.5 font-bold text-[13px] ml-2 shadow-sm border-none"
                        >
                            Add Investment
                        </Button>
                    </div>
                </div>

                {/* Content */}
                {isLoading && investments.length === 0 ? null : activeTab === 'overview' ? (
                    <InvestmentOverview 
                        investments={investments} 
                        summaryData={summaryData} 
                        allocationData={allocationData} 
                    />
                ) : (
                    <div className="space-y-4">
                        {/* Search and Filters Container */}
                        <div className="bg-[#f8f8f9] rounded-[32px] p-4 sm:p-6 mb-8 flex flex-col gap-6">
                            {/* Row 1: Search and Filter Button */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search assets, tickers, or strategies..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        leftIcon={<Search className="w-5 h-5 text-gray-400" />}
                                        rightIcon={
                                            searchQuery ? (
                                                <button onClick={() => handleSearch('')} className="bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors">
                                                    <X className="w-3.5 h-3.5 text-gray-500" />
                                                </button>
                                            ) : undefined
                                        }
                                        className="h-[52px] rounded-full border-transparent hover:border-transparent focus:border-transparent focus:ring-2 focus:ring-[#0D3B38]/20 shadow-sm pl-[44px] pr-10 bg-white text-sm sm:text-base text-[#18181b]"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setShowFilters(!showFilters)}
                                        leftIcon={<Filter className={`w-4 h-4 sm:w-5 sm:h-5 ${showFilters ? 'text-[#0D3B38]' : 'text-white'}`} />}
                                        className={`h-[52px] rounded-full px-6 sm:px-8 text-sm sm:text-base font-medium transition-colors border-0 align-middle ${
                                            showFilters 
                                                ? 'bg-white text-[#0D3B38] hover:bg-gray-50 shadow-sm' 
                                                : 'bg-[#062d2a] text-white hover:bg-[#0c3935] shadow-sm'
                                        }`}
                                    >
                                        Filter
                                        {hasActiveFilters && (
                                            <span className={`ml-2 w-2 h-2 rounded-full ${showFilters ? 'bg-[#0D3B38]' : 'bg-white'}`} />
                                        )}
                                    </Button>
                                    
                                    {hasActiveFilters && (
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

                            {/* Row 2: Filter Panel */}
                            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 transition-all duration-300 origin-top ${showFilters ? 'opacity-100 scale-y-100 h-auto' : 'opacity-0 scale-y-0 h-0 overflow-hidden hidden'}`}>
                                <div>
                                    <label className="block text-[10px] font-extrabold tracking-widest text-[#a1a1aa] uppercase mb-2 ml-2">Asset Type</label>
                                    <Select
                                        options={[
                                            { value: '', label: 'All Assets' },
                                            { value: 'GOLD', label: 'Gold' },
                                            { value: 'CRYPTO', label: 'Crypto' },
                                            { value: 'STOCK', label: 'Stock' },
                                        ]}
                                        value={filters.asset_category || ''}
                                        onChange={(value) =>
                                            setFilters({ ...filters, asset_category: value as InvestmentFilters['asset_category'] || undefined })
                                        }
                                        className="h-[52px] rounded-full border-transparent hover:border-transparent focus:border-transparent focus:ring-2 focus:ring-[#0D3B38]/20 shadow-sm px-6 bg-white text-[#18181b] font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold tracking-widest text-[#a1a1aa] uppercase mb-2 ml-2">Strategy</label>
                                    <Select
                                        options={[
                                            { value: '', label: 'All Strategy' },
                                            { value: 'DCA', label: 'DCA' },
                                            { value: 'LONG_TERM', label: 'Long Term' },
                                            { value: 'TRADE', label: 'Trade' },
                                        ]}
                                        value={filters.strategy_type || ''}
                                        onChange={(value) =>
                                            setFilters({ ...filters, strategy_type: value as InvestmentFilters['strategy_type'] || undefined })
                                        }
                                        className="h-[52px] rounded-full border-transparent hover:border-transparent focus:border-transparent focus:ring-2 focus:ring-[#0D3B38]/20 shadow-sm px-6 bg-white text-[#18181b] font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold tracking-widest text-[#a1a1aa] uppercase mb-2 ml-2">Status</label>
                                    <Select
                                        options={[
                                            { value: '', label: 'All Status' },
                                            { value: 'OPEN', label: 'Open' },
                                            { value: 'CLOSED', label: 'Closed' },
                                        ]}
                                        value={filters.status || ''}
                                        onChange={(value) =>
                                            setFilters({ ...filters, status: value as InvestmentFilters['status'] || undefined })
                                        }
                                        className="h-[52px] rounded-full border-transparent hover:border-transparent focus:border-transparent focus:ring-2 focus:ring-[#0D3B38]/20 shadow-sm px-6 bg-white text-[#18181b] font-medium"
                                    />
                                </div>
                            </div>
                        </div>

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
