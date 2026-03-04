import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser } from '@/types';

export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();
        const { searchParams } = new URL(request.url);
        const searchQuery = searchParams.get('q');
        const tagId = searchParams.get('tag');

        let query = supabase
            .from('notes')
            .select('*, note_tags(tags(*))')
            .eq('user_id', user.id)
            .eq('is_deleted', searchParams.get('filter') === 'deleted')
            .order('is_favorite', { ascending: false })
            .order('updated_at', { ascending: false });

        if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Fetch short notes error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        // Apply tag filtering in memory if tagId is provided
        let filteredData = data;
        if (tagId) {
            filteredData = data.filter((note: any) =>
                note.note_tags?.some((nt: any) => nt.tags?.id === tagId)
            );
        }

        return NextResponse.json({ success: true, data: filteredData });
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
