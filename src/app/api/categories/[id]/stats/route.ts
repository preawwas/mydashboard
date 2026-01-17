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

    const stats: any[] = [];
    data.forEach((exp: any) => {
        const date = new Date(exp.transaction_date);
        const year = date.getFullYear();
        const monthIndex = date.getMonth();
        const monthName = date.toLocaleString('th-TH', { month: 'long' });

        const existing = stats.find(s => s.year === year && s.monthIndex === monthIndex);
        if (existing) {
            existing.total_amount += exp.amount_total;
        } else {
            stats.push({
                year,
                monthIndex,
                month: monthName,
                total_amount: exp.amount_total
            });
        }
    });

    const result = stats.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return a.monthIndex - b.monthIndex;
    });

    return NextResponse.json({ success: true, data: result });
}
