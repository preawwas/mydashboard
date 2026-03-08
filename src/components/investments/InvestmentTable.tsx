'use client';

import React from 'react';
import { Table, Badge, Button } from '@/components/ui';
import { Investment, InvestmentFilters } from '@/types';
import { formatCurrency, formatDate, getCategoryColor, getStrategyColor, getStatusColor, calculateProfitLoss } from '@/lib/utils';
import { Eye, Edit, Trash2 } from 'lucide-react';

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
    const columns = [
        {
            key: 'asset',
            header: 'Asset',
            render: (item: Investment) => (
                <div className="flex items-center gap-3">
                    <div>
                        <p className="font-medium text-foreground">{item.asset_code}</p>
                        <p className="text-sm text-muted-foreground">{item.asset_name}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'market',
            header: 'Market',
            className: 'hidden lg:table-cell',
            render: (item: Investment) => (
                <span className="text-foreground">{item.market}</span>
            ),
        },
        {
            key: 'category',
            header: 'Type',
            className: 'hidden md:table-cell',
            render: (item: Investment) => (
                <Badge className={getCategoryColor(item.asset_category)}>
                    {item.asset_category === 'GOLD' ? 'Gold' :
                        item.asset_category === 'CRYPTO' ? 'Crypto' :
                            item.asset_category === 'STOCK' ? 'Stock' :
                                item.asset_category === 'FUND' ? 'Fund' :
                                    item.asset_category === 'USD' ? 'USD' :
                                        'Others'}
                </Badge>
            ),
        },
        {
            key: 'strategy',
            header: 'Strategy',
            className: 'hidden xl:table-cell',
            render: (item: Investment) => (
                <Badge className={getStrategyColor(item.strategy_type)}>
                    {item.strategy_type}
                </Badge>
            ),
        },
        {
            key: 'buy_info',
            header: 'Buy',
            className: 'hidden sm:table-cell',
            render: (item: Investment) => (
                <div>
                    <p className="font-medium text-foreground">
                        {item.buy_quantity} × {formatCurrency(item.buy_price_per_unit, item.buy_currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(item.buy_datetime)}</p>
                </div>
            ),
        },
        {
            key: 'total_cost',
            header: 'Total Cost',
            className: 'hidden md:table-cell',
            render: (item: Investment) => {
                const totalCost = item.buy_quantity * item.buy_price_per_unit + item.buy_fee;
                return (
                    <p className="font-medium text-foreground">
                        {formatCurrency(totalCost, item.buy_currency)}
                    </p>
                );
            },
        },
        {
            key: 'profit_loss',
            header: 'Profit/Loss',
            render: (item: Investment) => {
                const { profitLoss, percentage } = calculateProfitLoss(
                    item.buy_quantity,
                    item.buy_price_per_unit,
                    item.buy_fee,
                    item.sell_history
                );
                const isProfit = profitLoss >= 0;
                return (
                    <div className={isProfit ? 'text-green-500' : 'text-destructive'}>
                        <p className="font-medium">
                            {isProfit ? '+' : ''}{formatCurrency(profitLoss, item.buy_currency)}
                        </p>
                        <p className="text-sm">
                            {isProfit ? '+' : ''}{percentage.toFixed(2)}%
                        </p>
                    </div>
                );
            },
        },
        {
            key: 'status',
            header: 'Status',
            className: 'hidden sm:table-cell',
            render: (item: Investment) => (
                <Badge className={getStatusColor(item.status)}>
                    {item.status === 'OPEN' ? 'Open' : 'Closed'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'w-32',
            render: (item: Investment) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                        }}
                        aria-label={`Edit ${item.asset_code}`}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
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
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
