'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { VocabularyReviewTable, VocabularySubNav } from '@/components/vocabulary';
import { useVocabulary } from '@/hooks';
import { useToastStore } from '@/lib/store';

export default function VocabularyReviewPage() {
    const { addToast } = useToastStore();
    const {
        entries,
        categories,
        loading,
        filter,
        categoryId,
        setFilter,
        setCategoryId,
        fetchEntries,
        toggleFavorite,
        toggleReview,
        updateEntry,
        deleteEntry,
    } = useVocabulary();

    useEffect(() => {
        void fetchEntries(filter, categoryId);
    }, [fetchEntries, filter, categoryId]);

    const handleToggleReview = async (id: string, step: number) => {
        try {
            await toggleReview(id, step);
        } catch (error) {
            addToast(
                error instanceof Error ? error.message : 'Review update failed',
                'error'
            );
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-2">
                <div>
                    <h1 className="text-2xl font-black text-[#563526]">Vocabulary Review</h1>
                    <p className="text-sm text-muted-foreground">
                        Track 5-round reviews, favorites, and inline edits.
                    </p>
                </div>
                <VocabularySubNav />
                <VocabularyReviewTable
                    entries={entries}
                    categories={categories}
                    loading={loading}
                    filter={filter}
                    categoryId={categoryId}
                    onFilterChange={setFilter}
                    onCategoryChange={setCategoryId}
                    onToggleFavorite={toggleFavorite}
                    onToggleReview={handleToggleReview}
                    onUpdate={updateEntry}
                    onDelete={deleteEntry}
                />
            </div>
        </DashboardLayout>
    );
}
