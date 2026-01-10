'use client';

import React from 'react';
import { Table, Badge, Button } from '@/components/ui';
import { Investment, InvestmentFilters } from '@/types';
import { formatCurrency, formatDateTime, getCategoryColor, getStrategyColor, getStatusColor, calculateProfitLoss } from '@/lib/utils';
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
            header: 'สินทรัพย์',
            render: (item: Investment) => (
                <div className="flex items-center gap-3">
                    <div>
                        <p className="font-medium text-[#FAFAFA]">{item.asset_code}</p>
                        <p className="text-sm text-gray-500">{item.asset_name}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'market',
            header: 'ตลาด',
            render: (item: Investment) => (
                <span className="text-[#FAFAFA]">{item.market}</span>
            ),
        },
        {
            key: 'category',
            header: 'ประเภท',
            render: (item: Investment) => (
                <Badge className={getCategoryColor(item.asset_category)}>
                    {item.asset_category}
                </Badge>
            ),
        },
        {
            key: 'strategy',
            header: 'กลยุทธ์',
            render: (item: Investment) => (
                <Badge className={getStrategyColor(item.strategy_type)}>
                    {item.strategy_type}
                </Badge>
            ),
        },
        {
            key: 'buy_info',
            header: 'ซื้อ',
            render: (item: Investment) => (
                <div>
                    <p className="font-medium text-[#FAFAFA]">
                        {item.buy_quantity} × {formatCurrency(item.buy_price_per_unit, item.buy_currency)}
                    </p>
                    <p className="text-sm text-gray-500">{formatDateTime(item.buy_datetime)}</p>
                </div>
            ),
        },
        {
            key: 'total_cost',
            header: 'ต้นทุนรวม',
            render: (item: Investment) => {
                const totalCost = item.buy_quantity * item.buy_price_per_unit + item.buy_fee;
                return (
                    <p className="font-medium text-[#FAFAFA]">
                        {formatCurrency(totalCost, item.buy_currency)}
                    </p>
                );
            },
        },
        {
            key: 'profit_loss',
            header: 'กำไร/ขาดทุน',
            render: (item: Investment) => {
                if (item.sell_history.length === 0) {
                    return <span className="text-gray-400">-</span>;
                }
                const { profitLoss, percentage } = calculateProfitLoss(
                    item.buy_quantity,
                    item.buy_price_per_unit,
                    item.buy_fee,
                    item.sell_history
                );
                const isProfit = profitLoss >= 0;
                return (
                    <div className={isProfit ? 'text-green-600' : 'text-red-600'}>
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
            header: 'สถานะ',
            render: (item: Investment) => (
                <Badge className={getStatusColor(item.status)}>
                    {item.status === 'OPEN' ? 'เปิด' : 'ปิด'}
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
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="แก้ไข"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="ลบ"
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
            emptyMessage="ยังไม่มีรายการลงทุน เริ่มต้นเพิ่มการลงทุนใหม่"
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
