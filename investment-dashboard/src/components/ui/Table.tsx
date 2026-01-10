'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface Column<T> {
    key: string;
    header: string;
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
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-100 border-b" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 border-b last:border-b-0">
                            <div className="flex items-center px-6 py-4 gap-4">
                                {columns.map((_, j) => (
                                    <div key={j} className="flex-1 h-4 bg-gray-200 rounded" />
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
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        'px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
                                        column.className
                                    )}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                className={cn(
                                    'hover:bg-gray-50 transition-colors',
                                    onRowClick && 'cursor-pointer'
                                )}
                                onClick={() => onRowClick?.(item)}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={cn('px-6 py-4 text-sm text-gray-900', column.className)}
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
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>แสดง</span>
                        <select
                            value={pagination.limit}
                            onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => pagination.onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                            หน้า {pagination.page} จาก {pagination.totalPages || 1}
                        </span>
                        <button
                            onClick={() => pagination.onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => pagination.onPageChange(pagination.totalPages)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Table;
