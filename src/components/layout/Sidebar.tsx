'use client';

import React from 'react';
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
    Wallet,
} from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
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
    }
];

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const { logout } = useAuthStore();
    const { enableInvestment, enableExpense } = useSettingsStore();
    const { t } = useTranslation();

    // Hydration fix
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen bg-[#0F0F0C] border-r border-[#2E2C24]',
                'transition-[width,transform] duration-300 ease-in-out flex flex-col',
                // Mobile behavior: slide in from left
                sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                // Desktop behavior: dynamic width
                sidebarOpen ? 'w-64' : 'lg:w-20'
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-[#2E2C24] shrink-0">
                <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center w-full')}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5C542] to-[#FFC83D] flex items-center justify-center shadow-lg shadow-[#F5C542]/20">
                        <TrendingUp className="w-5 h-5 text-[#15140F]" />
                    </div>
                    {sidebarOpen && (
                        <span className="font-bold text-xl bg-gradient-to-r from-[#F5C542] to-[#FFD54F] bg-clip-text text-transparent">
                            Memo
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {mounted && navItems.map((item) => {
                    // Feature Toggle Logic
                    if (item.label === 'Investment' && !enableInvestment) return null;
                    if (item.label === 'Expense' && !enableExpense) return null;

                    // Translate Label
                    let label = item.label;
                    if (item.label === 'Dashboard') label = t('common.dashboard');
                    if (item.label === 'Investment') label = t('common.investment');
                    if (item.label === 'Expense') label = t('common.expense');
                    if (item.label === 'Settings') label = t('common.settings');

                    const isActive = item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl font-medium',
                                'transition-all duration-200 group',
                                isActive
                                    ? 'bg-[#1C1B16] text-[#F5C542] shadow-md shadow-black/20 border border-[#2E2C24]'
                                    : 'text-[#A1A1AA] hover:bg-[#1C1B16] hover:text-[#FAFAFA]',
                                !sidebarOpen && 'justify-center px-3'
                            )}
                        >
                            <span
                                className={cn(
                                    'transition-colors',
                                    isActive ? 'text-[#F5C542]' : 'text-[#71717A] group-hover:text-[#FAFAFA]'
                                )}
                            >
                                {item.icon}
                            </span>
                            {sidebarOpen && <span>{label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-[#2E2C24] bg-[#0F0F0C] space-y-2">
                {/* Settings Link */}
                <Link
                    href="/settings"
                    className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group',
                        pathname === '/settings'
                            ? 'bg-[#2E2C24] text-[#FAFAFA] border border-[#3E3C32]'
                            : 'text-[#A1A1AA] hover:bg-[#1C1B16] hover:text-[#FAFAFA]',
                        !sidebarOpen && 'justify-center px-3'
                    )}
                >
                    <Settings className={cn(
                        "w-5 h-5 transition-colors",
                        pathname === '/settings' ? "text-[#FAFAFA]" : "text-[#71717A] group-hover:text-[#FAFAFA]"
                    )} />
                    {sidebarOpen && <span>{t('common.settings')}</span>}
                </Link>

                <button
                    onClick={handleLogout}
                    className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium',
                        'transition-all duration-200 text-[#A1A1AA] hover:bg-red-900/10 hover:text-red-500 group',
                        !sidebarOpen && 'justify-center px-3'
                    )}
                >
                    <LogOut className="w-5 h-5 text-[#71717A] group-hover:text-red-500 transition-colors" />
                    {sidebarOpen && <span>{t('common.logout')}</span>}
                </button>

                <div className={cn(
                    "text-xs text-[#71717A] px-4 font-mono",
                    !sidebarOpen && "hidden"
                )}>
                    v2.0.0
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={cn(
                    'absolute -right-3 top-20 w-6 h-6 bg-[#2E2C24] rounded-full border border-[#1C1B16]',
                    'items-center justify-center shadow-md hover:shadow-lg transition-shadow',
                    'text-[#A1A1AA] hover:text-[#FAFAFA]',
                    'hidden lg:flex'
                )}
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
                {sidebarOpen ? (
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                ) : (
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                )}
            </button>
        </aside>
    );
};

export default Sidebar;
