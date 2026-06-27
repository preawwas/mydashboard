import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser } from '@/types';

export const GET = withAuth(async (_request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase
            .from('vocabulary_categories')
            .select('*')
            .eq('user_id', user.id)
            .order('name');

        if (error) {
            console.error('Fetch vocabulary categories error:', error);
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
        const { name } = body;

        if (!name?.trim()) {
            return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('vocabulary_categories')
            .insert({ user_id: user.id, name: name.trim() })
            .select()
            .single();

        if (error) {
            console.error('Create vocabulary category error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});
