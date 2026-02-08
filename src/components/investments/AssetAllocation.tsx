'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useTranslation } from '@/lib/useTranslation';

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
    GOLD: '#F5C542',
    CRYPTO: '#9F7AEA',
    STOCK: '#4299E1',
    FUND: '#38A169',
    OTHER: '#718096',
    USD: '#ED64A6',
};

const AssetAllocation: React.FC<AssetAllocationProps> = ({ data }) => {
    const { t } = useTranslation();
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Override colors for consistency
    const processedData = useMemo(() => {
        return data.map(item => ({
            ...item,
            color: categoryColors[item.category] || item.color
        })).sort((a, b) => b.value - a.value);
    }, [data]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate SVG paths for donut chart
    const chartPaths = useMemo(() => {
        let accumulatedPercentage = 0;
        return processedData.map((item) => {
            const startPercentage = accumulatedPercentage;
            accumulatedPercentage += item.percentage;

            const startAngle = (startPercentage / 100) * 360;
            const endAngle = (accumulatedPercentage / 100) * 360;

            // Convert polar to cartesian
            // Center is 50,50. Radius is 40.
            const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);

            // Large arc flag
            const largeArcFlag = item.percentage > 50 ? 1 : 0;

            // Path command
            const path = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
            ].join(' ');

            return { ...item, path };
        });
    }, [processedData]);


    return (
        <Card className="bg-card border-border shadow-md">
            <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-foreground text-lg font-bold">{t('dashboard.assetAllocation')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                    {/* Donut Chart */}
                    <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex-shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            {/* Background circle */}
                            <circle cx="50" cy="50" r="40" fill="currentColor" className="text-muted/10" />

                            {chartPaths.length > 0 ? (
                                chartPaths.map((item, index) => (
                                    <path
                                        key={item.category}
                                        d={item.path}
                                        fill={item.color}
                                        stroke="transparent"
                                        strokeWidth="0"
                                        className="cursor-pointer hover:opacity-90"
                                    />
                                ))
                            ) : (
                                <circle cx="50" cy="50" r="40" fill="currentColor" className="text-muted/20" />
                            )}

                            {/* Inner Hole for Donut effect */}
                            <circle cx="50" cy="50" r="28" fill="var(--background)" fillOpacity="0.8" />

                            {/* Center Text */}
                            <foreignObject x="15" y="32" width="70" height="36">
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <span className="text-[0.4rem] text-muted-foreground mb-0.5 tracking-wide uppercase font-bold">{t('common.totalValue')}</span>
                                    <span className="text-[0.6rem] font-black text-foreground truncate w-full px-1">
                                        {formatCurrency(total).replace('฿', '')}
                                    </span>
                                </div>
                            </foreignObject>
                        </svg>
                    </div>

                    {/* Legend / List */}
                    <div className="flex-1 w-full space-y-3 sm:space-y-4">
                        {processedData.length > 0 ? (
                            processedData.map((item) => (
                                <div key={item.category} className="group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors shadow-sm">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div
                                            className="w-2 sm:w-3 h-10 sm:h-12 rounded-full shadow-lg"
                                            style={{ backgroundColor: item.color, boxShadow: `0 0 15px ${item.color}30` }}
                                        />
                                        <div>
                                            <p className="text-foreground font-bold text-base sm:text-lg">
                                                {item.category === 'GOLD' ? t('investment.type.gold') :
                                                    item.category === 'CRYPTO' ? t('investment.type.crypto') :
                                                        item.category === 'STOCK' ? t('investment.type.stock') :
                                                            item.category === 'FUND' ? t('investment.type.fund') :
                                                                item.category === 'USD' ? 'USD' :
                                                                    t('common.others')}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-bold">{item.percentage.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-foreground font-black tracking-tight text-lg sm:text-xl">{formatCurrency(item.value)}</p>
                                        <div className="hidden sm:block w-28 bg-muted h-2 rounded-full mt-2 ml-auto overflow-hidden border border-border">
                                            <div
                                                className="h-full rounded-full"
                                                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
                                <p>{t('investment.noItems')}</p>
                                <p className="text-sm mt-2">{t('dashboard.investmentIntro')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AssetAllocation;
