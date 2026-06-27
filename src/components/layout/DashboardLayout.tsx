'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { useAuthStore } from '@/lib/store';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import QuickNoteFloatingButton from '@/components/notes/QuickNoteFloatingButton';
import { Loading, Toast } from '@/components/ui';
import { getNavSurfaceTint } from './nav-tabs';
import { useFeatureModeGuard } from './useFeatureModeGuard';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, token, isLoading, setLoading, isHydrated } = useAuthStore();
    const featureFlags = useFeatureFlags();
    const [mounted, setMounted] = useState(false);
    const surfaceTint = getNavSurfaceTint(pathname);

    useFeatureModeGuard();

    useEffect(() => {
        setMounted(true);

        if (!isHydrated) return;

        if (!token || !user) {
            router.push('/login');
            return;
        }
        setLoading(false);
    }, [router, setLoading, token, user, isHydrated]);

    if (!mounted || isLoading || !isHydrated) {
        return <Loading fullScreen text="Loading..." />;
    }

    if (!user || !token) {
        return <Loading fullScreen text="Processing..." />;
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground">
            <Topbar />
            <Sidebar />

            <main
                className="min-h-screen pt-[7.25rem] md:pt-[7.75rem] transition-colors duration-300"
                style={{ backgroundColor: surfaceTint }}
            >
                <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
                    <ErrorBoundary>
                        <div className="animate-page-enter">
                            {children}
                        </div>
                    </ErrorBoundary>
                </div>
            </main>
            <Toast />
            {featureFlags.quickNotes && <QuickNoteFloatingButton />}
        </div>
    );
};

export default DashboardLayout;
