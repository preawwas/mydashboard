'use client';

import React from 'react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Bell, Menu, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const Topbar: React.FC = () => {
    const { user } = useAuthStore();
    const { sidebarOpen, toggleSidebar } = useUIStore();

    return (
        <header
            className={cn(
                'fixed top-0 right-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200',
                'transition-all duration-300',
                sidebarOpen ? 'left-64' : 'left-20'
            )}
        >
            <div className="flex items-center justify-between h-full px-6">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Search */}
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl w-80">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ค้นหา..."
                            className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder-gray-400 flex-1"
                        />
                        <kbd className="hidden lg:inline-flex px-2 py-0.5 text-xs font-medium text-gray-400 bg-white rounded border">
                            ⌘K
                        </kbd>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500">{user?.role || 'user'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
