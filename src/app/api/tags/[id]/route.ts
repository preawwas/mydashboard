import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser } from '@/types';

export const DELETE = withAuth(async (request: NextRequest, user: AuthUser, context: unknown) => {
    try {
        const { id } = await (context as { params: Promise<{ id: string }> }).params;
        const supabase = createSupabaseAdminClient();

        // 1. Verify ownership
        const { data: tag, error: tagError } = await supabase
            .from('tags')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (tagError || !tag) {
            return NextResponse.json({ success: false, error: 'Tag not found or unauthorized' }, { status: 404 });
        }

        if (tag.name.toLowerCase().includes('general')) {
            return NextResponse.json({ success: false, error: 'The general tag is a system tag and cannot be deleted.' }, { status: 403 });
        }

        // 2. Check if tag is used by any short note
        const { count: usageCount, error: countError } = await supabase
            .from('short_note_tags')
            .select('*', { count: 'exact', head: true })
            .eq('tag_id', id);

        if (countError) {
            return NextResponse.json({ success: false, error: 'Failed to verify tag usage' }, { status: 500 });
        }

        if (usageCount && usageCount > 0) {
            return NextResponse.json({ success: false, error: 'Cannot delete tag that is still in use' }, { status: 400 });
        }

        // 3. Delete tag
        const { error: deleteError } = await supabase
            .from('tags')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (deleteError) {
            console.error('API /tags/[id] DELETE Supabase Error:', deleteError);
            return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Tag deleted successfully' });

    } catch (error: any) {
        console.error('API /tags/[id] DELETE Catch Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
});

export const PATCH = withAuth(async (request: NextRequest, user: AuthUser, context: unknown) => {
    try {
        const { id } = await (context as { params: Promise<{ id: string }> }).params;
        const supabase = createSupabaseAdminClient();
        const body = await request.json();

        if (!body.name) {
            return NextResponse.json({ success: false, error: 'Tag name is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('tags')
            .update({ name: body.name })
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('API /tags/[id] PATCH Supabase Error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Tag updated successfully' });
    } catch (error: any) {
        console.error('API /tags/[id] PATCH Catch Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
});
