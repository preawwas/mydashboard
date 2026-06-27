import type { SupabaseClient } from '@supabase/supabase-js';

function computeNextReviewDate(reviewCount: number): string | null {
    if (reviewCount >= 5) return null;
    if (reviewCount <= 0) return new Date().toISOString().slice(0, 10);

    const offsets: Record<number, number> = {
        1: 1,
        2: 2,
        3: 4,
        4: 7,
    };

    const addDays = offsets[reviewCount];
    if (!addDays) return null;

    const date = new Date();
    date.setDate(date.getDate() + addDays);
    return date.toISOString().slice(0, 10);
}

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

    const currentCount = Number(current.review_count);
    if (!Number.isFinite(currentCount) || currentCount >= 5) {
        return null;
    }

    const newCount = Math.min(currentCount + 1, 5);

    const { data, error } = await supabase
        .from('vocabulary_reviews')
        .update({
            review_count: newCount,
            last_reviewed_at: new Date().toISOString(),
            next_review_date: computeNextReviewDate(newCount),
            updated_at: new Date().toISOString(),
        })
        .eq('vocabulary_id', vocabularyId)
        .select()
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

    const currentCount = Number(current.review_count);
    if (!Number.isFinite(currentCount) || step > currentCount || step < 1) {
        return null;
    }

    const newCount = step - 1;

    const { data, error } = await supabase
        .from('vocabulary_reviews')
        .update({
            review_count: newCount,
            last_reviewed_at: newCount > 0 ? new Date().toISOString() : null,
            next_review_date: computeNextReviewDate(newCount),
            updated_at: new Date().toISOString(),
        })
        .eq('vocabulary_id', vocabularyId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function toggleVocabularyReviewStep(
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

    const currentCount = Number(current.review_count);
    if (!Number.isFinite(currentCount)) return null;

    if (step <= currentCount) {
        return revertVocabularyReviewRecord(supabase, vocabularyId, step);
    }

    if (step === currentCount + 1 && currentCount < 5) {
        return advanceVocabularyReviewRecord(supabase, vocabularyId);
    }

    return null;
}
