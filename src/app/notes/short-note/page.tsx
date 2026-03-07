'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout';
import ShortNoteDashboard from '@/components/notes/ShortNoteDashboard';

export default function ShortNotePage() {
    return (
        <DashboardLayout>
            <ShortNoteDashboard />
        </DashboardLayout>
    );
}
