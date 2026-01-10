'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, BarChart3, PieChart, Target } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    value: string;
    subtitle?: string;
    change?: number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const colorMap = {
    blue: {
        bg: 'from-blue-500 to-blue-600',
        icon: 'bg-blue-400/30',
        shadow: 'shadow-blue-500/30',
    },
    green: {
        bg: 'from-emerald-500 to-emerald-600',
        icon: 'bg-emerald-400/30',
        shadow: 'shadow-emerald-500/30',
    },
    purple: {
        bg: 'from-purple-500 to-purple-600',
        icon: 'bg-purple-400/30',
        shadow: 'shadow-purple-500/30',
    },
    orange: {
        bg: 'from-orange-500 to-orange-600',
        icon: 'bg-orange-400/30',
        shadow: 'shadow-orange-500/30',
    },
    red: {
        bg: 'from-red-500 to-red-600',
        icon: 'bg-red-400/30',
        shadow: 'shadow-red-500/30',
    },
};

const SummaryCard: React.FC<SummaryCardProps> = ({
    title,
    value,
    subtitle,
    change,
    icon,
    color,
}) => {
    const colors = colorMap[color];

    return (
        <Card
            className={cn(
                'relative overflow-hidden bg-gradient-to-br text-white',
                colors.bg,
                'shadow-lg',
                colors.shadow
            )}
            padding="md"
        >
            <CardContent>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
                        <h3 className="text-2xl font-bold mb-1">{value}</h3>
                        {subtitle && (
                            <p className="text-sm text-white/70">{subtitle}</p>
                        )}
                        {change !== undefined && (
                            <div className="flex items-center gap-1 mt-2">
                                {change >= 0 ? (
                                    <TrendingUp className="w-4 h-4" />
                                ) : (
                                    <TrendingDown className="w-4 h-4" />
                                )}
                                <span className="text-sm font-medium">
                                    {change >= 0 ? '+' : ''}
                                    {change.toFixed(2)}%
                                </span>
                            </div>
                        )}
                    </div>
                    <div className={cn('p-3 rounded-xl', colors.icon)}>
                        {icon}
                    </div>
                </div>
            </CardContent>
            {/* Decorative circles */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
        </Card>
    );
};

interface SummaryCardsProps {
    data: {
        totalValue: number;
        totalProfitLoss: number;
        profitLossPercentage: number;
        totalAssets: number;
        openPositions: number;
    };
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
                title="มูลค่าพอร์ตทั้งหมด"
                value={formatCurrency(data.totalValue)}
                subtitle="Total Portfolio Value"
                icon={<Wallet className="w-6 h-6" />}
                color="blue"
            />
            <SummaryCard
                title="กำไร/ขาดทุนรวม"
                value={formatCurrency(data.totalProfitLoss)}
                change={data.profitLossPercentage}
                icon={data.totalProfitLoss >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                color={data.totalProfitLoss >= 0 ? 'green' : 'red'}
            />
            <SummaryCard
                title="จำนวนสินทรัพย์"
                value={data.totalAssets.toString()}
                subtitle="รายการ"
                icon={<BarChart3 className="w-6 h-6" />}
                color="purple"
            />
            <SummaryCard
                title="ตำแหน่งที่เปิดอยู่"
                value={data.openPositions.toString()}
                subtitle="Open Positions"
                icon={<Target className="w-6 h-6" />}
                color="orange"
            />
        </div>
    );
};

export default SummaryCards;
