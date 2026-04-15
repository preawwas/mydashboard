'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type PageItem = number | 'ellipsis';

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    siblingCount?: number;
    className?: string;
}

const range = (start: number, end: number): number[] => {
    return Array.from({ length: end - start + 1 }, (_, idx) => idx + start);
};

const getPageItems = (page: number, totalPages: number, siblingCount: number): PageItem[] => {
    const totalPageNumbers = siblingCount * 2 + 5;

    if (totalPages <= totalPageNumbers) {
        return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 1;

    if (!showLeftEllipsis && showRightEllipsis) {
        const leftItemCount = 3 + 2 * siblingCount;
        return [...range(1, leftItemCount), 'ellipsis', totalPages];
    }

    if (showLeftEllipsis && !showRightEllipsis) {
        const rightItemCount = 3 + 2 * siblingCount;
        const rightRangeStart = totalPages - rightItemCount + 1;
        return [1, 'ellipsis', ...range(rightRangeStart, totalPages)];
    }

    return [
        1,
        'ellipsis',
        ...range(leftSiblingIndex, rightSiblingIndex),
        'ellipsis',
        totalPages,
    ];
};

const Pagination: React.FC<PaginationProps> = ({
    page,
    totalPages,
    onPageChange,
    siblingCount = 0,
    className,
}) => {
    if (totalPages <= 1) {
        return null;
    }

    const safeCurrentPage = Math.min(Math.max(page, 1), totalPages);
    const pageItems = getPageItems(safeCurrentPage, totalPages, siblingCount);

    return (
        <nav
            className={cn('flex items-center gap-1 sm:gap-2', className)}
            aria-label="Pagination"
        >
            <button
                type="button"
                onClick={() => onPageChange(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                className="h-9 sm:h-8 min-w-[44px] rounded-[8px] border border-[#b8cfcc] px-2 sm:px-3 text-[10px] sm:text-xs font-bold tracking-wide text-[#0D3B38] bg-[#edf4f3] hover:bg-[#e1efed] disabled:opacity-45 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
                aria-label="Previous page"
            >
                <ChevronLeft className="w-4 h-4 sm:hidden" aria-hidden="true" />
                <span className="hidden sm:inline">PREV</span>
            </button>

            {pageItems.map((item, index) => {
                if (item === 'ellipsis') {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="w-5 sm:w-6 text-center text-xs sm:text-sm leading-none font-semibold text-[#6b7280]"
                            aria-hidden="true"
                        >
                            ...
                        </span>
                    );
                }

                const isActive = item === safeCurrentPage;

                return (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onPageChange(item)}
                        className={cn(
                            'h-9 sm:h-8 min-w-[44px] rounded-[8px] border px-2 sm:px-2.5 text-[12px] sm:text-sm font-semibold tracking-tight transition-colors',
                            isActive
                                ? 'border-2 border-[#0D3B38] bg-[#0D3B38] text-white'
                                : 'border-[#b8cfcc] bg-[#edf4f3] text-[#0D3B38] hover:bg-[#e1efed]'
                        )}
                        aria-label={`Go to page ${item}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {item}
                    </button>
                );
            })}

            <button
                type="button"
                onClick={() => onPageChange(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                className="h-9 sm:h-8 min-w-[44px] rounded-[8px] border border-[#b8cfcc] px-2 sm:px-3 text-[10px] sm:text-xs font-bold tracking-wide text-[#0D3B38] bg-[#edf4f3] hover:bg-[#e1efed] disabled:opacity-45 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
                aria-label="Next page"
            >
                <ChevronRight className="w-4 h-4 sm:hidden" aria-hidden="true" />
                <span className="hidden sm:inline">NEXT</span>
            </button>
        </nav>
    );
};

export default Pagination;