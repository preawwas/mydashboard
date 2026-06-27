import type { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export interface CreateVocabularyInput {
    categoryName: string;
    languageCode: string;
    word: string;
    pronunciation?: string | null;
    meaning: string;
    remarks?: string | null;
    importBatchId?: string | null;
}

export async function resolveVocabularyCategoryId(
    supabase: SupabaseClient,
    userId: string,
    categoryName: string
): Promise<string | null> {
    const name = categoryName.trim() || 'General';

    const { data: existing, error: findError } = await supabase
        .from('vocabulary_categories')
        .select('category_id')
        .eq('user_id', userId)
        .eq('name', name)
        .maybeSingle();

    if (findError) throw findError;
    if (existing?.category_id) return existing.category_id;

    const { data: created, error: createError } = await supabase
        .from('vocabulary_categories')
        .insert({ user_id: userId, name })
        .select('category_id')
        .single();

    if (createError) throw createError;
    return created.category_id;
}

export async function createVocabularyEntry(
    supabase: SupabaseClient,
    userId: string,
    input: CreateVocabularyInput
) {
    const categoryId = await resolveVocabularyCategoryId(supabase, userId, input.categoryName);

    const { data: vocabulary, error: vocabularyError } = await supabase
        .from('vocabularies')
        .insert({
            user_id: userId,
            category_id: categoryId,
            import_batch_id: input.importBatchId ?? null,
        })
        .select('id')
        .single();

    if (vocabularyError) throw vocabularyError;

    const { error: translationError } = await supabase
        .from('vocabulary_translations')
        .insert({
            vocabulary_id: vocabulary.id,
            language_code: input.languageCode.toLowerCase(),
            word: input.word.trim(),
            pronunciation: input.pronunciation?.trim() || null,
            meaning: input.meaning.trim(),
            remarks: input.remarks?.trim() || null,
        });

    if (translationError) throw translationError;

    const { error: reviewError } = await supabase
        .from('vocabulary_reviews')
        .insert({
            vocabulary_id: vocabulary.id,
            review_count: 0,
            next_review_date: new Date().toISOString().slice(0, 10),
        });

    if (reviewError) throw reviewError;

    return vocabulary.id;
}

export async function fetchVocabularyById(
    supabase: SupabaseClient,
    userId: string,
    vocabularyId: string
) {
    const { data, error } = await supabase
        .from('vocabularies')
        .select(`
            id,
            user_id,
            category_id,
            is_favorite,
            import_batch_id,
            created_at,
            updated_at,
            vocabulary_categories ( category_id, name ),
            vocabulary_translations (
                id,
                language_code,
                word,
                pronunciation,
                meaning,
                remarks
            ),
            vocabulary_reviews (
                review_count,
                next_review_date,
                last_reviewed_at
            )
        `)
        .eq('id', vocabularyId)
        .eq('user_id', userId)
        .single();

    if (error) throw error;
    return data;
}

export function createImportBatchId() {
    return randomUUID();
}
