import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser } from '@/types';

// Get tags for a specific note
export const GET = withAuth(async (request: NextRequest, user: AuthUser, context: unknown) => {
    try {
        const { id } = await (context as { params: Promise<{ id: string }> }).params;
        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase
            .from('note_tags')
            .select('tags(*)')
            .eq('note_id', id);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        const tags = data.map((item: any) => item.tags);
        return NextResponse.json({ success: true, data: tags });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
});

// Update tags for a specific note (replace all)
export const POST = withAuth(async (request: NextRequest, user: AuthUser, context: unknown) => {
    try {
        const { id } = await (context as { params: Promise<{ id: string }> }).params;
        const supabase = createSupabaseAdminClient();
        const body = await request.json();
        const { tagIds } = body; // Array of tag UUIDs

        if (!Array.isArray(tagIds)) {
            return NextResponse.json({ success: false, error: 'tagIds must be an array' }, { status: 400 });
        }

        // 1. Delete existing connections
        const { error: deleteError } = await supabase
            .from('note_tags')
            .delete()
            .eq('note_id', id);

        if (deleteError) {
            return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
        }

        // 2. Insert new connections
        if (tagIds.length > 0) {
            const inserts = tagIds.map(tagId => ({
                note_id: id,
                tag_id: tagId
            }));

            const { error: insertError } = await supabase
                .from('note_tags')
                .insert(inserts);

            if (insertError) {
                return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
});
