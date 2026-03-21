import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser } from '@/types';

const PAGE_SIZE = 9;

export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();
        const { searchParams } = new URL(request.url);
        const searchQuery = searchParams.get('q');
        const tagId = searchParams.get('tag');
        const filter = searchParams.get('filter'); // 'deleted' | 'pinned' | null
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

        const isDeleted = filter === 'deleted';
        const isPinned = filter === 'pinned';

        // Server-side tag filtering: resolve matching note_ids first
        let tagFilteredNoteIds: string[] | null = null;
        if (tagId) {
            const { data: tagNotes } = await supabase
                .from('note_tags')
                .select('note_id')
                .eq('tag_id', tagId);
            tagFilteredNoteIds = (tagNotes || []).map((nt: any) => nt.note_id);

            if (tagFilteredNoteIds.length === 0) {
                return NextResponse.json({ success: true, data: [], total: 0, page, totalPages: 0 });
            }
        }

        let query = supabase
            .from('notes')
            .select('*, note_tags(tags(*))', { count: 'exact' })
            .eq('user_id', user.id)
            .is('note_category_id', null)
            .eq('is_archived', false)
            .eq('is_deleted', isDeleted)
            .order('is_favorite', { ascending: false })
            .order('updated_at', { ascending: false });

        if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }

        if (isPinned) {
            query = query.eq('is_favorite', true);
        }

        if (tagFilteredNoteIds !== null) {
            query = query.in('note_id', tagFilteredNoteIds);
        }

        // Apply pagination only for non-deleted views
        if (!isDeleted) {
            const from = (page - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            query = query.range(from, to);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('Fetch short notes error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        const total = count || 0;
        const totalPages = !isDeleted ? Math.ceil(total / PAGE_SIZE) : 1;

        return NextResponse.json({ success: true, data, total, page, totalPages });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});

export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();
        const body = await request.json();
        const { title, content, tags } = body;

        // 1. Insert Note
        const { data: note, error: noteError } = await supabase
            .from('notes')
            .insert({
                user_id: user.id,
                note_category_id: null,
                title: title || 'Untitled Note',
                content,
                status: 'New',
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (noteError) {
            console.error('Create short note error:', noteError);
            return NextResponse.json({ success: false, error: noteError.message }, { status: 500 });
        }

        // 2. Handle tags: if provided, use them; otherwise attach the 'general' tag (Quick Note fallback)
        let noteTags = tags;
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            // Find general tag
            const { data: generalTagData } = await supabase
                .from('tags')
                .select('id')
                .eq('user_id', user.id)
                .ilike('name', '%general%')
                .limit(1)
                .single();

            if (generalTagData) {
                noteTags = [generalTagData.id];
            } else {
                // Rare case where general tag doesn't exist yet, create and attach
                const generalTagStr = 'general|bg-slate-500 text-white';
                const { data: newTag } = await supabase
                    .from('tags')
                    .insert({ user_id: user.id, name: generalTagStr })
                    .select('id')
                    .single();

                if (newTag) {
                    noteTags = [newTag.id];
                }
            }
        }

        // Insert tags
        if (noteTags && Array.isArray(noteTags) && noteTags.length > 0) {
            const tagInserts = noteTags.map(tagId => ({
                note_id: note.note_id,
                tag_id: tagId
            }));
            await supabase.from('note_tags').insert(tagInserts);
        }

        // Return note with relations
        const { data: completeNote, error: fetchError } = await supabase
            .from('notes')
            .select('*, note_tags(tags(*))')
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
