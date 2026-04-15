'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import fluffyWordmarkImage from './image.png';
import { useUIStore, useAuthStore, useSettingsStore } from '@/lib/store';
import { useLoading } from '@/components/providers/LoadingProvider';
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
    Zap,
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
                label: 'Journey',
                href: '/notes',
                icon: <StickyNote className="w-4 h-4" />,
            },
            {
                label: 'Calendar',
                href: '/notes/calendar',
                icon: <CalendarDays className="w-4 h-4" />,
            },
            {
                label: 'Notes',
                href: '/notes/short-note',
                icon: <Zap className="w-4 h-4" />,
            },
        ],
    }
];

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const secretClickCount = useRef(0);
    const secretClickTimer = useRef<NodeJS.Timeout | null>(null);
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const { logout } = useAuthStore();
    const { enableInvestment, enableExpense } = useSettingsStore();
    const [expandedMenu, setExpandedMenu] = useState<string | null>(
        pathname.startsWith('/notes') ? 'Notes' : null
    );
    const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);
    const { handleAuthClick } = useLoading();

    // Close mobile submenu on route change
    React.useEffect(() => {
        setMobileSubmenuOpen(null);
    }, [pathname]);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const toggleExpand = (label: string) => {
        setExpandedMenu(prev => prev === label ? null : label);
    };

    const getLabel = (label: string, href: string) => {
        if (label === 'Dashboard') return 'Dashboard';
        if (label === 'Investment') return 'Investment';
        if (label === 'Expense') return 'Expense';
        if (label === 'Settings') return 'Settings';
        if (label === 'Notes' && href === '/notes') return 'Notes';
        if (label === 'Notes' && href === '/notes/short-note') return 'Notes';
        if (label === 'Journey') return 'Journey';
        if (label === 'Calendar') return 'Calendar';
        return label;
    };

    const isItemActive = (item: NavItem) => {
        const hasSubItems = item.subItems && item.subItems.length > 0;
        return hasSubItems
            ? pathname.startsWith(item.href)
            : (item.href === '/dashboard' ? pathname === '/dashboard' : pathname === item.href || pathname.startsWith(item.href + '/'));
    };

    // Shared nav item renderer
    const renderNavItem = (item: NavItem, isMobile: boolean) => {
        if (item.label === 'Investment' && !enableInvestment) return null;
        if (item.label === 'Expense' && !enableExpense) return null;

        const label = getLabel(item.label, item.href);
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isExpanded = expandedMenu === item.label;
        const isActive = isItemActive(item);

        if (hasSubItems) {
            return (
                <div key={item.href}>
                    <button
                        onClick={() => toggleExpand(item.label)}
                        aria-expanded={isExpanded}
                        aria-label={label}
                        className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium',
                            'transition-all duration-200 group',
                            isActive
                                ? 'bg-white/15 text-white border border-white/20'
                                : 'text-white/70 hover:bg-white/10 hover:text-white',
                            !isMobile && !sidebarOpen && 'md:justify-center md:px-3'
                        )}
                    >
                        <span className={cn('transition-colors', isActive ? 'text-white' : 'text-white/60 group-hover:text-white')}>
                            {item.icon}
                        </span>
                        {(isMobile || sidebarOpen) && (
                            <>
                                <span className="flex-1 text-left">{label}</span>
                                <ChevronDown className={cn(
                                    "w-4 h-4 transition-transform duration-200",
                                    isExpanded && "rotate-180"
                                )} aria-hidden="true" />
                            </>
                        )}
                    </button>

                    {isExpanded && (isMobile || sidebarOpen) && (
                        <div className={cn("mt-1 space-y-1", isMobile ? "ml-6 pl-3 border-l-2 border-white/20" : "ml-4 pl-4 border-l-2 border-white/20")}>
                            {item.subItems!.map((sub) => {
                                const isSubActive = sub.href === '/notes'
                                    ? pathname === '/notes'
                                    : pathname === sub.href || pathname.startsWith(sub.href + '/');
                                return (
                                    <Link
                                        key={sub.href}
                                        href={sub.href}
                                        aria-current={isSubActive ? 'page' : undefined}
                                        onClick={() => {
                                            if (isMobile) toggleSidebar();
                                        }}
                                        className={cn(
                                            'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                            isSubActive
                                                ? 'bg-white/15 text-white'
                                                : 'text-white/65 hover:bg-white/10 hover:text-white'
                                        )}
                                    >
                                        {sub.icon}
                                        <span>{getLabel(sub.label, sub.href)}</span>
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
                aria-current={isActive ? 'page' : undefined}
                aria-label={label}
                onClick={() => {
                    if (isMobile) toggleSidebar();
                }}
                className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl font-medium',
                    'transition-all duration-200 group',
                    isActive
                        ? 'bg-white/15 text-white border border-white/20'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    !isMobile && 'justify-center px-3 md:justify-start md:px-4',
                    !isMobile && !sidebarOpen && 'md:justify-center md:px-3'
                )}
            >
                <span className={cn('transition-colors', isActive ? 'text-white' : 'text-white/60 group-hover:text-white')}>
                    {item.icon}
                </span>
                {(isMobile || sidebarOpen) && <span className={cn(!isMobile && "hidden md:inline")}>{label}</span>}
            </Link>
        );
    };

    // Filter nav items based on settings for bottom nav
    const visibleNavItems = navItems.filter(item => {
        if (item.label === 'Investment' && !enableInvestment) return false;
        if (item.label === 'Expense' && !enableExpense) return false;
        return true;
    });

    return (
        <>
            {/* ==================== MOBILE (≤768px): Bottom Navigation Bar ==================== */}
            <nav
                className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="relative bg-[#0C2B2C]/97 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
                    {/* Mobile submenu popup */}
                    {mobileSubmenuOpen && (() => {
                        const parentItem = visibleNavItems.find(i => i.label === mobileSubmenuOpen);
                        if (!parentItem?.subItems) return null;
                        return (
                            <div
                                className="absolute left-0 right-0 bottom-full bg-[#0C2B2C]/97 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-2 duration-200"
                            >
                                <div className="flex items-center justify-center gap-2 px-4 py-3">
                                    {parentItem.subItems.map((sub) => {
                                        const isSubActive = sub.href === '/notes'
                                            ? pathname === '/notes'
                                            : pathname === sub.href || pathname.startsWith(sub.href + '/');
                                        return (
                                            <Link
                                                key={sub.href}
                                                href={sub.href}
                                                onClick={() => setMobileSubmenuOpen(null)}
                                                className={cn(
                                                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px]',
                                                    isSubActive
                                                        ? 'bg-white/15 text-white border border-white/20'
                                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                )}
                                            >
                                                {sub.icon}
                                                <span>{getLabel(sub.label, sub.href)}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}
                    {/* Backdrop to close submenu */}
                    {mobileSubmenuOpen && (
                        <div
                            className="fixed inset-0 z-[-1]"
                            onClick={() => setMobileSubmenuOpen(null)}
                            onTouchEnd={() => setMobileSubmenuOpen(null)}
                        />
                    )}
                    <div className="flex items-center justify-around h-14 min-h-[56px]">
                        {visibleNavItems.map((item) => {
                            const isActive = isItemActive(item);
                            const label = getLabel(item.label, item.href);
                            const hasSubItems = item.subItems && item.subItems.length > 0;
                            const isSubmenuOpen = mobileSubmenuOpen === item.label;

                            if (hasSubItems) {
                                return (
                                    <button
                                        key={item.href}
                                        onClick={() => setMobileSubmenuOpen(prev => prev === item.label ? null : item.label)}
                                        className={cn(
                                            'flex flex-col items-center justify-center gap-0.5 px-1 py-1 min-w-[48px] min-h-[44px] transition-all duration-200',
                                            isActive || isSubmenuOpen
                                                ? 'text-white'
                                                : 'text-white/50 active:text-white/80'
                                        )}
                                    >
                                        <span className={cn(
                                            'transition-all duration-200',
                                            isActive || isSubmenuOpen ? 'scale-110' : 'scale-100'
                                        )}>
                                            {item.icon}
                                        </span>
                                        <span className="text-[10px] font-medium leading-tight truncate max-w-[64px]">{label}</span>
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    onClick={() => setMobileSubmenuOpen(null)}
                                    className={cn(
                                        'flex flex-col items-center justify-center gap-0.5 px-1 py-1 min-w-[48px] min-h-[44px] transition-all duration-200',
                                        isActive
                                            ? 'text-white'
                                            : 'text-white/50 active:text-white/80'
                                    )}
                                >
                                    <span className={cn(
                                        'transition-all duration-200',
                                        isActive ? 'scale-110' : 'scale-100'
                                    )}>
                                        {item.icon}
                                    </span>
                                    <span className="text-[10px] font-medium leading-tight truncate max-w-[64px]">{label}</span>
                                </Link>
                            );
                        })}
                        <Link
                            href="/settings"
                            aria-current={pathname === '/settings' ? 'page' : undefined}
                            className={cn(
                                'flex flex-col items-center justify-center gap-0.5 px-1 py-1 min-w-[48px] min-h-[44px] transition-all duration-200',
                                pathname === '/settings'
                                    ? 'text-white'
                                    : 'text-white/50 active:text-white/80'
                            )}
                        >
                            <span className={cn(
                                'transition-all duration-200',
                                pathname === '/settings' ? 'scale-110' : 'scale-100'
                            )}>
                                <Settings className="w-5 h-5" />
                            </span>
                            <span className="text-[10px] font-medium leading-tight">Settings</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ==================== TABLET (768-1023px): Top Dropdown ==================== */}
            <div
                className={cn(
                    'fixed left-0 right-0 top-16 z-40 hidden',
                    'bg-[#0C2B2C]/97 backdrop-blur-xl border-b border-white/10 shadow-2xl',
                    'transition-all duration-300 ease-in-out overflow-hidden',
                    sidebarOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                )}
            >
                <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(80vh-80px)]">
                    {navItems.map((item) => renderNavItem(item, true))}
                </nav>

                {/* Bottom actions */}
                <div className="p-4 border-t border-white/10 flex items-center gap-2">
                    <Link
                        href="/settings"
                        onClick={() => toggleSidebar()}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200',
                            pathname === '/settings'
                                ? 'bg-white/15 text-white border border-white/20'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                        )}
                    >
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                    </Link>
                    <button
                        onClick={() => { toggleSidebar(); handleLogout(); }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-[#FF9B8A] hover:bg-white/10 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* ==================== DESKTOP (≥1024px): Side Panel ==================== */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-40 h-screen transition-[width] duration-300 ease-in-out flex-col',
                    'bg-gradient-to-b from-[#0C2B2C] via-[#133B3C] to-[#1A4749]',
                    'hidden md:flex',
                    sidebarOpen ? 'md:w-64' : 'md:w-20'
                )}
            >
                {/* Logo */}
                <div className="h-20 flex items-center justify-center px-4 border-b border-white/10 shrink-0">
                    <div className={cn('flex items-center justify-center')}>
                        {sidebarOpen && (
                            <button
                                type="button"
                                className="hidden md:inline select-none transition-all duration-300 focus:outline-none"
                                onClick={() => {
                                    secretClickCount.current += 1;
                                    if (secretClickTimer.current) clearTimeout(secretClickTimer.current);
                                    secretClickTimer.current = setTimeout(() => { secretClickCount.current = 0; }, 2000);
                                    if (secretClickCount.current >= 5) {
                                        secretClickCount.current = 0;
                                        router.push('/forpreaw');
                                    }
                                }}
                                aria-label="Fluffy-ty"
                            >
                                <Image
                                    src={fluffyWordmarkImage}
                                    alt="Fluffy-ty"
                                    priority
                                    width={180}
                                    height={56}
                                    className="h-auto max-h-[56px] w-auto max-w-[180px] rounded-xl drop-shadow-[0_10px_24px_rgba(0,0,0,0.2)] object-contain"
                                />
                            </button>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => renderNavItem(item, false))}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-white/10 bg-transparent space-y-2">
                    <Link
                        href="/settings"
                        className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group',
                            pathname === '/settings'
                                ? 'bg-white/15 text-white border border-white/20'
                                : 'text-white/70 hover:bg-white/10 hover:text-white',
                            'justify-center px-3 md:justify-start md:px-4',
                            !sidebarOpen && 'md:justify-center md:px-3'
                        )}
                    >
                        <Settings className={cn("w-5 h-5 transition-colors", pathname === '/settings' ? "text-white" : "text-white/60 group-hover:text-white")} />
                        {sidebarOpen && <span className="hidden md:inline">Settings</span>}
                    </Link>

                    <button
                        onClick={handleLogout}
                        className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium',
                            'text-[#FF9B8A] hover:bg-white/10 transition-all duration-200',
                            'justify-center px-3 md:justify-start md:px-4',
                            !sidebarOpen && 'md:justify-center md:px-3'
                        )}
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span className="hidden md:inline">Logout</span>}
                    </button>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    aria-label={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                    className={cn(
                        'hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2',
                        'w-8 h-8 rounded-full bg-[#1A4749] border border-white/20',
                        'items-center justify-center text-white/60 hover:text-white',
                        'transition-all duration-200 shadow-md hover:shadow-lg z-50'
                    )}
                >
                    {sidebarOpen ? <ChevronLeft className="w-4 h-4" aria-hidden="true" /> : <ChevronRight className="w-4 h-4" aria-hidden="true" />}
                </button>
            </aside>
        </>
    );
};

export default Sidebar;

