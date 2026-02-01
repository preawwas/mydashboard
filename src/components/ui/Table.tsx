'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface Column<T> {
    key: string;
    header: React.ReactNode;
    render?: (item: T) => React.ReactNode;
    className?: string;
    sortable?: boolean;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string;
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        onLimitChange: (limit: number) => void;
    };
}

function Table<T>({
    data,
    columns,
    keyExtractor,
    isLoading = false,
    emptyMessage = 'ไม่มีข้อมูล',
    onRowClick,
    pagination,
}: TableProps<T>) {
    if (isLoading) {
        return (
            <div className="bg-[#1C1B16] rounded-xl border border-[#2E2C24] overflow-hidden">
                <div className="animate-pulse">
                    <div className="h-12 bg-[#15140F] border-b border-[#2E2C24]" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 border-b border-[#2E2C24] last:border-b-0">
                            <div className="flex items-center px-6 py-4 gap-4">
                                {columns.map((_, j) => (
                                    <div key={j} className="flex-1 h-4 bg-[#2E2C24] rounded" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-[#1C1B16] rounded-xl border border-[#2E2C24] p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2E2C24] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#A1A1AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <p className="text-[#A1A1AA]">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-[#1C1B16] rounded-xl border border-[#2E2C24] overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full">
                    <thead className="bg-[#15140F] border-b border-[#2E2C24]">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        'px-6 py-3 text-left text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider',
                                        column.className
                                    )}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2E2C24]">
                        {data.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                className={cn(
                                    'hover:bg-[#2E2C24]/30 transition-colors',
                                    onRowClick && 'cursor-pointer'
                                )}
                                onClick={() => onRowClick?.(item)}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={cn('px-6 py-4 text-sm text-[#FAFAFA]', column.className)}
                                    >
                                        {column.render
                                            ? column.render(item)
                                            : String((item as Record<string, unknown>)[column.key] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-[#2E2C24] bg-[#15140F]">
                    <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                        <label htmlFor="pagination-limit" className="sr-only">Items per page</label>
                        <span aria-hidden="true">แสดง</span>
                        <select
                            id="pagination-limit"
                            value={pagination.limit}
                            onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
                            className="px-2 py-1 bg-[#1C1B16] border border-[#2E2C24] rounded-md text-sm text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#F5C542]/50"
                            aria-label="Items per page"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span>รายการ จากทั้งหมด {pagination.total} รายการ</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => pagination.onPageChange(1)}
                            disabled={pagination.page === 1}
                            className="p-2 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#2E2C24] rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="First page"
                        >
                            <ChevronsLeft className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                            onClick={() => pagination.onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="p-2 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#2E2C24] rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-[#FAFAFA]">
                            หน้า {pagination.page} จาก {pagination.totalPages || 1}
                        </span>
                        <button
                            onClick={() => pagination.onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="p-2 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#2E2C24] rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Next page"
                        >
                            <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                            onClick={() => pagination.onPageChange(pagination.totalPages)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="p-2 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#2E2C24] rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Last page"
                        >
                            <ChevronsRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Table;
