'use client';

import React, { useEffect, useState } from 'react';
import {
    Modal,
    Table
} from '@/components/ui';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

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
            const response = await apiClient.fetch(`/api/categories/${categoryId}/stats`);
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
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="mt-4 space-y-4">
                    {/* Year Tabs */}
                    {availableYears.length > 0 && (
                        <div className="flex items-center gap-2 p-1 bg-background rounded-xl border border-border">
                            {availableYears.map(year => (
                                <button
                                    key={year}
                                    onClick={() => setSelectedYear(year)}
                                    className={cn(
                                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                                        selectedYear === year
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    )}

                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-muted-foreground border-b border-border">
                                <th className="pb-4 font-medium text-left">เดือน</th>
                                <th className="pb-4 font-medium text-right">ยอดรวม</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredStats.length > 0 ? (
                                filteredStats.map((item, index) => (
                                    <tr key={index} className="text-foreground hover:bg-muted/10 transition-colors group">
                                        <td className="py-4 font-medium group-hover:text-primary transition-colors">{item.month}</td>
                                        <td className="py-4 text-right font-bold">฿{item.total_amount.toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="py-12 text-center">
                                        <div className="text-muted/20 mb-2 flex justify-center">
                                            <Loader2 className="w-8 h-8" />
                                        </div>
                                        <p className="text-muted-foreground">ไม่มีข้อมูลสำหรับปี {selectedYear}</p>
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
