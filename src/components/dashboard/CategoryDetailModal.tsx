'use client';

import React, { useEffect, useState } from 'react';
import {
    Modal,
    Table
} from '@/components/ui';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

interface CategoryDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryId: number | null;
    categoryName: string;
}

export default function CategoryDetailModal({ isOpen, onClose, categoryId, categoryName }: CategoryDetailModalProps) {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any[]>([]);

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
            }
        } catch (error) {
            console.error('Failed to fetch category stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={categoryName}
            description="Monthly spending breakdown for this category."
            size="sm"
        >
            {loading ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F5C542]" />
                </div>
            ) : (
                <div className="mt-4">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[#A1A1AA] border-b border-[#2E2C24]">
                                <th className="pb-4 font-medium text-left">Month</th>
                                <th className="pb-4 font-medium text-right">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2E2C24]">
                            {stats.length > 0 ? (
                                stats.map((item, index) => (
                                    <tr key={index} className="text-[#FAFAFA]">
                                        <td className="py-4">{item.month}</td>
                                        <td className="py-4 text-right font-medium">฿{item.total_amount.toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="py-8 text-center text-[#71717A]">
                                        No data available
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
