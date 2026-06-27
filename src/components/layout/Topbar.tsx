'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Bell, CalendarDays, LogOut } from 'lucide-react';
import { cn, getMonthlyPendingAmount } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import fluffyWordmarkImage from './image.png';

const Topbar: React.FC = () => {
    const router = useRouter();
    const { token, user, logout } = useAuthStore();
    const secretClickCount = useRef(0);
    const secretClickTimer = useRef<NodeJS.Timeout | null>(null);
    const [pendingCount, setPendingCount] = useState(0);
    const [pendingTotal, setPendingTotal] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [pendingItems, setPendingItems] = useState<any[]>([]);

    React.useEffect(() => {
        if (!token || !user) return;
        const params = new URLSearchParams({
            status: 'PENDING',
            limit: '100',
        });

        apiClient.fetch(`/api/expenses/user/${user.id}?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    const pending = data.data.filter((exp: any) => getMonthlyPendingAmount(exp) > 0);
                    const total = pending.reduce((sum: number, exp: any) => sum + getMonthlyPendingAmount(exp), 0);

                    setPendingItems(pending);
                    setPendingCount(pending.length);
                    setPendingTotal(total);
                }
            });
    }, [token, user?.id]);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-40 h-14 md:h-16 border-b border-border bg-white/90 shadow-sm backdrop-blur-md">
            <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-3 px-3 sm:px-6">
                {/* Logo */}
                <button
                    type="button"
                    className="shrink-0 select-none transition-opacity hover:opacity-90 focus:outline-none"
                    onClick={() => {
                        secretClickCount.current += 1;
                        if (secretClickTimer.current) clearTimeout(secretClickTimer.current);
                        secretClickTimer.current = setTimeout(() => {
                            secretClickCount.current = 0;
                        }, 2000);
                        if (secretClickCount.current >= 5) {
                            secretClickCount.current = 0;
                            router.push('/forpreaw');
                        }
                    }}
                    aria-label="Fluffy-ty Home"
                >
                    <Image
                        src={fluffyWordmarkImage}
                        alt="Fluffy-ty"
                        priority
                        width={96}
                        height={32}
                        className="h-6 w-auto max-w-[84px] rounded-md object-contain sm:h-7 sm:max-w-[96px]"
                    />
                </button>

                {/* Center — Motivational Quote (hidden on smaller screens) */}
                <div className="pointer-events-none hidden min-w-0 flex-1 select-none items-center justify-center px-2 lg:flex">
                    <p className="truncate text-center text-[10px] font-medium italic tracking-wide text-muted-foreground/70 xl:text-xs">
                        Don&apos;t wait for the perfect map; just start walking and create your own.
                    </p>
                </div>

                {/* Right Section */}
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <Link
                        href="/notes/calendar"
                        aria-label="Calendar"
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/10 hover:text-primary"
                    >
                        <CalendarDays className="h-5 w-5" aria-hidden="true" />
                    </Link>

                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            aria-label="Notifications"
                            aria-expanded={showNotifications}
                            className={cn(
                                'relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/10 hover:text-primary',
                                showNotifications && 'bg-muted/10 text-primary'
                            )}
                        >
                            <Bell className="h-5 w-5" aria-hidden="true" />
                            {pendingCount > 0 && (
                                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background/40" />
                            )}
                        </button>

                        {showNotifications && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                <div className="absolute right-0 z-50 mt-3 w-[calc(100vw-24px)] max-w-[360px] animate-in fade-in zoom-in-95 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl duration-200 sm:w-80">
                                    <div className="flex items-center justify-between border-b border-border bg-muted/5 p-4">
                                        <div>
                                            <h3 className="font-bold text-foreground">Monthly Reminders</h3>
                                            <p className="text-[10px] text-muted-foreground">You have {pendingCount} pending items</p>
                                        </div>
                                        <div className="rounded-lg bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                                            ฿{pendingTotal.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="custom-scrollbar max-h-[300px] space-y-1 overflow-y-auto p-2">
                                        {pendingItems.length > 0 ? (
                                            pendingItems.map((item) => (
                                                <div key={item.id} className="group rounded-xl p-3 transition-colors hover:bg-primary/5">
                                                    <div className="mb-1 flex items-center justify-between">
                                                        <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
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
                                                <Bell className="mx-auto mb-2 h-8 w-8 text-[#2E2C24]" />
                                                <p className="text-sm text-[#71717A]">No pending payments</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t border-border bg-muted/5 p-3">
                                        <Link
                                            href="/expenses"
                                            onClick={() => setShowNotifications(false)}
                                            className="block w-full rounded-xl bg-primary py-2 text-center text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                                        >
                                            View All Expenses
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 border-l border-border pl-1.5 sm:gap-2 sm:pl-2">
                        <button
                            type="button"
                            onClick={handleLogout}
                            aria-label="Logout"
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                        >
                            <LogOut className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <Link
                            href="/settings"
                            aria-label="Navigate to Settings"
                            className="flex items-center gap-2 transition-opacity hover:opacity-80 sm:gap-3"
                        >
                            <div className="hidden text-right md:block">
                                <p className="max-w-[120px] truncate text-sm font-medium text-foreground">{user?.name || 'User'}</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 sm:h-10 sm:w-10">
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
