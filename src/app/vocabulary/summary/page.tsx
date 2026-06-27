'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { VocabularySubNav, VocabularySummaryDashboard } from '@/components/vocabulary';
import { useVocabulary } from '@/hooks';

export default function VocabularySummaryPage() {
    const { metrics, categorySummary, loading, fetchSummary } = useVocabulary();

    useEffect(() => {
        void fetchSummary();
    }, [fetchSummary]);

    return (
        <DashboardLayout>
            <div className="space-y-2">
                <div>
                    <h1 className="text-2xl font-black text-[#563526]">Category Summary</h1>
                    <p className="text-sm text-muted-foreground">
                        Overview of total words, mastered items, and pending reviews.
                    </p>
                </div>
                <VocabularySubNav />
                <VocabularySummaryDashboard
                    metrics={metrics}
                    categories={categorySummary}
                    loading={loading}
                />
            </div>
        </DashboardLayout>
    );
}
