'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'card';
    width?: string | number;
    height?: string | number;
    lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
    className,
    variant = 'rectangular',
    width,
    height,
    lines = 1,
}) => {
    const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]';

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
        card: 'rounded-2xl',
    };

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '3rem' : '2rem'),
        animationDuration: '1.5s',
    };

    if (variant === 'text' && lines > 1) {
        return (
            <div className="space-y-3">
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(baseClasses, variantClasses.text, className)}
                        style={{
                            ...style,
                            width: i === lines - 1 ? '75%' : '100%',
                        }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn(baseClasses, variantClasses[variant], className)}
            style={style}
        />
    );
};

// Pre-built skeleton layouts
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={cn('border border-border rounded-2xl p-6 space-y-4', className)}>
        <div className="flex items-center justify-between">
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="circular" width={40} height={40} />
        </div>
        <Skeleton variant="text" height={32} width="60%" />
        <Skeleton variant="text" width="30%" />
    </div>
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
    rows = 5,
    columns = 4,
}) => (
    <div className="space-y-3">
        {/* Header */}
        <div className="flex gap-4 px-4 py-3">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={16} />
            ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex gap-4 px-4 py-3 border-t border-border/50">
                {Array.from({ length: columns }).map((_, colIdx) => (
                    <Skeleton key={colIdx} variant="text" width={`${100 / columns}%`} height={16} />
                ))}
            </div>
        ))}
    </div>
);

export const DashboardSkeleton: React.FC = () => (
    <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-border rounded-2xl p-6">
                <Skeleton variant="text" width="30%" className="mb-4" />
                <Skeleton variant="rectangular" height={200} />
            </div>
            <div className="border border-border rounded-2xl p-6">
                <Skeleton variant="text" width="30%" className="mb-4" />
                <Skeleton variant="rectangular" height={200} />
            </div>
        </div>
    </div>
);

export default Skeleton;
