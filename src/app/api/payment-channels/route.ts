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
        .from('payment_channels')
        .select('*')
        .order('name');

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
    const { name } = body;

    if (!name) {
        return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('payment_channels')
        .insert({ name })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}
