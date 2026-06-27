'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { applyVocabularyReviewStep, getVocabularyReview } from '@/lib/vocabulary-helpers';
import {
    ApiResponse,
    VocabularyCategory,
    VocabularyCategorySummaryRow,
    VocabularyEntry,
    VocabularyFormData,
    VocabularySummaryMetrics,
} from '@/types';

export type VocabularyFilter = 'all' | 'due_today' | 'favorite' | 'mastered';

export function useVocabulary() {
    const [entries, setEntries] = useState<VocabularyEntry[]>([]);
    const [recentEntries, setRecentEntries] = useState<VocabularyEntry[]>([]);
    const [categories, setCategories] = useState<VocabularyCategory[]>([]);
    const [metrics, setMetrics] = useState<VocabularySummaryMetrics>({
        totalWords: 0,
        mastered: 0,
        pendingReview: 0,
    });
    const [categorySummary, setCategorySummary] = useState<VocabularyCategorySummaryRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState<VocabularyFilter>('all');
    const [categoryId, setCategoryId] = useState<string>('');

    const fetchCategories = useCallback(async () => {
        const response = await apiClient.fetch('/api/vocabulary/categories');
        const json: ApiResponse<VocabularyCategory[]> = await response.json();
        if (json.success && json.data) {
            setCategories(json.data);
        }
    }, []);

    const fetchEntries = useCallback(async (nextFilter: VocabularyFilter, nextCategoryId: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (nextFilter !== 'all') params.set('filter', nextFilter);
            if (nextCategoryId) params.set('category_id', nextCategoryId);

            const response = await apiClient.fetch(`/api/vocabulary?${params.toString()}`);
            const json: ApiResponse<VocabularyEntry[]> = await response.json();
            if (json.success && json.data) {
                setEntries(json.data);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRecentEntries = useCallback(async () => {
        const response = await apiClient.fetch('/api/vocabulary?filter=recent&limit=10');
        const json: ApiResponse<VocabularyEntry[]> = await response.json();
        if (json.success && json.data) {
            setRecentEntries(json.data);
        }
    }, []);

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.fetch('/api/vocabulary/summary');
            const json: ApiResponse<{
                metrics: VocabularySummaryMetrics;
                categories: VocabularyCategorySummaryRow[];
            }> = await response.json();

            if (json.success && json.data) {
                setMetrics(json.data.metrics);
                setCategorySummary(json.data.categories);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const createEntry = useCallback(async (form: VocabularyFormData) => {
        setSaving(true);
        try {
            const response = await apiClient.fetch('/api/vocabulary', {
                method: 'POST',
                body: JSON.stringify({
                    categoryName: form.categoryName,
                    languageCode: form.languageCode,
                    word: form.word,
                    pronunciation: form.pronunciation,
                    meaning: form.meaning,
                    remarks: form.remarks,
                }),
            });
            const json: ApiResponse<VocabularyEntry> = await response.json();
            if (!json.success) {
                throw new Error(json.error || 'Failed to create vocabulary');
            }
            await Promise.all([fetchRecentEntries(), fetchCategories()]);
            return json.data;
        } finally {
            setSaving(false);
        }
    }, [fetchCategories, fetchRecentEntries]);

    const importRows = useCallback(async (
        rows: Array<{
            category: string;
            language_code: string;
            word: string;
            pronunciation: string;
            meaning: string;
            remarks: string;
        }>
    ) => {
        setSaving(true);
        try {
            const response = await apiClient.fetch('/api/vocabulary/import', {
                method: 'POST',
                body: JSON.stringify({ rows }),
            });
            const json: ApiResponse<{
                createdCount: number;
                rows: VocabularyEntry[];
                errors: string[];
            }> = await response.json();

            if (!json.success) {
                throw new Error(json.error || 'Import failed');
            }

            await Promise.all([fetchRecentEntries(), fetchCategories()]);
            return json.data;
        } finally {
            setSaving(false);
        }
    }, [fetchCategories, fetchRecentEntries]);

    const updateEntry = useCallback(async (id: string, payload: Record<string, unknown>) => {
        const response = await apiClient.fetch(`/api/vocabulary/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
        const json: ApiResponse<VocabularyEntry> = await response.json();
        if (!json.success || !json.data) {
            throw new Error(json.error || 'Update failed');
        }

        setEntries((prev) => prev.map((item) => (item.id === id ? json.data! : item)));
        setRecentEntries((prev) => prev.map((item) => (item.id === id ? json.data! : item)));
        return json.data;
    }, []);

    const deleteEntry = useCallback(async (id: string) => {
        const response = await apiClient.fetch(`/api/vocabulary/${id}`, { method: 'DELETE' });
        const json: ApiResponse<null> = await response.json();
        if (!json.success) {
            throw new Error(json.error || 'Delete failed');
        }
        setEntries((prev) => prev.filter((item) => item.id !== id));
        setRecentEntries((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const toggleFavorite = useCallback(async (entry: VocabularyEntry) => {
        return updateEntry(entry.id, { is_favorite: !entry.is_favorite });
    }, [updateEntry]);

    const toggleReview = useCallback(async (id: string, step: number) => {
        let previousEntry: VocabularyEntry | undefined;

        setEntries((prev) => {
            previousEntry = prev.find((item) => item.id === id);
            return prev.map((item) => {
                if (item.id !== id) return item;

                const nextReview = applyVocabularyReviewStep(getVocabularyReview(item), step);
                if (!nextReview) return item;

                return {
                    ...item,
                    vocabulary_reviews: nextReview,
                };
            });
        });

        try {
            const response = await apiClient.fetch(`/api/vocabulary/${id}/review`, {
                method: 'POST',
                body: JSON.stringify({ step }),
            });
            const json: ApiResponse<null> & {
                review?: VocabularyEntry['vocabulary_reviews'];
            } = await response.json();

            if (!json.success || !json.review) {
                throw new Error(json.error || 'Review update failed');
            }

            setEntries((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, vocabulary_reviews: json.review! } : item
                )
            );

            return json.review;
        } catch (error) {
            if (previousEntry) {
                setEntries((prev) =>
                    prev.map((item) => (item.id === id ? previousEntry! : item))
                );
            }
            throw error;
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        entries,
        recentEntries,
        categories,
        metrics,
        categorySummary,
        loading,
        saving,
        filter,
        categoryId,
        setFilter,
        setCategoryId,
        fetchEntries,
        fetchRecentEntries,
        fetchSummary,
        createEntry,
        importRows,
        updateEntry,
        deleteEntry,
        toggleFavorite,
        toggleReview,
    };
}
