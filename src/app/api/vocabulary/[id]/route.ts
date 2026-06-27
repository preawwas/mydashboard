import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser } from '@/types';
import { fetchVocabularyById, resolveVocabularyCategoryId } from '@/lib/vocabulary-service';

export const GET = withAuth(async (
    _request: NextRequest,
    user: AuthUser,
    context: unknown
) => {
    try {
        const { id } = await (context as { params: Promise<{ id: string }> }).params;
        const supabase = createSupabaseAdminClient();
        const data = await fetchVocabularyById(supabase, user.id, id);
        return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 404 });
    }
});

export const PATCH = withAuth(async (
    request: NextRequest,
    user: AuthUser,
    context: unknown
) => {
    try {
        const { id } = await (context as { params: Promise<{ id: string }> }).params;
        const supabase = createSupabaseAdminClient();
        const body = await request.json();

        const { data: existing, error: existingError } = await supabase
            .from('vocabularies')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (existingError || !existing) {
            return NextResponse.json({ success: false, error: 'Vocabulary not found' }, { status: 404 });
        }

        const vocabularyUpdates: Record<string, unknown> = {};
        if (typeof body.is_favorite === 'boolean') {
            vocabularyUpdates.is_favorite = body.is_favorite;
        }

        if (body.categoryName || body.category_name) {
            const categoryId = await resolveVocabularyCategoryId(
                supabase,
                user.id,
                body.categoryName || body.category_name
            );
            vocabularyUpdates.category_id = categoryId;
        }

        if (Object.keys(vocabularyUpdates).length > 0) {
            const { error: vocabError } = await supabase
                .from('vocabularies')
                .update(vocabularyUpdates)
                .eq('id', id)
                .eq('user_id', user.id);

            if (vocabError) {
                return NextResponse.json({ success: false, error: vocabError.message }, { status: 500 });
            }
        }

        const translationUpdates: Record<string, unknown> = {};
        if (body.languageCode || body.language_code) {
            translationUpdates.language_code = (body.languageCode || body.language_code).toLowerCase();
        }
        if (body.word !== undefined) translationUpdates.word = body.word;
        if (body.pronunciation !== undefined) translationUpdates.pronunciation = body.pronunciation || null;
        if (body.meaning !== undefined) translationUpdates.meaning = body.meaning;
        if (body.remarks !== undefined) translationUpdates.remarks = body.remarks || null;

        if (Object.keys(translationUpdates).length > 0) {
            const { error: translationError } = await supabase
                .from('vocabulary_translations')
                .update(translationUpdates)
                .eq('vocabulary_id', id);

            if (translationError) {
                return NextResponse.json({ success: false, error: translationError.message }, { status: 500 });
            }
        }

        const data = await fetchVocabularyById(supabase, user.id, id);
        return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});

export const DELETE = withAuth(async (
    _request: NextRequest,
    user: AuthUser,
    context: unknown
) => {
    try {
        const { id } = await (context as { params: Promise<{ id: string }> }).params;
        const supabase = createSupabaseAdminClient();

        const { error } = await supabase
            .from('vocabularies')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});
