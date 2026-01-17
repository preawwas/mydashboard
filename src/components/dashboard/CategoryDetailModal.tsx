'use client';

import React, { useEffect, useState } from 'react';
import {
    Modal,
    Table
} from '@/components/ui';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface CategoryDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryId: string | null;
    categoryName: string;
}

export default function CategoryDetailModal({ isOpen, onClose, categoryId, categoryName }: CategoryDetailModalProps) {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [stats, setStats] = useState<any[]>([]);
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    useEffect(() => {
        if (isOpen && categoryId && token) {
            fetchStats();
        }
    }, [isOpen, categoryId, token]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/categories/${categoryId}/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setStats(result.data);
                const years = Array.from(new Set(result.data.map((s: any) => s.year))) as number[];
                const sortedYears = years.sort((a, b) => a - b);
                setAvailableYears(sortedYears);
                if (sortedYears.length > 0 && !sortedYears.includes(selectedYear)) {
                    setSelectedYear(sortedYears[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch category stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStats = stats
        .filter(s => s.year === selectedYear)
        .sort((a, b) => a.monthIndex - b.monthIndex);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={categoryName}
            description="สรุปยอดค่าใช้จ่ายรายเดือนตามปีที่เลือก"
            size="sm"
        >
            {loading ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F5C542]" />
                </div>
            ) : (
                <div className="mt-4 space-y-4">
                    {/* Year Tabs */}
                    {availableYears.length > 0 && (
                        <div className="flex items-center gap-2 p-1 bg-[#15140F] rounded-xl border border-[#2E2C24]">
                            {availableYears.map(year => (
                                <button
                                    key={year}
                                    onClick={() => setSelectedYear(year)}
                                    className={cn(
                                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                                        selectedYear === year
                                            ? "bg-[#F5C542] text-[#15140F] shadow-lg shadow-[#F5C542]/20"
                                            : "text-[#71717A] hover:text-[#FAFAFA]"
                                    )}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    )}

                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[#A1A1AA] border-b border-[#2E2C24]">
                                <th className="pb-4 font-medium text-left">เดือน</th>
                                <th className="pb-4 font-medium text-right">ยอดรวม</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2E2C24]">
                            {filteredStats.length > 0 ? (
                                filteredStats.map((item, index) => (
                                    <tr key={index} className="text-[#FAFAFA] hover:bg-[#2E2C24]/30 transition-colors group">
                                        <td className="py-4 font-medium group-hover:text-[#F5C542] transition-colors">{item.month}</td>
                                        <td className="py-4 text-right font-bold">฿{item.total_amount.toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="py-12 text-center">
                                        <div className="text-[#2E2C24] mb-2 flex justify-center">
                                            <Loader2 className="w-8 h-8 opacity-20" />
                                        </div>
                                        <p className="text-[#71717A]">ไม่มีข้อมูลสำหรับปี {selectedYear}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </Modal>
    );
}
