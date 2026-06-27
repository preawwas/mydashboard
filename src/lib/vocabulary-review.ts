import type { SupabaseClient } from '@supabase/supabase-js';
import {
    applyVocabularyReviewStep,
    buildVocabularyReviewState,
    computeVocabularyNextReviewDate,
    getVocabularyReview,
    type VocabularyReviewState,
} from '@/lib/vocabulary-helpers';

export async function advanceVocabularyReviewRecord(
    supabase: SupabaseClient,
    vocabularyId: string
) {
    const { data: current, error: fetchError } = await supabase
        .from('vocabulary_reviews')
        .select('review_count')
        .eq('vocabulary_id', vocabularyId)
        .single();

    if (fetchError) throw fetchError;

    const nextReview = applyVocabularyReviewStep(
        { review_count: Number(current.review_count), next_review_date: null, last_reviewed_at: null },
        Number(current.review_count) + 1
    );

    if (!nextReview) return null;

    const { data, error } = await supabase
        .from('vocabulary_reviews')
        .update({
            review_count: nextReview.review_count,
            last_reviewed_at: nextReview.last_reviewed_at,
            next_review_date: nextReview.next_review_date,
            updated_at: new Date().toISOString(),
        })
        .eq('vocabulary_id', vocabularyId)
        .select('review_count, next_review_date, last_reviewed_at')
        .single();

    if (error) throw error;
    return data;
}

export async function revertVocabularyReviewRecord(
    supabase: SupabaseClient,
    vocabularyId: string,
    step: number
) {
    const { data: current, error: fetchError } = await supabase
        .from('vocabulary_reviews')
        .select('review_count')
        .eq('vocabulary_id', vocabularyId)
        .single();

    if (fetchError) throw fetchError;

    const nextReview = applyVocabularyReviewStep(
        { review_count: Number(current.review_count), next_review_date: null, last_reviewed_at: null },
        step
    );

    if (!nextReview) return null;

    const { data, error } = await supabase
        .from('vocabulary_reviews')
        .update({
            review_count: nextReview.review_count,
            last_reviewed_at: nextReview.last_reviewed_at,
            next_review_date: nextReview.next_review_date,
            updated_at: new Date().toISOString(),
        })
        .eq('vocabulary_id', vocabularyId)
        .select('review_count, next_review_date, last_reviewed_at')
        .single();

    if (error) throw error;
    return data;
}

export async function toggleVocabularyReviewStep(
    supabase: SupabaseClient,
    vocabularyId: string,
    userId: string,
    step: number
): Promise<VocabularyReviewState | null> {
    const { data: existing, error: existingError } = await supabase
        .from('vocabularies')
        .select(`
            id,
            vocabulary_reviews (
                review_count,
                next_review_date,
                last_reviewed_at
            )
        `)
        .eq('id', vocabularyId)
        .eq('user_id', userId)
        .single();

    if (existingError || !existing) {
        return null;
    }

    const currentReview = getVocabularyReview(existing);
    const nextReview = applyVocabularyReviewStep(currentReview, step);
    if (!nextReview) return null;

    const { data, error } = await supabase
        .from('vocabulary_reviews')
        .update({
            review_count: nextReview.review_count,
            last_reviewed_at: nextReview.last_reviewed_at,
            next_review_date: nextReview.next_review_date,
            updated_at: new Date().toISOString(),
        })
        .eq('vocabulary_id', vocabularyId)
        .select('review_count, next_review_date, last_reviewed_at')
        .single();

    if (error) throw error;

    return {
        review_count: Number(data.review_count),
        next_review_date: data.next_review_date,
        last_reviewed_at: data.last_reviewed_at,
    };
}

export { buildVocabularyReviewState, computeVocabularyNextReviewDate };
