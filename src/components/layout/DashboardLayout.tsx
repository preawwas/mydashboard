'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { useAuthStore, useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Loading, Toast } from '@/components/ui';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const router = useRouter();
    const { user, token, isLoading, setLoading, isHydrated } = useAuthStore();
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Wait for hydration to complete
        if (!isHydrated) return;

        // Check authentication via Zustand store (persisted state)
        if (!token || !user) {
            router.push('/login');
            return;
        }
        setLoading(false);
    }, [router, setLoading, token, user, isHydrated]);

    if (!mounted || isLoading || !isHydrated) {
        return <Loading fullScreen text="กำลังโหลด..." />;
    }

    if (!user || !token) {
        return <Loading fullScreen text="กำลังดำเนินการ..." />;
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground">
            <Sidebar />
            <Topbar />

            {/* Mobile Dropdown Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 top-16 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => toggleSidebar()}
                />
            )}

            <main
                className={cn(
                    'pt-16 min-h-screen transition-[padding] duration-300 ease-in-out',
                    'pl-0 lg:pl-20',
                    sidebarOpen && 'lg:pl-64'
                )}
            >
                <div className="p-3 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
                    <ErrorBoundary>
                        <div className="animate-page-enter">
                            {children}
                        </div>
                    </ErrorBoundary>
                </div>
            </main>
            <Toast />
        </div>
    );
};

export default DashboardLayout;

