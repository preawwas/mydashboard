'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <DashboardOverview />
        </DashboardLayout>
    );
}
