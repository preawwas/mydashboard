'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { TrendingUp, TrendingDown, Wallet, PieChart, Activity, DollarSign } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

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
    const { t } = useTranslation();
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Hero Card - Total Value */}
            <Card className="lg:col-span-3 bg-card backdrop-blur-xl border-border shadow-xl shadow-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <CardContent className="p-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Wallet className="w-6 h-6 text-primary" />
                                </div>
                                <span className="text-muted-foreground font-semibold text-base sm:text-lg">{t('common.totalBalance')}</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight mt-2">
                                {formatCurrency(data.totalValue)}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4 bg-card/60 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-border shadow-lg shrink-0">
                            <div>
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">{t('common.totalProfit')}</p>
                                <div className={`flex items-center gap-2 sm:gap-3 ${data.totalProfitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    <span className="text-xl sm:text-2xl font-bold">
                                        {data.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(data.totalProfitLoss)}
                                    </span>
                                    <div className={`flex items-center text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full ${data.totalProfitLoss >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                        {data.totalProfitLoss >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                        {data.profitLossPercentage.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Secondary Stats */}
            <Card className="bg-card backdrop-blur-lg border-border hover:border-primary/50 transition-all shadow-md shadow-primary/5">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <PieChart className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-blue-500 bg-blue-500/5 px-2.5 py-1 rounded uppercase tracking-wider">Assets</span>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium mb-1">{t('common.totalAssets')}</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground truncate tracking-tight">
                        {data.totalAssets} <span className="text-sm sm:text-lg font-normal text-muted-foreground">{t('common.items')}</span>
                    </h3>
                </CardContent>
            </Card>

            <Card className="bg-card backdrop-blur-lg border-border hover:border-primary/50 transition-all shadow-md shadow-primary/5">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Activity className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded uppercase tracking-wider">Active</span>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium mb-1">{t('common.statusOpen')}</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground truncate tracking-tight">
                        {data.openPositions} <span className="text-sm sm:text-lg font-normal text-muted-foreground">Positions</span>
                    </h3>
                </CardContent>
            </Card>

            <Card className="bg-card backdrop-blur-lg border-border hover:border-primary/50 transition-all shadow-md shadow-primary/5">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <DollarSign className="w-6 h-6 text-emerald-500" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-emerald-500 bg-emerald-500/5 px-2.5 py-1 rounded uppercase tracking-wider">Cash Flow</span>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium mb-1">Cost Basis</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground max-w-full truncate tracking-tight" title={formatCurrency(data.totalValue - data.totalProfitLoss)}>
                        {formatCurrency(data.totalValue - data.totalProfitLoss)}
                    </h3>
                </CardContent>
            </Card>
        </div>
    );
};

export default SummaryCards;
