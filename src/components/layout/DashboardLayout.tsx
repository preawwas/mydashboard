'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStore, useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Loading } from '@/components/ui';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const router = useRouter();
    const { user, token, isLoading, setLoading } = useAuthStore();
    const { sidebarOpen } = useUIStore();
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
        return <Loading fullScreen text="กำลังตรวจสอบสิทธิ์..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Topbar />
            <main
                className={cn(
                    'pt-16 min-h-screen transition-all duration-300',
                    sidebarOpen ? 'pl-64' : 'pl-20'
                )}
            >
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
};

export default DashboardLayout;
