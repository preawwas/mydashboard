'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Table } from '@/components/ui';
import { BookOpen, CheckCircle2, Clock3 } from 'lucide-react';
import { VOCABULARY_THEME as T } from '@/lib/vocabulary-theme';
import { VocabularyCategorySummaryRow, VocabularySummaryMetrics } from '@/types';

interface VocabularySummaryDashboardProps {
    metrics: VocabularySummaryMetrics;
    categories: VocabularyCategorySummaryRow[];
    loading: boolean;
}

function MetricCard({
    title,
    value,
    icon: Icon,
    accent,
}: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
}) {
    return (
        <Card className="border-none shadow-sm bg-white/90 overflow-hidden">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="mt-2 text-3xl font-black text-[#563526]">{value}</p>
                    </div>
                    <div
                        className="rounded-2xl p-3"
                        style={{ backgroundColor: `${accent}20`, color: accent }}
                    >
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function VocabularySummaryDashboard({
    metrics,
    categories,
    loading,
}: VocabularySummaryDashboardProps) {
    const columns = [
        {
            key: 'category_name',
            header: 'Category',
            render: (item: VocabularyCategorySummaryRow) => item.category_name,
        },
        {
            key: 'total',
            header: 'Total',
            render: (item: VocabularyCategorySummaryRow) => item.total,
        },
        {
            key: 'mastered',
            header: 'Mastered',
            render: (item: VocabularyCategorySummaryRow) => item.mastered,
        },
        {
            key: 'progress',
            header: 'Progress',
            render: (item: VocabularyCategorySummaryRow) => (
                <div className="min-w-[180px]">
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#563526]">
                        <span>{item.progress_percent}%</span>
                        <span>{item.mastered}/{item.total}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: T.surface }}>
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${item.progress_percent}%`,
                                background: `linear-gradient(to right, ${T.primary}, ${T.accentStrong})`,
                            }}
                        />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <MetricCard
                    title="Total Words"
                    value={metrics.totalWords}
                    icon={BookOpen}
                    accent={T.accentStrong}
                />
                <MetricCard
                    title="Mastered"
                    value={metrics.mastered}
                    icon={CheckCircle2}
                    accent="#10B981"
                />
                <MetricCard
                    title="Pending Review Today"
                    value={metrics.pendingReview}
                    icon={Clock3}
                    accent="#F59E0B"
                />
            </div>

            <Card className="border-none shadow-sm bg-white/90">
                <CardHeader>
                    <CardTitle className="text-[#563526]">Category Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table
                        data={categories}
                        columns={columns}
                        keyExtractor={(item) => item.category_id}
                        isLoading={loading}
                        emptyMessage="No categories yet"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
