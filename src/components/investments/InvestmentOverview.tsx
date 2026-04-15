'use client';

import React from 'react';
import { Investment } from '@/types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
    GOLD: '#344C4B',   // Teal
    STOCK: '#E5765C',  // Coral
    FUND: '#8CBEBF',   // Turquoise
    CRYPTO: '#A8AB79', // Darker Spring for better visibility (was #DFE0C3)
    OTHER: '#6b7280'
};
interface InvestmentOverviewProps {
    investments: Investment[];
    summaryData: any;
    allocationData: any[]; // Using any[] to bypass precise type needs for this UI
}

export default function InvestmentOverview({ investments, summaryData, allocationData }: InvestmentOverviewProps) {
    // Generate dummy sparkline data for the background chart
    const dummyChartData = [
        { value: 100 }, { value: 120 }, { value: 110 }, { value: 140 }, 
        { value: 130 }, { value: 180 }, { value: 160 }, { value: 200 }
    ];

    // Group investments by category and extract the one with the highest investment value
    const getTopAssetsPerCategory = () => {
        const categoryMap = new Map<string, Investment>();
        
        investments.forEach((inv) => {
            if (inv.status !== 'OPEN') return; // Only consider open positions
            
            const cost = (inv.buy_quantity * inv.buy_price_per_unit) + (inv.buy_fee || 0);
            
            if (!categoryMap.has(inv.asset_category)) {
                categoryMap.set(inv.asset_category, inv);
            } else {
                const existing = categoryMap.get(inv.asset_category)!;
                const existingCost = (existing.buy_quantity * existing.buy_price_per_unit) + (existing.buy_fee || 0);
                if (cost > existingCost) {
                    categoryMap.set(inv.asset_category, inv);
                }
            }
        });
        
        // Sort by value descending and take top 4
        return Array.from(categoryMap.values())
            .sort((a, b) => {
                const costA = (a.buy_quantity * a.buy_price_per_unit) + (a.buy_fee || 0);
                const costB = (b.buy_quantity * b.buy_price_per_unit) + (b.buy_fee || 0);
                return costB - costA;
            })
            .slice(0, 4);
    };

    const topAssetsByCategory = getTopAssetsPerCategory();

    return (
        <div className="flex flex-col gap-4 md:gap-6 w-full max-w-6xl mx-auto pb-10">
            {/* Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Total Portfolio Value Card */}
                <div className="lg:col-span-2 bg-white rounded-[16px] md:rounded-[24px] p-4 md:p-6 lg:p-8 shadow-sm border-[1px] border-[#0D3B38] flex flex-col justify-between min-h-[220px] md:min-h-[250px]">
                    <div>
                        <p className="text-[10px] font-extrabold tracking-widest text-[#a1a1aa] uppercase mb-4">Total Portfolio Value</p>
                        <div className="flex items-end gap-3 flex-wrap">
                            <h2 className="text-[30px] sm:text-[40px] md:text-[48px] font-extrabold text-[#0D3B38] leading-none tracking-tight">
                                {formatCurrency(Math.floor(summaryData?.totalValue || 0)).replace('.00', '')}
                            </h2>
                            <div className="flex items-center gap-1.5 mb-2">
                                {(summaryData?.profitLossPercentage || 0) >= 0 ? (
                                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#2b7a71]" strokeWidth={3} />
                                ) : (
                                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#ef4444]" strokeWidth={3} />
                                )}
                                <span className={`text-sm sm:text-base font-extrabold ${(summaryData?.profitLossPercentage || 0) >= 0 ? 'text-[#2b7a71]' : 'text-[#ef4444]'}`}>
                                    {summaryData?.profitLossPercentage > 0 ? '+' : ''}{(summaryData?.profitLossPercentage || 0).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-6 mt-6 md:mt-10">
                        <div className="bg-[#f4f4f5] rounded-xl flex flex-col items-center justify-center py-5">
                            <p className="text-[11px] font-medium text-[#71717a] uppercase mb-1">Assets</p>
                            <p className="text-[26px] font-extrabold text-[#18181b] leading-none">{summaryData?.totalAssets || 0}</p>
                        </div>
                        <div className="bg-[#f4f4f5] rounded-xl flex flex-col items-center justify-center py-5">
                            <p className="text-[11px] font-medium text-[#71717a] uppercase mb-1">Open</p>
                            <p className="text-[26px] font-extrabold text-[#18181b] leading-none">{summaryData?.openPositions || 0}</p>
                        </div>
                        <div className="bg-[#f4f4f5] rounded-xl flex flex-col items-center justify-center py-5">
                            <p className="text-[11px] font-medium text-[#71717a] uppercase mb-1">Currency</p>
                            <p className="text-[22px] font-extrabold text-[#18181b] leading-none mt-[4px]">THB</p>
                        </div>
                    </div>
                </div>

                {/* Asset Allocation Card */}
                <div className="bg-[#ecedf4] rounded-[16px] md:rounded-[24px] p-4 md:p-6 shadow-sm flex flex-col justify-between min-h-[220px] md:min-h-[250px] lg:col-span-1 border-[1px] border-transparent relative">
                    <h3 className="text-[15px] font-extrabold text-[#111827] mb-2 text-center absolute top-6 left-0 right-0 z-10">Asset Allocation</h3>
                    
                    {allocationData && allocationData.length > 0 ? (
                        <div className="relative w-full flex-1 flex flex-col items-center justify-center mt-8 min-h-[160px]">
                            {/* Recharts Pie Chart */}
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={allocationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={52}
                                        outerRadius={68}
                                        dataKey="percentage"
                                        stroke="none"
                                    >
                                        {allocationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category?.toUpperCase() || 'OTHER'] || '#6b7280'} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                                {(() => {
                                    const topAsset = [...allocationData].sort((a, b) => b.percentage - a.percentage)[0];
                                    return topAsset ? (
                                        <>
                                            <span 
                                                className="text-[22px] sm:text-[24px] font-extrabold leading-none mb-1 tracking-tight"
                                                style={{ color: CATEGORY_COLORS[topAsset.category?.toUpperCase() || 'OTHER'] || '#344C4B' }}
                                            >
                                                {(topAsset.percentage || 0).toFixed(1)}%
                                            </span>
                                            <span className="text-[8px] font-extrabold tracking-widest text-[#4b5563] uppercase">
                                                IN {topAsset.category}
                                            </span>
                                        </>
                                    ) : null;
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center mt-6">
                            <span className="text-sm font-medium text-gray-500">No assets recorded.</span>
                        </div>
                    )}

                    {/* Legend */}
                    {allocationData && allocationData.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-4 pt-1">
                            {[...allocationData].sort((a, b) => b.percentage - a.percentage).slice(0, 4).map((asset, idx) => {
                                const color = CATEGORY_COLORS[asset.category?.toUpperCase() || 'OTHER'] || '#6b7280';
                                
                                return (
                                    <div key={idx} className="flex items-center gap-2.5">
                                        <div className="w-[9px] h-[9px] rounded-full shrink-0" style={{ backgroundColor: color }} />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-extrabold leading-[1.2] uppercase tracking-wide" style={{ color }}>{asset.category}</span>
                                            <span className="text-[10px] font-extrabold text-[#4b5563] leading-[1.2]">({asset.percentage.toFixed(2)}%)</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row */}
            <div className="w-full">
                {/* Transaction List */}
                <div className="w-full bg-[#f9faf9] rounded-[16px] md:rounded-[32px] p-4 md:p-6 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full min-w-[520px] md:min-w-0 text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="pb-4 text-[9px] font-bold tracking-widest text-[#a1a1aa] uppercase pl-2">Asset Name</th>
                                    <th className="pb-4 text-[9px] font-bold tracking-widest text-[#a1a1aa] uppercase text-right">Qty</th>
                                    <th className="pb-4 text-[9px] font-bold tracking-widest text-[#a1a1aa] uppercase text-center">Category</th>
                                    <th className="pb-4 text-[9px] font-bold tracking-widest text-[#a1a1aa] uppercase text-right pr-2">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topAssetsByCategory.length > 0 ? topAssetsByCategory.map((inv, idx) => {
                                    // Make icon based on category
                                    const iconBg = inv.asset_category === 'GOLD' ? 'bg-[#fef08a]' : inv.asset_category === 'STOCK' ? 'bg-[#fce7f3]' : 'bg-[#ccfbf1]';
                                    const iconText = inv.asset_category === 'GOLD' ? 'text-[#a16207]' : inv.asset_category === 'STOCK' ? 'text-[#be185d]' : 'text-[#0f766e]';
                                    const categoryColor = inv.asset_category === 'GOLD' ? 'text-[#a16207]' : inv.asset_category === 'STOCK' ? 'text-[#be185d]' : 'text-[#0f766e]';

                                    return (
                                        <tr key={inv.id} className="border-b border-gray-100 last:border-0 hover:bg-white/50 transition-colors">
                                            <td className="py-4 pl-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full ${iconBg} ${iconText} flex items-center justify-center text-[10px] font-bold`}>
                                                        {inv.asset_code?.substring(0, 1) || 'A'}
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-extrabold text-[#0D3B38]">{inv.asset_code}</p>
                                                        <p className="text-[8px] font-extrabold tracking-widest text-gray-400 mt-0.5 uppercase">
                                                            Strategy: {inv.strategy_type} · Status: {inv.status}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-[11px] font-extrabold text-[#0D3B38] text-right">
                                                {inv.buy_quantity.toFixed(4)}
                                            </td>
                                            <td className="py-4 text-center">
                                                <span className={`text-[10px] font-extrabold tracking-widest ${categoryColor}`}>
                                                    {inv.asset_category}
                                                </span>
                                            </td>
                                            <td className="py-4 text-[11px] font-medium text-gray-500 text-right pr-2">
                                                {(() => {
                                                    const d = new Date(inv.buy_datetime);
                                                    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                                                })()}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={4} className="py-10 text-center text-sm text-gray-400">
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
