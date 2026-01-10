'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore, useAuthStore } from '@/lib/store';
import {
    LayoutDashboard,
    TrendingUp,
    User,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
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
        href: '/dashboard/investments',
        icon: <TrendingUp className="w-5 h-5" />,
    },
    {
        label: 'Profile',
        href: '/dashboard/profile',
        icon: <User className="w-5 h-5" />,
    },
    {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: <Settings className="w-5 h-5" />,
    },
];

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const { logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200',
                'transition-all duration-300 ease-in-out',
                sidebarOpen ? 'w-64' : 'w-20'
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center w-full')}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    {sidebarOpen && (
                        <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            InvestPro
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 font-medium',
                                'transition-all duration-200 group',
                                isActive
                                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm'
                                    : 'hover:bg-gray-100 hover:text-gray-900',
                                !sidebarOpen && 'justify-center px-3'
                            )}
                        >
                            <span
                                className={cn(
                                    'transition-colors',
                                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                                )}
                            >
                                {item.icon}
                            </span>
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 font-medium',
                        'transition-all duration-200 hover:bg-red-50 hover:text-red-600 group',
                        !sidebarOpen && 'justify-center px-3'
                    )}
                >
                    <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                    {sidebarOpen && <span>Logout</span>}
                </button>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={cn(
                    'absolute -right-3 top-20 w-6 h-6 bg-white rounded-full border border-gray-200',
                    'flex items-center justify-center shadow-sm hover:shadow-md transition-shadow',
                    'text-gray-400 hover:text-gray-600'
                )}
            >
                {sidebarOpen ? (
                    <ChevronLeft className="w-4 h-4" />
                ) : (
                    <ChevronRight className="w-4 h-4" />
                )}
            </button>
        </aside>
    );
};

export default Sidebar;
