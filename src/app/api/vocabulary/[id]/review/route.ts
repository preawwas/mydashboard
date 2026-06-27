import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser } from '@/types';
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

        if (!Number.isFinite(step) || step < 1 || step > 5) {
            return NextResponse.json({ success: false, error: 'Invalid review step' }, { status: 400 });
        }

        const review = await toggleVocabularyReviewStep(supabase, id, user.id, step);

        if (!review) {
            return NextResponse.json(
                { success: false, error: 'Vocabulary not found or review update not available for this step' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, review });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});
