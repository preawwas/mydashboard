import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createSupabaseApiClient, createSupabaseAdminClient } from '@/lib/supabase-server';
import { InvestmentFilters } from '@/types';

// Helper to get user from token
function getUserFromRequest(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
}

// GET /api/investments - List investments
export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createSupabaseAdminClient();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const filters: InvestmentFilters = {
            asset_category: searchParams.get('asset_category') as InvestmentFilters['asset_category'],
            strategy_type: searchParams.get('strategy_type') as InvestmentFilters['strategy_type'],
            status: searchParams.get('status') as InvestmentFilters['status'],
            search: searchParams.get('search') || undefined,
        };

        // Build query
        let query = supabase
            .from('investments')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters.asset_category) {
            query = query.eq('asset_category', filters.asset_category);
        }
        if (filters.strategy_type) {
            query = query.eq('strategy_type', filters.strategy_type);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.search) {
            query = query.or(`asset_code.ilike.%${filters.search}%,asset_name.ilike.%${filters.search}%`);
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit - 1;
        query = query.range(startIndex, endIndex);

        const { data, error, count } = await query;

        if (error) {
            console.error('Get investments error:', error);
            return NextResponse.json(
                { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
                { status: 500 }
            );
        }

        const total = count || 0;
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: data || [],
            total,
            page,
            limit,
            totalPages,
        });
    } catch (error) {
        console.error('Get investments error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}

// POST /api/investments - Create investment
export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use Admin client to bypass RLS, trusting our own auth check above
        const supabase = createSupabaseAdminClient();
        const body = await request.json();

        // Validate required fields
        const requiredFields = ['asset_category', 'asset_code', 'asset_name', 'market', 'strategy_type', 'status', 'buy_quantity', 'buy_price_per_unit', 'buy_currency', 'buy_datetime'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `กรุณากรอก ${field}` },
                    { status: 400 }
                );
            }
        }

        // Insert investment
        const { data: investment, error } = await supabase
            .from('investments')
            .insert({
                user_id: user.id,
                asset_category: body.asset_category,
                asset_code: body.asset_code,
                asset_name: body.asset_name,
                market: body.market,
                strategy_type: body.strategy_type,
                status: body.status,
                buy_quantity: parseFloat(body.buy_quantity),
                buy_price_per_unit: parseFloat(body.buy_price_per_unit),
                buy_currency: body.buy_currency,
                buy_fee: parseFloat(body.buy_fee || 0),
                buy_datetime: body.buy_datetime,
                sell_history: body.sell_history || [],
                note: body.note || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Create investment error:', error);
            return NextResponse.json(
                { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: investment,
            message: 'เพิ่มการลงทุนสำเร็จ',
        });
    } catch (error) {
        console.error('Create investment error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}
