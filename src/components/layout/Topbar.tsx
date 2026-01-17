'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const Topbar: React.FC = () => {
    const { token, user } = useAuthStore();
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const [pendingCount, setPendingCount] = useState(0);
    const [pendingTotal, setPendingTotal] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [pendingItems, setPendingItems] = useState<any[]>([]);

    React.useEffect(() => {
        if (!token) return;
        fetch('/api/expenses', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const now = new Date();
                    const currentMonth = now.getMonth();
                    const currentYear = now.getFullYear();

                    const pending = data.data.filter((exp: any) => {
                        if (exp.payment_type === 'FULL') {
                            const d = new Date(exp.transaction_date);
                            return exp.status === 'PENDING' && (
                                (d.getFullYear() < currentYear) ||
                                (d.getFullYear() === currentYear && d.getMonth() <= currentMonth)
                            );
                        }
                        if (exp.payment_type === 'INSTALLMENT') {
                            return exp.expense_installments?.some((i: any) => {
                                const due = new Date(i.due_date);
                                return i.status === 'PENDING' && (
                                    (due.getFullYear() < currentYear) ||
                                    (due.getFullYear() === currentYear && due.getMonth() <= currentMonth)
                                );
                            });
                        }
                        return false;
                    });

                    const total = pending.reduce((sum: number, exp: any) => {
                        if (exp.payment_type === 'FULL') return sum + exp.amount_total;
                        if (exp.payment_type === 'INSTALLMENT') {
                            const pAmount = exp.expense_installments
                                ?.filter((i: any) => {
                                    const due = new Date(i.due_date);
                                    return i.status === 'PENDING' && (
                                        (due.getFullYear() < currentYear) ||
                                        (due.getFullYear() === currentYear && due.getMonth() <= currentMonth)
                                    );
                                })
                                .reduce((s: number, i: any) => s + i.amount, 0) || 0;
                            return sum + pAmount;
                        }
                        return sum;
                    }, 0);

                    setPendingItems(pending);
                    setPendingCount(pending.length);
                    setPendingTotal(total);
                }
            });
    }, [token]);


    return (
        <header
            className={cn(
                'fixed top-0 right-0 z-30 h-16 border-b border-[#2E2C24]',
                'bg-[#0F0F0C]/80 backdrop-blur-md',
                'transition-all duration-300',
                'left-0 lg:left-20',
                sidebarOpen && 'lg:left-64'
            )}
        >
            <div className="flex items-center justify-between h-full px-6">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#2E2C24] rounded-lg transition-colors lg:hidden"
                    >
                        <Menu className="w-5 h-5" />
                    </button>


                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={cn(
                                "relative p-2 text-[#A1A1AA] hover:text-[#F5C542] hover:bg-[#1C1B16] rounded-lg transition-colors",
                                showNotifications && "text-[#F5C542] bg-[#1C1B16]"
                            )}
                        >
                            <Bell className="w-5 h-5" />
                            {pendingCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0F0F0C]" />
                            )}
                        </button>

                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="absolute right-0 mt-3 w-80 bg-[#1C1B16] border border-[#2E2C24] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-4 border-b border-[#2E2C24] bg-[#21201A] flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-[#FAFAFA]">Monthly Reminders</h3>
                                            <p className="text-[10px] text-[#A1A1AA]">You have {pendingCount} pending items</p>
                                        </div>
                                        <div className="bg-[#F5C542] text-[#15140F] px-2 py-1 rounded-lg text-xs font-bold">
                                            ฿{pendingTotal.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                        {pendingItems.length > 0 ? (
                                            pendingItems.map((item) => (
                                                <div key={item.id} className="p-3 hover:bg-[#2E2C24] rounded-xl transition-colors group">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium text-[#FAFAFA] group-hover:text-[#F5C542] transition-colors">
                                                            {item.item_name}
                                                        </span>
                                                        <span className="text-xs font-bold text-[#FAFAFA]">
                                                            ฿{item.amount_total.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] text-[#71717A]">
                                                        <span>{item.categories?.name}</span>
                                                        <span>{item.payment_type === 'INSTALLMENT' ? 'Installment' : 'Full Payment'}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center">
                                                <Bell className="w-8 h-8 text-[#2E2C24] mx-auto mb-2" />
                                                <p className="text-sm text-[#71717A]">No pending payments</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-[#21201A] border-t border-[#2E2C24]">
                                        <Link
                                            href="/expenses"
                                            onClick={() => setShowNotifications(false)}
                                            className="block w-full text-center py-2 bg-[#F5C542] hover:bg-[#FFC83D] text-[#15140F] text-xs font-bold rounded-xl transition-colors"
                                        >
                                            View All Expenses
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-3 border-l border-[#2E2C24]">
                        <Link href="/dashboard/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-[#FAFAFA]">{user?.name || 'User'}</p>
                                <p className="text-xs text-[#A1A1AA]">{user?.role || 'user'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5C542] to-[#FFC83D] flex items-center justify-center text-[#15140F] font-semibold shadow-lg shadow-[#F5C542]/20">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
