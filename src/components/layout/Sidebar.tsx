'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore, useAuthStore, useSettingsStore } from '@/lib/store';
import { useTranslation } from '@/lib/useTranslation';
import {
    LayoutDashboard,
    TrendingUp,
    User,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Wallet,
    StickyNote,
    CalendarDays,
} from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    subItems?: { label: string; href: string; icon: React.ReactNode }[];
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        label: 'Investment',
        href: '/investments',
        icon: <TrendingUp className="w-5 h-5" />,
    },
    {
        label: 'Expense',
        href: '/expenses',
        icon: <Wallet className="w-5 h-5" />,
    },
    {
        label: 'Notes',
        href: '/notes',
        icon: <StickyNote className="w-5 h-5" />,
        subItems: [
            {
                label: 'Notes Dashboard',
                href: '/notes',
                icon: <StickyNote className="w-4 h-4" />,
            },
            {
                label: 'Calendar',
                href: '/notes/calendar',
                icon: <CalendarDays className="w-4 h-4" />,
            },
        ],
    }
];

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const { logout } = useAuthStore();
    const { enableInvestment, enableExpense } = useSettingsStore();
    const { t } = useTranslation();
    const [expandedMenu, setExpandedMenu] = useState<string | null>(
        pathname.startsWith('/notes') ? 'Notes' : null
    );

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const toggleExpand = (label: string) => {
        setExpandedMenu(prev => prev === label ? null : label);
    };

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen transition-[width,transform] duration-300 ease-in-out flex flex-col',
                'bg-card border-r border-border',
                sidebarOpen ? 'translate-x-0 w-20' : '-translate-x-full lg:translate-x-0',
                sidebarOpen ? 'lg:w-64' : 'lg:w-20'
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
                <div className={cn('flex items-center gap-3', 'justify-center w-full lg:justify-start', sidebarOpen && 'lg:w-auto')}>
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <StickyNote className="w-5 h-5 text-primary-foreground" />
                    </div>
                    {sidebarOpen && (
                        <span className="font-bold text-xl text-primary hidden lg:inline">
                            Memo
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    if (item.label === 'Investment' && !enableInvestment) return null;
                    if (item.label === 'Expense' && !enableExpense) return null;

                    let label = item.label;
                    if (item.label === 'Dashboard') label = t('common.dashboard');
                    if (item.label === 'Investment') label = t('common.investment');
                    if (item.label === 'Expense') label = t('common.expense');
                    if (item.label === 'Settings') label = t('common.settings');

                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isExpanded = expandedMenu === item.label;
                    const isActive = hasSubItems
                        ? pathname.startsWith(item.href)
                        : (item.href === '/dashboard' ? pathname === '/dashboard' : pathname === item.href || pathname.startsWith(item.href + '/'));

                    if (hasSubItems) {
                        return (
                            <div key={item.href}>
                                {/* Parent item */}
                                <button
                                    onClick={() => toggleExpand(item.label)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium',
                                        'transition-all duration-200 group',
                                        isActive
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'text-muted-foreground hover:bg-primary/5 hover:text-primary',
                                        'justify-center px-3 lg:justify-start lg:px-4',
                                        !sidebarOpen && 'lg:justify-center lg:px-3'
                                    )}
                                >
                                    <span className={cn('transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')}>
                                        {item.icon}
                                    </span>
                                    {sidebarOpen && (
                                        <>
                                            <span className="hidden lg:inline flex-1 text-left">{label}</span>
                                            <ChevronDown className={cn(
                                                "w-4 h-4 hidden lg:inline transition-transform duration-200",
                                                isExpanded && "rotate-180"
                                            )} />
                                        </>
                                    )}
                                </button>

                                {/* Sub-items */}
                                {isExpanded && sidebarOpen && (
                                    <div className="hidden lg:block mt-1 ml-4 pl-4 border-l-2 border-border/50 space-y-1">
                                        {item.subItems!.map((sub) => {
                                            const isSubActive = sub.href === '/notes'
                                                ? pathname === '/notes'
                                                : pathname === sub.href || pathname.startsWith(sub.href + '/');
                                            return (
                                                <Link
                                                    key={sub.href}
                                                    href={sub.href}
                                                    onClick={() => {
                                                        if (window.innerWidth < 1024 && sidebarOpen) toggleSidebar();
                                                    }}
                                                    className={cn(
                                                        'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                                        isSubActive
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                                                    )}
                                                >
                                                    {sub.icon}
                                                    <span>{sub.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                                if (window.innerWidth < 1024 && sidebarOpen) toggleSidebar();
                            }}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl font-medium',
                                'transition-all duration-200 group',
                                isActive
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-muted-foreground hover:bg-primary/5 hover:text-primary',
                                'justify-center px-3 lg:justify-start lg:px-4',
                                !sidebarOpen && 'lg:justify-center lg:px-3'
                            )}
                        >
                            <span className={cn('transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')}>
                                {item.icon}
                            </span>
                            {sidebarOpen && <span className="hidden lg:inline">{label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-border bg-transparent space-y-2">
                <Link
                    href="/settings"
                    onClick={() => {
                        if (window.innerWidth < 1024 && sidebarOpen) toggleSidebar();
                    }}
                    className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group',
                        pathname === '/settings'
                            ? 'bg-secondary text-secondary-foreground border border-border'
                            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                        'justify-center px-3 lg:justify-start lg:px-4',
                        !sidebarOpen && 'lg:justify-center lg:px-3'
                    )}
                >
                    <Settings className={cn("w-5 h-5 transition-colors", pathname === '/settings' ? "text-secondary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                    {sidebarOpen && <span className="hidden lg:inline">{t('common.settings')}</span>}
                </Link>


                <button
                    onClick={handleLogout}
                    className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium',
                        'text-rose-500 hover:bg-rose-500/10 transition-all duration-200',
                        'justify-center px-3 lg:justify-start lg:px-4',
                        !sidebarOpen && 'lg:justify-center lg:px-3'
                    )}
                >
                    <LogOut className="w-5 h-5" />
                    {sidebarOpen && <span className="hidden lg:inline">{t('common.logout')}</span>}
                </button>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={cn(
                    'hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2',
                    'w-8 h-8 rounded-full bg-card border border-border',
                    'items-center justify-center text-muted-foreground hover:text-primary',
                    'transition-all duration-200 shadow-md hover:shadow-lg z-50'
                )}
            >
                {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
        </aside>
    );
};

export default Sidebar;
