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
    emptyMessage = 'No data available',
    onRowClick,
    pagination,
}: TableProps<T>) {
    if (isLoading) {
        return (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="animate-pulse">
                    <div className="h-12 bg-muted/20 border-b border-border" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 border-b border-border last:border-b-0">
                            <div className="flex items-center px-6 py-4 gap-4">
                                {columns.map((_, j) => (
                                    <div key={j} className="flex-1 h-4 bg-muted/10 rounded" />
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
            <div className="bg-card rounded-xl border border-border p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full">
                    <thead className="bg-muted/5 border-b border-border">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        'px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider',
                                        column.className
                                    )}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                className={cn(
                                    'hover:bg-muted/5 transition-colors',
                                    onRowClick && 'cursor-pointer'
                                )}
                                onClick={() => onRowClick?.(item)}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={cn('px-6 py-4 text-sm text-foreground', column.className)}
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
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <label htmlFor="pagination-limit" className="sr-only">Items per page</label>
                        <span aria-hidden="true">Show</span>
                        <select
                            id="pagination-limit"
                            value={pagination.limit}
                            onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
                            className="px-2 py-1 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            aria-label="Items per page"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entries of {pagination.total} total</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => pagination.onPageChange(1)}
                            disabled={pagination.page === 1}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="First page"
                        >
                            <ChevronsLeft className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                            onClick={() => pagination.onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-foreground">
                            Page {pagination.page} of {pagination.totalPages || 1}
                        </span>
                        <button
                            onClick={() => pagination.onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Next page"
                        >
                            <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                            onClick={() => pagination.onPageChange(pagination.totalPages)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
