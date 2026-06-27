import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser } from '@/types';
import { createVocabularyEntry, fetchVocabularyById } from '@/lib/vocabulary-service';

const VOCABULARY_SELECT = `
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
`;

export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter');
        const categoryId = searchParams.get('category_id');
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? Number(limitParam) : null;
        const today = new Date().toISOString().slice(0, 10);

        let query = supabase
            .from('vocabularies')
            .select(VOCABULARY_SELECT)
            .eq('user_id', user.id);

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        if (filter === 'favorite') {
            query = query.eq('is_favorite', true);
        }

        if (filter === 'recent') {
            query = query.order('created_at', { ascending: false });
            if (limit) query = query.limit(limit);
        } else if (filter === 'due_today') {
            query = query
                .order('created_at', { ascending: false })
                .filter('vocabulary_reviews.review_count', 'lt', 5)
                .filter('vocabulary_reviews.next_review_date', 'lte', today);
        } else if (filter === 'mastered') {
            query = query.filter('vocabulary_reviews.review_count', 'eq', 5);
        } else {
            query = query.order('created_at', { ascending: false });
            if (limit) query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Fetch vocabularies error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        let rows = data ?? [];

        if (filter === 'due_today') {
            rows = rows.filter((row) => {
                const review = Array.isArray(row.vocabulary_reviews)
                    ? row.vocabulary_reviews[0]
                    : row.vocabulary_reviews;
                return (
                    review &&
                    review.review_count < 5 &&
                    review.next_review_date &&
                    review.next_review_date <= today
                );
            });
        }

        if (filter === 'favorite') {
            rows = rows.filter((row) => row.is_favorite);
        }

        return NextResponse.json({ success: true, data: rows });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});

export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();
        const body = await request.json();
        const {
            categoryName,
            category_name,
            languageCode,
            language_code,
            word,
            pronunciation,
            meaning,
            remarks,
        } = body;

        const resolvedCategory = categoryName || category_name;
        const resolvedLanguage = languageCode || language_code;

        if (!word?.trim() || !meaning?.trim()) {
            return NextResponse.json(
                { success: false, error: 'Word and meaning are required' },
                { status: 400 }
            );
        }

        const vocabularyId = await createVocabularyEntry(supabase, user.id, {
            categoryName: resolvedCategory || 'General',
            languageCode: resolvedLanguage || 'en',
            word,
            pronunciation,
            meaning,
            remarks,
        });

        const data = await fetchVocabularyById(supabase, user.id, vocabularyId);
        return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});
