import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser, VocabularyCategorySummaryRow, VocabularySummaryMetrics } from '@/types';

export const GET = withAuth(async (_request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();
        const today = new Date().toISOString().slice(0, 10);

        const { data: vocabularies, error: vocabError } = await supabase
            .from('vocabularies')
            .select(`
                id,
                category_id,
                vocabulary_reviews ( review_count, next_review_date )
            `)
            .eq('user_id', user.id);

        if (vocabError) {
            console.error('Fetch vocabulary summary error:', vocabError);
            return NextResponse.json({ success: false, error: vocabError.message }, { status: 500 });
        }

        const rows = vocabularies ?? [];
        let mastered = 0;
        let pendingReview = 0;

        rows.forEach((row) => {
            const review = Array.isArray(row.vocabulary_reviews)
                ? row.vocabulary_reviews[0]
                : row.vocabulary_reviews;

            if (!review) return;

            if (review.review_count >= 5) {
                mastered += 1;
                return;
            }

            if (review.next_review_date && review.next_review_date <= today) {
                pendingReview += 1;
            }
        });

        const metrics: VocabularySummaryMetrics = {
            totalWords: rows.length,
            mastered,
            pendingReview,
        };

        const { data: categories, error: categoryError } = await supabase
            .from('vocabulary_categories')
            .select('category_id, name')
            .eq('user_id', user.id)
            .order('name');

        if (categoryError) {
            console.error('Fetch vocabulary categories summary error:', categoryError);
            return NextResponse.json({ success: false, error: categoryError.message }, { status: 500 });
        }

        const categoryRows: VocabularyCategorySummaryRow[] = (categories ?? []).map((category) => {
            const categoryVocabs = rows.filter((row) => row.category_id === category.category_id);
            const categoryMastered = categoryVocabs.filter((row) => {
                const review = Array.isArray(row.vocabulary_reviews)
                    ? row.vocabulary_reviews[0]
                    : row.vocabulary_reviews;
                return review?.review_count >= 5;
            }).length;

            const total = categoryVocabs.length;
            const progressPercent = total > 0 ? Math.round((categoryMastered / total) * 1000) / 10 : 0;

            return {
                category_id: category.category_id,
                category_name: category.name,
                total,
                mastered: categoryMastered,
                progress_percent: progressPercent,
            };
        });

        const uncategorized = rows.filter((row) => !row.category_id);
        if (uncategorized.length > 0) {
            const uncategorizedMastered = uncategorized.filter((row) => {
                const review = Array.isArray(row.vocabulary_reviews)
                    ? row.vocabulary_reviews[0]
                    : row.vocabulary_reviews;
                return review?.review_count >= 5;
            }).length;

            categoryRows.push({
                category_id: 'uncategorized',
                category_name: 'Uncategorized',
                total: uncategorized.length,
                mastered: uncategorizedMastered,
                progress_percent:
                    uncategorized.length > 0
                        ? Math.round((uncategorizedMastered / uncategorized.length) * 1000) / 10
                        : 0,
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                metrics,
                categories: categoryRows,
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});
