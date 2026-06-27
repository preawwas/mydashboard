'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { VocabularyReviewTable, VocabularySubNav } from '@/components/vocabulary';
import { useVocabulary, useVocabularySpeechUnlock } from '@/hooks';
import { useToastStore } from '@/lib/store';

export default function VocabularyReviewPage() {
    const { addToast } = useToastStore();
    useVocabularySpeechUnlock();
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
                        คลิกไอคอนลำโพง 🔊 หรือคำศัพท์เพื่อฟังเสียง (แนะนำ Chrome) — ไม่ต้องตั้งค่า macOS เพิ่ม
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
