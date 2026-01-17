'use client';

import React, { useMemo } from 'react';
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

const categoryColors: Record<string, string> = {
    GOLD: '#F5C542',  // Gold
    CRYPTO: '#9F7AEA', // Soft Purple
    STOCK: '#4299E1',  // Sky Blue
};

const AssetAllocation: React.FC<AssetAllocationProps> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Override colors for consistency
    const processedData = useMemo(() => {
        return data.map(item => ({
            ...item,
            color: categoryColors[item.category] || item.color
        })).sort((a, b) => b.value - a.value);
    }, [data]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate SVG paths for donut chart
    const chartPaths = useMemo(() => {
        let accumulatedPercentage = 0;
        return processedData.map((item) => {
            const startPercentage = accumulatedPercentage;
            accumulatedPercentage += item.percentage;

            const startAngle = (startPercentage / 100) * 360;
            const endAngle = (accumulatedPercentage / 100) * 360;

            // Convert polar to cartesian
            // Center is 50,50. Radius is 40.
            const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);

            // Large arc flag
            const largeArcFlag = item.percentage > 50 ? 1 : 0;

            // Path command
            const path = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
            ].join(' ');

            return { ...item, path };
        });
    }, [processedData]);


    return (
        <Card className="bg-[#1C1C1E] border-[#2E2C24]">
            <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-white text-lg font-medium">สัดส่วนการลงทุน (Asset Allocation)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                    {/* Donut Chart */}
                    <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex-shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform drop-shadow-2xl">
                            {/* Background circle */}
                            <circle cx="50" cy="50" r="40" fill="#27272A" />

                            {chartPaths.length > 0 ? (
                                chartPaths.map((item, index) => (
                                    <path
                                        key={item.category}
                                        d={item.path}
                                        fill={item.color}
                                        stroke="#1C1C1E"
                                        strokeWidth="2"
                                        className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                                    />
                                ))
                            ) : (
                                <circle cx="50" cy="50" r="40" fill="#27272A" stroke="#3F3F46" strokeWidth="1" />
                            )}

                            {/* Inner Hole for Donut effect */}
                            <circle cx="50" cy="50" r="28" fill="#1C1C1E" />

                            {/* Center Text */}
                            <foreignObject x="15" y="32" width="70" height="36">
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <span className="text-[0.4rem] text-gray-300 mb-0.5 tracking-wide uppercase">Total Value</span>
                                    <span className="text-[0.6rem] font-bold text-white truncate w-full px-1 drop-shadow-md">
                                        {formatCurrency(total).replace('฿', '')}
                                    </span>
                                </div>
                            </foreignObject>
                        </svg>
                    </div>

                    {/* Legend / List */}
                    <div className="flex-1 w-full space-y-3 sm:space-y-4">
                        {processedData.length > 0 ? (
                            processedData.map((item) => (
                                <div key={item.category} className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#27272A]/50 border border-transparent hover:border-[#F5C542]/20 transition-all">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div
                                            className="w-2 sm:w-3 h-10 sm:h-12 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                            style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}40` }}
                                        />
                                        <div>
                                            <p className="text-white font-semibold text-base sm:text-lg">{categoryLabels[item.category] || item.category}</p>
                                            <p className="text-xs text-gray-400 font-medium">{item.percentage.toFixed(1)}% Portfolio</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold tracking-wide text-lg sm:text-xl">{formatCurrency(item.value)}</p>
                                        <div className="hidden sm:block w-28 bg-gray-800 h-2 rounded-full mt-2 ml-auto overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-[#27272A]/30 rounded-xl border border-dashed border-gray-700">
                                <p>ยังไม่มีข้อมูลการลงทุน</p>
                                <p className="text-sm mt-2">เริ่มเพิ่มการลงทุนของคุณเพื่อดูสัดส่วน</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AssetAllocation;
