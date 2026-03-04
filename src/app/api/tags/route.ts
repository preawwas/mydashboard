import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser } from '@/types';

export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();
        let { data, error } = await supabase
            .from('tags')
            .select('*')
            .eq('user_id', user.id)
            .order('name', { ascending: true });

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        // Auto-create 'general' tag if it doesn't exist
        if (data && !data.some((t: any) => t.name.toLowerCase().includes('general'))) {
            const generalTagStr = 'general';
            const { data: newTag, error: insertError } = await supabase
                .from('tags')
                .insert({ user_id: user.id, name: generalTagStr })
                .select()
                .single();

            if (!insertError && newTag) {
                // Return updated list preserving alphabetical order or just pushing
                data.push(newTag);
                data.sort((a, b) => a.name.localeCompare(b.name));
            }
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
});

export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ success: false, error: 'Tag name is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('tags')
            .insert({ user_id: user.id, name })
            .select()
            .single();

        if (error) {
            console.error('API /tags POST Supabase Error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('API /tags POST Catch Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
});
