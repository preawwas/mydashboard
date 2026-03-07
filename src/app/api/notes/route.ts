import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser } from '@/types';

export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter');
        const sort = searchParams.get('sort');

        let query = supabase
            .from('notes')
            .select('*, note_categories(*), reminders(*), note_tags(tags(*))')
            .eq('user_id', user.id);

        // Apply filters
        if (filter === 'all') {
            // All non-deleted, non-archived notes (INCLUDING Done)
            query = query.eq('is_deleted', false).eq('is_archived', false);
        } else if (filter === 'favorites') {
            query = query.eq('is_favorite', true).eq('is_deleted', false).eq('is_archived', false);
        } else if (filter === 'archived') {
            query = query.eq('is_archived', true).eq('is_deleted', false);
        } else if (filter === 'deleted') {
            query = query.eq('is_deleted', true);
        } else if (filter === 'completed') {
            query = query.eq('status', 'Done').eq('is_deleted', false).eq('is_archived', false);
        } else {
            // Default: Active notes (not done, not deleted, not archived)
            query = query.neq('status', 'Done').eq('is_archived', false).eq('is_deleted', false);
        }

        // Apply sorting
        if (sort === 'recent') {
            query = query.order('updated_at', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
            console.error('Fetch notes error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});

export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();
        const body = await request.json();
        const { title, content, note_category_id, status, is_favorite, due_date, tagIds } = body;

        if (!title) {
            return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
        }

        // 1. Insert Note
        const { data: note, error: noteError } = await supabase
            .from('notes')
            .insert({
                user_id: user.id,
                title,
                content,
                note_category_id: note_category_id || null,
                status: status || 'New',
                is_favorite: !!is_favorite
            })
            .select()
            .single();

        if (noteError) {
            console.error('Create note error:', noteError);
            return NextResponse.json({ success: false, error: noteError.message }, { status: 500 });
        }

        // 2. Insert Reminder if due_date provided
        if (due_date) {
            const { error: reminderError } = await supabase
                .from('reminders')
                .insert({
                    note_id: note.note_id,
                    due_date,
                    reminder_type: 'Daily'
                });

            if (reminderError) {
                console.error('Create reminder error:', reminderError);
            }
        }

        // 3. Insert tags if tagIds provided
        if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
            const tagInserts = tagIds.map(tagId => ({
                note_id: note.note_id,
                tag_id: tagId
            }));
            await supabase.from('note_tags').insert(tagInserts);
        }

        // Return note with relations
        const { data: completeNote, error: fetchError } = await supabase
            .from('notes')
            .select('*, note_categories(*), reminders(*), note_tags(tags(*))')
            .eq('note_id', note.note_id)
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
