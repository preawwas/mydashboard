'use client';

import React from 'react';
import { Table, Badge, Button } from '@/components/ui';
import { Investment, InvestmentFilters } from '@/types';
import { formatCurrency, formatDate, getCategoryColor, getStrategyColor, getStatusColor, calculateProfitLoss, formatQuantity } from '@/lib/utils';
import { Edit, Trash2 } from 'lucide-react';

interface InvestmentTableProps {
    investments: Investment[];
    isLoading: boolean;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onEdit: (investment: Investment) => void;
    onDelete: (investment: Investment) => void;
}

const InvestmentTable: React.FC<InvestmentTableProps> = ({
    investments,
    isLoading,
    pagination,
    onPageChange,
    onLimitChange,
    onEdit,
    onDelete,
}) => {
    // Icon backgrounds per category
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'STOCK': return { bg: 'bg-[#e0f2f1]', text: 'text-[#0D3B38]', icon: '₿' };
            case 'GOLD': return { bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', icon: '$' };
            case 'CRYPTO': return { bg: 'bg-[#dbeafe]', text: 'text-[#1e40af]', icon: '◆' };
            case 'FUND': return { bg: 'bg-[#ede9fe]', text: 'text-[#6d28d9]', icon: '◉' };
            default: return { bg: 'bg-[#f3f4f6]', text: 'text-[#374151]', icon: '●' };
        }
    };

    // Position type label
    const getPositionLabel = (inv: Investment) => {
        const totalCost = inv.buy_quantity * inv.buy_price_per_unit;
        if (totalCost >= 500000) return 'Premium Vault';
        if (totalCost >= 100000) return 'High Value';
        if (totalCost >= 10000) return 'Commodity';
        if (totalCost >= 1000) return 'Digital Asset';
        return '';
    };

    // Strategy badge style using getStrategyColor from utils
    const getStrategyStyle = (strategy: string) => {
        return getStrategyColor(strategy);
    };

    const columns = [
        {
            key: 'asset',
            header: 'ASSET',
            render: (item: Investment) => {
                const catIcon = getCategoryIcon(item.asset_category);
                return (
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${catIcon.bg} ${catIcon.text} flex items-center justify-center text-sm font-bold shrink-0`}>
                            {catIcon.icon}
                        </div>
                        <div>
                            <p className="font-bold text-[#0D3B38] text-sm leading-tight">
                                {item.asset_code}
                                <span className="font-bold text-[#0D3B38] ml-0.5"> ({item.asset_category})</span>
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5 italic">{getPositionLabel(item)}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'market',
            header: 'MARKET',
            className: 'whitespace-nowrap',
            render: (item: Investment) => (
                <span className="text-[13px] font-semibold text-[#0D3B38]">{item.market || '—'}</span>
            ),
        },
        {
            key: 'strategy',
            header: 'STRATEGY',
            className: 'whitespace-nowrap',
            render: (item: Investment) => {
                const style = getStrategyStyle(item.strategy_type);
                return (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${style}`}>
                        {item.strategy_type}
                    </span>
                );
            },
        },
        {
            key: 'buy_price',
            header: 'BUY PRICE',
            className: 'whitespace-nowrap',
            render: (item: Investment) => (
                <div>
                    <p className="font-semibold text-[#0D3B38] text-[13px]">
                        {formatQuantity(item.buy_quantity)} * {formatCurrency(item.buy_price_per_unit, item.buy_currency)}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(item.buy_datetime)}</p>
                </div>
            ),
        },
        {
            key: 'total_cost',
            header: 'TOTAL COST',
            className: 'whitespace-nowrap',
            render: (item: Investment) => {
                const totalCost = item.buy_quantity * item.buy_price_per_unit;
                return (
                    <span className="font-bold text-[#0D3B38] text-[14px]">
                        {formatCurrency(totalCost, item.buy_currency)}
                    </span>
                );
            },
        },
        {
            key: 'status',
            header: 'STATUS',
            className: 'whitespace-nowrap',
            render: (item: Investment) => (
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.status === 'OPEN' ? 'bg-[#10b981]' : 'bg-gray-400'}`} />
                    <span className={`text-[13px] font-bold ${item.status === 'OPEN' ? 'text-[#10b981]' : 'text-gray-400'}`}>
                        {item.status}
                    </span>
                </div>
            ),
        },
        {
            key: 'profit_loss',
            header: 'PROFIT/LOSS',
            className: 'whitespace-nowrap',
            render: (item: Investment) => {
                if (item.status !== 'CLOSED') return <span className="text-gray-400 text-sm">—</span>;

                const { profitLoss, percentage } = calculateProfitLoss(
                    item.buy_quantity,
                    item.buy_price_per_unit,
                    item.buy_fee,
                    item.sell_history || []
                );

                const isProfit = profitLoss >= 0;
                const firstSellDate = item.sell_history && item.sell_history.length > 0
                    ? formatDate(item.sell_history[0].datetime)
                    : null;

                return (
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1.5">
                            <span className={`font-bold text-[13px] ${isProfit ? 'text-[#10b981]' : 'text-rose-500'}`}>
                                {isProfit ? '+' : ''}{formatCurrency(profitLoss, item.buy_currency)}
                            </span>
                            <span className={`text-[10px] font-medium ${isProfit ? 'text-[#10b981]/80' : 'text-rose-500/80'}`}>
                                {isProfit ? '+' : ''}{percentage.toFixed(2)}%
                            </span>
                        </div>
                        {firstSellDate && (
                            <p className="text-[11px] text-gray-400 mt-0.5">{firstSellDate}</p>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'actions',
            header: 'ACTION',
            className: 'w-28',
            render: (item: Investment) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                        }}
                        aria-label={`Edit ${item.asset_code}`}
                        className="p-2 text-gray-400 hover:text-[#0D3B38] hover:bg-[#0D3B38]/10 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item);
                        }}
                        aria-label={`Delete ${item.asset_code}`}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-600/10 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <Table
            data={investments}
            columns={columns}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            emptyMessage="No investment found."
            pagination={{
                ...pagination,
                onPageChange,
                onLimitChange,
            }}
            onRowClick={() => { }}
        />
    );
};

export default InvestmentTable;
