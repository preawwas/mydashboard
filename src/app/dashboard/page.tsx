'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout';
import dynamic from 'next/dynamic';
import { DashboardSkeleton } from '@/components/ui';

// Lazy load heavy dashboard components (Recharts)
const DashboardOverview = dynamic(() => import('@/components/dashboard/DashboardOverview'), {
    ssr: false,
    loading: () => <DashboardSkeleton />,
});

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <DashboardOverview />
        </DashboardLayout>
    );
}
