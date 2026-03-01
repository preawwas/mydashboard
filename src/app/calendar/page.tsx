'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout';
import CalendarView from '@/components/calendar/CalendarView';

export default function CalendarPage() {
    return (
        <DashboardLayout>
            <CalendarView />
        </DashboardLayout>
    );
}
