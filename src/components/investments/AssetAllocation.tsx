'use client';

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui';

interface AllocationItem {
    category: string;
    value: number;
    percentage: number;
    color: string;
}

interface AssetAllocationProps {
    data: AllocationItem[];
}

const categoryColors: Record<string, string> = {
    GOLD: '#EAB308',
    CRYPTO: '#8B5CF6',
    STOCK: '#3B82F6',
    FUND: '#22C55E',
    OTHER: '#64748B',
    USD: '#EC4899',
};

const categoryLabels: Record<string, string> = {
    GOLD: 'Gold',
    CRYPTO: 'Crypto',
    STOCK: 'Stock',
    FUND: 'Fund',
    USD: 'USD',
    OTHER: 'Others',
};

const AssetAllocation: React.FC<AssetAllocationProps> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const processedData = useMemo(() => {
        return data.map(item => ({
            ...item,
            color: categoryColors[item.category] || item.color,
            label: categoryLabels[item.category] || item.category,
        })).sort((a, b) => b.value - a.value);
    }, [data]);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

    const formatCompact = (amount: number) => {
        if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
        if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
        return amount.toFixed(0);
    };

    // Removed Donut logic, using Horizontal Stacked Bar instead

    return (
        <Card className="bg-card border-border h-full">
            <CardContent className="p-5 sm:p-6 flex flex-col h-full">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-1">Asset Allocation</h3>
                        <p className="text-3xl font-bold text-foreground tracking-tight tabular-nums">{formatCurrency(total)}</p>
                    </div>
                </div>

                {processedData.length > 0 ? (
                    <div className="flex flex-col flex-1">
                        {/* Block/Square List below */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                            {processedData.map((item) => (
                                <div 
                                    key={item.category} 
                                    className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-10 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-foreground leading-none mb-1.5">{item.label}</span>
                                            <span className="text-xs text-muted-foreground tabular-nums leading-none">{item.percentage.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 py-10 text-center">
                        <p className="text-sm text-muted-foreground mb-1">No investment found.</p>
                        <p className="text-xs text-muted-foreground/70">Start adding investments to see allocation.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AssetAllocation;
