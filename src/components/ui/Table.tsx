'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Pagination from './Pagination';

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
    const isActionColumn = (key: string) => {
        const normalized = key.toLowerCase();
        return (
            normalized === 'action' ||
            normalized === 'actions' ||
            normalized.endsWith('action') ||
            normalized.endsWith('actions') ||
            normalized === 'edit' ||
            normalized.endsWith('edit') ||
            normalized === 'delete' ||
            normalized.endsWith('delete')
        );
    };

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
        <div className="bg-[#f9faf9] rounded-[16px] md:rounded-[24px] overflow-hidden">
            <div className="md:hidden">
                <div className="divide-y divide-gray-200/60">
                    {data.map((item) => (
                        <div
                            key={keyExtractor(item)}
                            className={cn(
                                'px-4 py-4 bg-white/60',
                                onRowClick && 'cursor-pointer'
                            )}
                            onClick={() => onRowClick?.(item)}
                        >
                            <div className="grid grid-cols-1 gap-2">
                                {columns.map((column) => (
                                    <div
                                        key={column.key}
                                        className={cn(
                                            'flex gap-3',
                                            isActionColumn(column.key) ? 'items-center justify-center' : 'items-start justify-between',
                                            column.className
                                        )}
                                    >
                                        {!isActionColumn(column.key) && (
                                            <div className="text-[12px] font-semibold text-muted-foreground">
                                                {column.header}
                                            </div>
                                        )}
                                        <div
                                            className={cn(
                                                'text-[13px] font-semibold text-foreground',
                                                isActionColumn(column.key) ? 'w-full flex items-center justify-center text-center' : 'text-right'
                                            )}
                                        >
                                            {column.render
                                                ? column.render(item)
                                                : String((item as Record<string, unknown>)[column.key] ?? '')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="hidden md:block overflow-x-auto scrollbar-hide -webkit-overflow-scrolling-touch">
                <table className="w-full min-w-full">
                    <thead className="bg-[#BEBEBE] border-b border-gray-200/60">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        'px-6 py-4 text-left text-[14px] font-extrabold text-[#111111] capitalize tracking-normal whitespace-nowrap',
                                        isActionColumn(column.key) && 'text-center',
                                        column.className
                                    )}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((item, rowIndex) => (
                            <tr
                                key={keyExtractor(item)}
                                className={cn(
                                    rowIndex % 2 === 0 ? 'bg-white/40' : 'bg-transparent',
                                    'hover:bg-white/70 transition-colors',
                                    onRowClick && 'cursor-pointer'
                                )}
                                onClick={() => onRowClick?.(item)}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={cn(
                                            'px-6 py-5 text-sm text-foreground whitespace-nowrap',
                                            isActionColumn(column.key) && 'text-center',
                                            column.className
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                isActionColumn(column.key) && 'w-full flex items-center justify-center'
                                            )}
                                        >
                                            {column.render
                                                ? column.render(item)
                                                : String((item as Record<string, unknown>)[column.key] ?? '')}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="flex items-center justify-center md:justify-between gap-2 px-3 md:px-6 py-2.5 md:py-4 border-t border-border bg-muted/5">
                    <div className="hidden md:flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground shrink-0">
                        <label htmlFor="pagination-limit" className="sr-only">Items per page</label>
                        <span aria-hidden="true">Show</span>
                        <select
                            id="pagination-limit"
                            value={pagination.limit}
                            onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
                            className="px-1.5 py-0.5 bg-background border border-border rounded-md text-xs md:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[36px] md:min-h-0"
                            aria-label="Items per page"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="hidden sm:inline">entries of {pagination.total} total</span>
                        <span className="sm:hidden">/ {pagination.total}</span>
                    </div>

                    <div className="shrink-0">
                        <Pagination
                            page={pagination.page}
                            totalPages={pagination.totalPages || 1}
                            onPageChange={pagination.onPageChange}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Table;
