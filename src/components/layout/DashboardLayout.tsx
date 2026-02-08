'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStore, useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Loading, Toast } from '@/components/ui';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const router = useRouter();
    const { user, token, isLoading, setLoading } = useAuthStore();
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Check authentication
        const storedAuth = localStorage.getItem('auth-storage');
        if (storedAuth) {
            try {
                const parsed = JSON.parse(storedAuth);
                if (!parsed.state?.token || !parsed.state?.user) {
                    router.push('/login');
                    return;
                }
            } catch {
                router.push('/login');
                return;
            }
        } else {
            router.push('/login');
            return;
        }
        setLoading(false);
    }, [router, setLoading]);

    if (!mounted || isLoading) {
        return <Loading fullScreen text="กำลังโหลด..." />;
    }

    if (!user || !token) {
        return <Loading fullScreen text="กำลังดำเนินการ..." />;
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground">
            <Sidebar />
            <Topbar />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                    onClick={() => toggleSidebar()}
                />
            )}

            <main
                className={cn(
                    'pt-16 min-h-screen transition-[padding] duration-300 ease-in-out',
                    // On mobile (less than lg), padding left is 0. 
                    // On desktop (lg+), padding left follows sidebar state.
                    'pl-0 lg:pl-20',
                    sidebarOpen && 'lg:pl-64'
                )}
            >
                <div className="p-3 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">{children}</div>
            </main>
            <Toast />
        </div>
    );
};

export default DashboardLayout;

