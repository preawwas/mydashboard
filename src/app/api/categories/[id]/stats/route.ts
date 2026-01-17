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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: categoryId } = await params;
    const user = getUserFromRequest(request);
    if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();
    // Get stats grouped by month
    const { data, error } = await supabase
        .from('expenses')
        .select('transaction_date, amount_total')
        .eq('category_id', categoryId);

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const monthlyStats: { [key: string]: number } = {};
    data.forEach((exp: any) => {
        const date = new Date(exp.transaction_date);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        monthlyStats[monthYear] = (monthlyStats[monthYear] || 0) + exp.amount_total;
    });

    const result = Object.entries(monthlyStats).map(([month, total_amount]) => ({
        month,
        total_amount
    })).sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json({ success: true, data: result });
}
