'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout';
import NoteDashboard from '@/components/notes/NoteDashboard';

export default function NotesPage() {
    return (
        <DashboardLayout>
            <NoteDashboard />
        </DashboardLayout>
    );
}
