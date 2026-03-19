'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { TrendingUp, TrendingDown, Wallet, PieChart, Activity, DollarSign } from 'lucide-react';

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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Hero Card - Total Value */}
            <Card 
                className="lg:col-span-3 bg-card border-border shadow-md relative overflow-hidden"
                role="region"
                aria-label={`Portfolio summary. Total value: ${formatCurrency(data.totalValue)}. Total profit: ${data.totalProfitLoss >= 0 ? '+' : ''}${formatCurrency(data.totalProfitLoss)} (${data.profitLossPercentage.toFixed(2)}%)`}
            >
                <CardContent className="p-5 sm:p-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <Wallet className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-muted-foreground font-semibold text-sm">Total Portfolio Value</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight mt-1">
                                {formatCurrency(data.totalValue)}
                            </h2>
                        </div>

                        <div className="flex items-center gap-3 bg-card p-3 sm:p-4 rounded-xl border border-border shadow-sm shrink-0">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium mb-1">Total Profit/Loss</p>
                                <div className={`flex items-center gap-2 ${data.totalProfitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    <span className="text-lg sm:text-xl font-bold">
                                        {data.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(data.totalProfitLoss)}
                                    </span>
                                    <div className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${data.totalProfitLoss >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                        {data.totalProfitLoss >= 0 ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                                        {data.profitLossPercentage.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Secondary Stats */}
            <Card 
                className="bg-card border-border hover:border-primary/50 transition-colors shadow-md"
                role="region"
                aria-label={`Total assets: ${data.totalAssets} items`}
            >
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-1.5 rounded-lg bg-blue-500/10">
                            <PieChart className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-500/5 px-2 py-0.5 rounded uppercase tracking-wider">Assets</span>
                    </div>
                    <p className="text-muted-foreground text-xs font-medium mb-1">Total Assets</p>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate tracking-tight">
                        {data.totalAssets} <span className="text-sm font-normal text-muted-foreground">Items</span>
                    </h2>
                </CardContent>
            </Card>

            <Card 
                className="bg-card border-border hover:border-primary/50 transition-colors shadow-md"
                role="region"
                aria-label={`Active positions: ${data.openPositions}`}
            >
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded uppercase tracking-wider">Active</span>
                    </div>
                    <p className="text-muted-foreground text-xs font-medium mb-1">Status Open</p>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate tracking-tight">
                        {data.openPositions} <span className="text-sm font-normal text-muted-foreground">Positions</span>
                    </h2>
                </CardContent>
            </Card>

            <Card 
                className="bg-card border-border hover:border-primary/50 transition-colors shadow-md"
                role="region"
                aria-label={`Cost basis: ${formatCurrency(data.totalValue - data.totalProfitLoss)}`}
            >
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10">
                            <DollarSign className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded uppercase tracking-wider">Cash Flow</span>
                    </div>
                    <p className="text-muted-foreground text-xs font-medium mb-1">Cost Basis</p>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground max-w-full truncate tracking-tight" title={formatCurrency(data.totalValue - data.totalProfitLoss)}>
                        {formatCurrency(data.totalValue - data.totalProfitLoss)}
                    </h2>
                </CardContent>
            </Card>
        </div>
    );
};

export default SummaryCards;
