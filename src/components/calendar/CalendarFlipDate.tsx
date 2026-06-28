'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarFlipDateProps {
    date: Date;
    className?: string;
    onMonthPrev?: () => void;
    onMonthNext?: () => void;
    onYearPrev?: () => void;
    onYearNext?: () => void;
    onMonthClick?: () => void;
    onYearClick?: () => void;
    isMonthPickerOpen?: boolean;
    isYearPickerOpen?: boolean;
}

function FlipCard({
    value,
    className,
    onClick,
    ariaLabel,
    isActive = false,
}: {
    value: string;
    className?: string;
    onClick?: () => void;
    ariaLabel?: string;
    isActive?: boolean;
}) {
    const card = (
        <div
            className={cn(
                'relative flex h-11 min-w-[3.1rem] items-center justify-center overflow-hidden rounded-lg sm:rounded-xl bg-[#704E3E] px-2 sm:px-3 sm:h-14 sm:min-w-[4.25rem] shadow-[inset_0_-3px_6px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.12)]',
                className
            )}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/[0.05]" />
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-black/30" />
            <span className="relative z-10 text-lg sm:text-[1.65rem] font-black leading-none tracking-tight text-white">
                {value}
            </span>
        </div>
    );

    if (!onClick) return card;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            aria-expanded={isActive}
            className={cn(
                'rounded-lg sm:rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#704E3E]/40',
                isActive && 'ring-2 ring-[#704E3E]/35'
            )}
        >
            {card}
        </button>
    );
}

const navButtonClass =
    'flex h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 items-center justify-center rounded-full bg-white text-[#1A2332] shadow-sm transition-colors hover:bg-white/90';

function NavArrow({
    direction,
    onClick,
    ariaLabel,
}: {
    direction: 'up' | 'down';
    onClick: () => void;
    ariaLabel: string;
}) {
    const Icon = direction === 'up' ? ChevronUp : ChevronDown;

    return (
        <button type="button" onClick={onClick} aria-label={ariaLabel} className={navButtonClass}>
            <Icon className="h-2 w-2 sm:h-2.5 sm:w-2.5 stroke-[2.5]" />
        </button>
    );
}

const CalendarFlipDate: React.FC<CalendarFlipDateProps> = ({
    date,
    className,
    onMonthPrev,
    onMonthNext,
    onYearPrev,
    onYearNext,
    onMonthClick,
    onYearClick,
    isMonthPickerOpen = false,
    isYearPickerOpen = false,
}) => {
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
    const yearLabel = String(date.getFullYear() % 100).padStart(2, '0');

    return (
        <div className={cn('flex items-start gap-0.5 sm:gap-1', className)}>
            <div className="flex flex-col items-center gap-px sm:gap-0.5">
                {onMonthNext && (
                    <NavArrow direction="up" onClick={onMonthNext} ariaLabel="Next month" />
                )}
                <FlipCard
                    value={monthLabel}
                    onClick={onMonthClick}
                    ariaLabel={`${monthLabel}, open month picker`}
                    isActive={isMonthPickerOpen}
                />
                {onMonthPrev && (
                    <NavArrow direction="down" onClick={onMonthPrev} ariaLabel="Previous month" />
                )}
            </div>

            <div className="flex flex-col items-center gap-px sm:gap-0.5">
                {onYearNext && (
                    <NavArrow direction="up" onClick={onYearNext} ariaLabel="Next year" />
                )}
                <FlipCard
                    value={yearLabel}
                    className="min-w-[2.65rem] sm:min-w-[3.75rem]"
                    onClick={onYearClick}
                    ariaLabel={`20${yearLabel}, open year picker`}
                    isActive={isYearPickerOpen}
                />
                {onYearPrev && (
                    <NavArrow direction="down" onClick={onYearPrev} ariaLabel="Previous year" />
                )}
            </div>
        </div>
    );
};

export default CalendarFlipDate;
