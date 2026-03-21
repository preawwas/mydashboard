import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser } from '@/types';

export const PATCH = withAuth(async (request: NextRequest, user: AuthUser, context: unknown) => {
    try {
        const { id } = await (context as { params: Promise<{ id: string }> }).params;
        const supabase = createSupabaseAdminClient();
        const body = await request.json();
        const { title, content, tags, is_favorite } = body;

        // 1. Update Short Note
        const updateData: Record<string, unknown> = {};

        // Define if any major content field is being updated
        const isContentUpdate = title !== undefined || content !== undefined;

        if (isContentUpdate) updateData.updated_at = new Date().toISOString();
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (is_favorite !== undefined) updateData.is_favorite = is_favorite;

        const { data: note, error: noteError } = await supabase
            .from('notes')
            .update(updateData)
            .eq('note_id', id)
            .eq('user_id', user.id)
            .is('note_category_id', null)
            .select()
            .single();

        if (noteError) {
            console.error('Update short note error:', noteError);
            return NextResponse.json({ success: false, error: noteError.message }, { status: 500 });
        }

        // 2. Update tags if provided
        if (tags !== undefined) {
            // First delete existing tags
            await supabase.from('note_tags').delete().eq('note_id', id);

            // Then insert new tags
            if (Array.isArray(tags) && tags.length > 0) {
                const tagInserts = tags.map(tagId => ({
                    note_id: id,
                    tag_id: tagId
                }));
                const { error: tagError } = await supabase.from('note_tags').insert(tagInserts);
                if (tagError) {
                    console.error('Update note tags error:', tagError);
                }
            }
        }

        // Return note with relations
        const { data: completeNote, error: fetchError } = await supabase
            .from('notes')
            .select('*, note_tags(tags(*))')
            .eq('note_id', id)
            .eq('user_id', user.id)
            .is('note_category_id', null)
            .single();

        if (fetchError) {
            return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: completeNote });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});

export const DELETE = withAuth(async (request: NextRequest, user: AuthUser, context: unknown) => {
    try {
        const { id } = await (context as { params: Promise<{ id: string }> }).params;
        const supabase = createSupabaseAdminClient();

        const { searchParams } = new URL(request.url);
        const permanent = searchParams.get('permanent') === 'true';

        let error;

        if (permanent) {
            const { error: deleteError } = await supabase
                .from('notes')
                .delete()
                .eq('note_id', id)
                .eq('user_id', user.id)
                .is('note_category_id', null);
            error = deleteError;
        } else {
            const { error: updateError } = await supabase
                .from('notes')
                .update({ is_deleted: true })
                .eq('note_id', id)
                .eq('user_id', user.id)
                .is('note_category_id', null);
            error = updateError;
        }

        if (error) {
            console.error('Delete short note error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});
