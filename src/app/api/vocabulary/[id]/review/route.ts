import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser } from '@/types';
import { fetchVocabularyById } from '@/lib/vocabulary-service';
import { toggleVocabularyReviewStep } from '@/lib/vocabulary-review';

export const POST = withAuth(async (
    request: NextRequest,
    user: AuthUser,
    context: unknown
) => {
    try {
        const { id } = await (context as { params: Promise<{ id: string }> }).params;
        const supabase = createSupabaseAdminClient();
        const body = await request.json().catch(() => ({}));
        const step = Number(body.step);

        const { data: existing, error: existingError } = await supabase
            .from('vocabularies')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (existingError || !existing) {
            return NextResponse.json({ success: false, error: 'Vocabulary not found' }, { status: 404 });
        }

        if (!Number.isFinite(step) || step < 1 || step > 5) {
            return NextResponse.json({ success: false, error: 'Invalid review step' }, { status: 400 });
        }

        const reviewResult = await toggleVocabularyReviewStep(supabase, id, step);

        if (!reviewResult) {
            return NextResponse.json(
                { success: false, error: 'Review update not available for this step' },
                { status: 400 }
            );
        }

        const data = await fetchVocabularyById(supabase, user.id, id);
        return NextResponse.json({ success: true, data, review: reviewResult });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});
