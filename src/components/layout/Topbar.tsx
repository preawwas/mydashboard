'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Bell, Menu } from 'lucide-react';
import { cn, getMonthlyPendingAmount } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

const Topbar: React.FC = () => {
    const { token, user } = useAuthStore();
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const [pendingCount, setPendingCount] = useState(0);
    const [pendingTotal, setPendingTotal] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [pendingItems, setPendingItems] = useState<any[]>([]);



    React.useEffect(() => {
        if (!token || !user) return;
        const params = new URLSearchParams({
            status: 'PENDING',
            limit: '100'
        });

        apiClient.fetch(`/api/expenses/user/${user.id}?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const pending = data.data.filter((exp: any) => getMonthlyPendingAmount(exp) > 0);
                    const total = pending.reduce((sum: number, exp: any) => sum + getMonthlyPendingAmount(exp), 0);

                    setPendingItems(pending);
                    setPendingCount(pending.length);
                    setPendingTotal(total);
                }
            });
    }, [token, user?.id]);


    return (
        <header
            className={cn(
                'fixed top-0 right-0 z-30 h-16 border-b border-border shadow-sm',
                'bg-white/90 backdrop-blur-md',
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
                        aria-label="Open Menu"
                        aria-expanded={sidebarOpen}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-lg transition-colors lg:hidden"
                    >
                        <Menu className="w-5 h-5" aria-hidden="true" />
                    </button>


                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            aria-label="Notifications"
                            aria-expanded={showNotifications}
                            className={cn(
                                "relative p-2 text-muted-foreground hover:text-primary hover:bg-muted/10 rounded-lg transition-colors",
                                showNotifications && "text-primary bg-muted/10"
                            )}
                        >
                            <Bell className="w-5 h-5" aria-hidden="true" />
                            {pendingCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-background/40" />
                            )}
                        </button>

                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="absolute right-0 mt-3 w-80 bg-popover border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-4 border-b border-border bg-muted/5 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-foreground">Monthly Reminders</h3>
                                            <p className="text-[10px] text-muted-foreground">You have {pendingCount} pending items</p>
                                        </div>
                                        <div className="bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xs font-bold">
                                            ฿{pendingTotal.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                        {pendingItems.length > 0 ? (
                                            pendingItems.map((item) => (
                                                <div key={item.id} className="p-3 hover:bg-primary/5 rounded-xl transition-colors group">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                                            {item.item_name}
                                                        </span>
                                                        <span className="text-xs font-bold text-foreground">
                                                            ฿{getMonthlyPendingAmount(item).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
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
                                    <div className="p-3 bg-muted/5 border-t border-border">
                                        <Link
                                            href="/expenses"
                                            onClick={() => setShowNotifications(false)}
                                            className="block w-full text-center py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl transition-colors"
                                        >
                                            View All Expenses
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-3 border-l border-border">
                    <Link href="/settings" aria-label="Navigate to Settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-foreground">{user?.name || 'User'}</p>
                                <p className="text-xs text-muted-foreground">{user?.role || 'user'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-semibold shadow-lg shadow-primary/20">
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
