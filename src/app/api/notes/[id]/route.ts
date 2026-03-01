import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser } from '@/types';

export const PATCH = withAuth(async (request: NextRequest, user: AuthUser, context: unknown) => {
    try {
        const { id } = await (context as { params: Promise<{ id: string }> }).params;
        const supabase = createSupabaseAdminClient();
        const body = await request.json();
        const { title, content, note_category_id, status, is_favorite, is_archived, is_deleted, due_date } = body;

        // 1. Update Note
        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (note_category_id !== undefined) updateData.note_category_id = note_category_id;
        if (status !== undefined) updateData.status = status;
        if (is_favorite !== undefined) updateData.is_favorite = is_favorite;
        if (is_archived !== undefined) updateData.is_archived = is_archived;
        if (is_deleted !== undefined) updateData.is_deleted = is_deleted;

        const { data: note, error: noteError } = await supabase
            .from('notes')
            .update(updateData)
            .eq('note_id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (noteError) {
            console.error('Update note error:', noteError);
            return NextResponse.json({ success: false, error: noteError.message }, { status: 500 });
        }

        // 2. Update/Upsert Reminder if due_date provided
        if (due_date !== undefined) {
            if (due_date === null) {
                await supabase.from('reminders').delete().eq('note_id', id);
            } else {
                const { error: reminderError } = await supabase
                    .from('reminders')
                    .upsert({
                        note_id: id,
                        due_date,
                        reminder_type: 'Daily',
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'note_id' });

                if (reminderError) {
                    console.error('Update reminder error:', reminderError);
                }
            }
        }

        // Return note with relations
        const { data: completeNote, error: fetchError } = await supabase
            .from('notes')
            .select('*, note_categories(*), reminders(*)')
            .eq('note_id', id)
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

        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('note_id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Delete note error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});
