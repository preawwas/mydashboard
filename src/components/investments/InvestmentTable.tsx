'use client';

import React from 'react';
import { Table, Badge, Button } from '@/components/ui';
import { Investment, InvestmentFilters } from '@/types';
import { formatCurrency, formatDate, getCategoryColor, getStrategyColor, getStatusColor, calculateProfitLoss } from '@/lib/utils';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

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
    const { t } = useTranslation();
    const columns = [
        {
            key: 'asset',
            header: t('investment.asset'),
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
            header: t('investment.market'),
            render: (item: Investment) => (
                <span className="text-foreground">{item.market}</span>
            ),
        },
        {
            key: 'category',
            header: t('investment.type.label'),
            render: (item: Investment) => (
                <Badge className={getCategoryColor(item.asset_category)}>
                    {item.asset_category === 'GOLD' ? t('investment.type.gold') :
                        item.asset_category === 'CRYPTO' ? t('investment.type.crypto') :
                            item.asset_category === 'STOCK' ? t('investment.type.stock') :
                                item.asset_category === 'FUND' ? t('investment.type.fund') :
                                    item.asset_category === 'USD' ? 'USD' :
                                        t('common.others')}
                </Badge>
            ),
        },
        {
            key: 'strategy',
            header: t('investment.strategy'),
            render: (item: Investment) => (
                <Badge className={getStrategyColor(item.strategy_type)}>
                    {item.strategy_type}
                </Badge>
            ),
        },
        {
            key: 'buy_info',
            header: t('investment.buy'),
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
            header: t('investment.totalCost'),
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
            header: t('common.profit'),
            render: (item: Investment) => {
                if (item.sell_history.length === 0) {
                    return <span className="text-muted-foreground">-</span>;
                }
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
            header: t('common.status'),
            render: (item: Investment) => (
                <Badge className={getStatusColor(item.status)}>
                    {item.status === 'OPEN' ? t('investment.status.open') : t('investment.status.closed')}
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
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title={t('common.edit')}
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item);
                        }}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title={t('common.delete')}
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
            emptyMessage={t('investment.noItems')}
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
