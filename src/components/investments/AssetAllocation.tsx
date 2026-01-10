'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

interface AllocationItem {
    category: string;
    value: number;
    percentage: number;
    color: string;
}

interface AssetAllocationProps {
    data: AllocationItem[];
}

const categoryLabels: Record<string, string> = {
    GOLD: 'ทองคำ',
    CRYPTO: 'คริปโต',
    STOCK: 'หุ้น',
};

const AssetAllocation: React.FC<AssetAllocationProps> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Card variant="gradient">
            <CardHeader>
                <CardTitle>สัดส่วนการลงทุน</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Pie Chart */}
                    <div className="flex-shrink-0">
                        <div className="relative w-48 h-48 mx-auto">
                            <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                {data.length > 0 ? (
                                    (() => {
                                        let currentAngle = 0;
                                        return data.map((item, index) => {
                                            const angle = (item.percentage / 100) * 360;
                                            const startAngle = currentAngle;
                                            currentAngle += angle;

                                            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                                            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                                            const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                                            const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);

                                            const largeArcFlag = angle > 180 ? 1 : 0;

                                            const pathData = [
                                                `M 50 50`,
                                                `L ${x1} ${y1}`,
                                                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                                `Z`,
                                            ].join(' ');

                                            return (
                                                <path
                                                    key={item.category}
                                                    d={pathData}
                                                    fill={item.color}
                                                    className="transition-all duration-300 hover:opacity-80"
                                                />
                                            );
                                        });
                                    })()
                                ) : (
                                    <circle cx="50" cy="50" r="40" fill="#e5e7eb" />
                                )}
                            </svg>
                            {/* Center circle */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full bg-white shadow-inner flex flex-col items-center justify-center">
                                    <span className="text-xs text-gray-500">รวม</span>
                                    <span className="text-sm font-bold text-gray-900">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 space-y-3">
                        {data.map((item) => (
                            <div
                                key={item.category}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="font-medium text-gray-900">
                                        {categoryLabels[item.category] || item.category}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">{formatCurrency(item.value)}</p>
                                    <p className="text-sm text-gray-500">{item.percentage.toFixed(1)}%</p>
                                </div>
                            </div>
                        ))}
                        {data.length === 0 && (
                            <p className="text-center text-gray-500 py-8">ยังไม่มีข้อมูล</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AssetAllocation;
