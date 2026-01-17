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
            <Card className="lg:col-span-3 bg-gradient-to-r from-[#1C1C1E] to-[#2C2C2E] border-[#F5C542]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5C542]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <CardContent className="p-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-[#F5C542]/10">
                                    <Wallet className="w-6 h-6 text-[#F5C542]" />
                                </div>
                                <span className="text-gray-300 font-semibold text-base sm:text-lg">{t('common.totalBalance')}</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mt-2 text-shadow-sm">
                                {formatCurrency(data.totalValue)}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4 bg-[#151517] p-4 sm:p-5 rounded-xl border border-[#FFFFFF]/10 shadow-lg shrink-0">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-400 font-medium mb-1">{t('common.totalProfit')}</p>
                                <div className={`flex items-center gap-2 sm:gap-3 ${data.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    <span className="text-xl sm:text-2xl font-bold">
                                        {data.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(data.totalProfitLoss)}
                                    </span>
                                    <div className={`flex items-center text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full ${data.totalProfitLoss >= 0 ? 'bg-emerald-400/20' : 'bg-rose-400/20'}`}>
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
            <Card className="bg-[#1C1C1E] border-[#2E2C24] hover:border-[#F5C542]/30 transition-colors">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <PieChart className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold text-gray-400 bg-[#27272A] px-2.5 py-1 rounded uppercase tracking-wider">Assets</span>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">{t('common.totalAssets')}</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white truncate">
                        {data.totalAssets} <span className="text-sm sm:text-lg font-normal text-gray-500">{t('common.items')}</span>
                    </h3>
                </CardContent>
            </Card>

            <Card className="bg-[#1C1C1E] border-[#2E2C24] hover:border-[#F5C542]/30 transition-colors">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-[#F5C542]/10">
                            <Activity className="w-6 h-6 text-[#F5C542]" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold text-gray-400 bg-[#27272A] px-2.5 py-1 rounded uppercase tracking-wider">Active</span>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">{t('common.statusOpen')}</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white truncate">
                        {data.openPositions} <span className="text-sm sm:text-lg font-normal text-gray-500">Positions</span>
                    </h3>
                </CardContent>
            </Card>

            <Card className="bg-[#1C1C1E] border-[#2E2C24] hover:border-[#F5C542]/30 transition-colors">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <DollarSign className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold text-gray-400 bg-[#27272A] px-2.5 py-1 rounded uppercase tracking-wider">Cash Flow</span>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">Cost Basis</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white max-w-full truncate" title={formatCurrency(data.totalValue - data.totalProfitLoss)}>
                        {formatCurrency(data.totalValue - data.totalProfitLoss)}
                    </h3>
                </CardContent>
            </Card>
        </div>
    );
};

export default SummaryCards;
