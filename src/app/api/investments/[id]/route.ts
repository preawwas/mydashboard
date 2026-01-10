import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { DbInvestment } from '@/lib/supabase-types';

// Helper to get user from token
function getUserFromRequest(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
}

// GET /api/investments/[id] - Get single investment
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createSupabaseAdminClient();
        const { id } = await params;

        const { data: investment, error } = await supabase
            .from('investments')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !investment) {
            return NextResponse.json({ error: 'ไม่พบข้อมูล' }, { status: 404 });
        }

        const dbInvestment = investment as DbInvestment;

        if (dbInvestment.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            data: investment,
        });
    } catch (error) {
        console.error('Get investment error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}

// PATCH /api/investments/[id] - Update investment
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createSupabaseAdminClient();
        const { id } = await params;

        // First check if investment exists and belongs to user
        const { data: existingInvestment, error: fetchError } = await supabase
            .from('investments')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !existingInvestment) {
            return NextResponse.json({ error: 'ไม่พบข้อมูล' }, { status: 404 });
        }

        const dbInvestment = existingInvestment as DbInvestment;

        if (dbInvestment.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();

        // Update investment
        const { data: updatedInvestment, error: updateError } = await supabase
            .from('investments')
            .update({
                asset_category: body.asset_category ?? dbInvestment.asset_category,
                asset_code: body.asset_code ?? dbInvestment.asset_code,
                asset_name: body.asset_name ?? dbInvestment.asset_name,
                market: body.market ?? dbInvestment.market,
                strategy_type: body.strategy_type ?? dbInvestment.strategy_type,
                status: body.status ?? dbInvestment.status,
                buy_quantity: body.buy_quantity !== undefined ? parseFloat(body.buy_quantity) : dbInvestment.buy_quantity,
                buy_price_per_unit: body.buy_price_per_unit !== undefined ? parseFloat(body.buy_price_per_unit) : dbInvestment.buy_price_per_unit,
                buy_currency: body.buy_currency ?? dbInvestment.buy_currency,
                buy_fee: body.buy_fee !== undefined ? parseFloat(body.buy_fee) : dbInvestment.buy_fee,
                buy_datetime: body.buy_datetime ?? dbInvestment.buy_datetime,
                sell_history: body.sell_history ?? dbInvestment.sell_history,
                note: body.note !== undefined ? body.note : dbInvestment.note,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Update investment error:', updateError);
            return NextResponse.json(
                { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedInvestment,
            message: 'อัปเดตการลงทุนสำเร็จ',
        });
    } catch (error) {
        console.error('Update investment error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}

// DELETE /api/investments/[id] - Delete investment
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createSupabaseAdminClient();
        const { id } = await params;

        // First check if investment exists and belongs to user
        const { data: investment, error: fetchError } = await supabase
            .from('investments')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !investment) {
            return NextResponse.json({ error: 'ไม่พบข้อมูล' }, { status: 404 });
        }

        if (investment.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete investment
        const { error: deleteError } = await supabase
            .from('investments')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Delete investment error:', deleteError);
            return NextResponse.json(
                { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'ลบการลงทุนสำเร็จ',
        });
    } catch (error) {
        console.error('Delete investment error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}
