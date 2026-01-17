import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

function getUserFromRequest(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
}

export async function GET(request: NextRequest) {
    const user = getUserFromRequest(request);
    if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('name');

    if (error) {
        console.error('Fetch categories error:', error);
        return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
    const user = getUserFromRequest(request);
    if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();
    const body = await request.json();
    const { name, color } = body;

    if (!name) {
        return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('categories')
        .insert({
            user_id: user.id,
            name,
            color: color || '#808080'
        })
        .select()
        .single();

    if (error) {
        console.error('Create category error:', error);
        return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}
