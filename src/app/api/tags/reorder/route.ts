import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser } from '@/types';

export const PUT = withAuth(async (request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();
        const body = await request.json();
        const { tagIds } = body;

        if (!Array.isArray(tagIds)) {
            return NextResponse.json({ success: false, error: 'tagIds must be an array' }, { status: 400 });
        }

        // Supabase does not have a native bulk map update via single query easily, 
        // so we do it in a loop for this scale. (User tags are typically small in count)
        const updates = tagIds.map((id: string, index: number) => {
            return supabase
                .from('tags')
                .update({ order_index: index })
                .eq('id', id)
                .eq('user_id', user.id);
        });

        await Promise.all(updates);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API /tags/reorder PUT Catch Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
});
