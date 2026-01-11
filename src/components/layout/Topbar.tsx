'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const Topbar: React.FC = () => {
    const { user } = useAuthStore();
    const { sidebarOpen, toggleSidebar } = useUIStore();


    return (
        <header
            className={cn(
                'fixed top-0 right-0 z-30 h-16 border-b border-[#2E2C24]',
                'bg-[#0F0F0C]/80 backdrop-blur-md',
                'transition-all duration-300',
                sidebarOpen ? 'left-64' : 'left-20'
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
                    <button className="relative p-2 text-[#A1A1AA] hover:text-[#F5C542] hover:bg-[#1C1B16] rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0F0F0C]" />
                    </button>

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
