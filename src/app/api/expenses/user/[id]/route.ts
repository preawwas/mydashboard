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
    try {
        const { id } = await params;
        const user = getUserFromRequest(request);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('category');
        const paymentId = searchParams.get('payment');
        const status = searchParams.get('status');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const minAmount = searchParams.get('minAmount');
        const maxAmount = searchParams.get('maxAmount');
        const sortField = searchParams.get('sortField') || 'transaction_date';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const offset = (page - 1) * limit;

        const supabase = createSupabaseAdminClient();

        let query = supabase
            .from('expenses')
            .select(`
                *,
                categories (id, name, color, icon),
                payment_channels (id, name),
                expense_installments (*)
            `, { count: 'exact' })
            .eq('user_id', id);

        // Apply filters
        if (search) {
            query = query.ilike('item_name', `%${search}%`);
        }
        if (categoryId && categoryId !== 'ALL') {
            query = query.eq('category_id', categoryId);
        }
        if (paymentId && paymentId !== 'ALL') {
            query = query.eq('payment_channel_id', paymentId);
        }
        if (status && status !== 'ALL') {
            query = query.eq('status', status);
        }
        if (startDate) {
            query = query.gte('transaction_date', startDate);
        }
        if (endDate) {
            query = query.lte('transaction_date', endDate);
        }
        if (minAmount && !isNaN(parseFloat(minAmount))) {
            query = query.gte('amount_total', parseFloat(minAmount));
        }
        if (maxAmount && !isNaN(parseFloat(maxAmount))) {
            query = query.lte('amount_total', parseFloat(maxAmount));
        }

        // Apply sorting
        // Note: For related tables sorting (e.g. category name), it's complex in Supabase. 
        // We'll stick to expense fields for now or basic 'amount_total' / 'transaction_date'.
        if (sortField === 'amount') {
            query = query.order('amount_total', { ascending: sortOrder === 'asc' });
        } else {
            query = query.order('transaction_date', { ascending: sortOrder === 'asc' });
        }

        // Add secondary sort for stability
        query = query.order('created_at', { ascending: false });

        // Apply pagination
        const { data: expenses, error, count } = await query.range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching user expenses:', error);
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }

        // Calculate statistics
        let stats = null;
        // Fetch minimal data for stats if needed (simplified: fetch all for now for correct totals)
        const { data: allExpenses } = await supabase
            .from('expenses')
            .select('amount_total, transaction_date, category_id')
            .eq('user_id', id);

        if (allExpenses) {
            const totalAmount = allExpenses.reduce((sum, e) => sum + e.amount_total, 0);
            const byCategory: { [key: string]: number } = {};
            const byMonth: { [key: string]: number } = {};
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            allExpenses.forEach(e => {
                // Category Stats
                if (e.category_id) {
                    byCategory[e.category_id] = (byCategory[e.category_id] || 0) + e.amount_total;
                }
                // Monthly Stats
                const d = new Date(e.transaction_date);
                const m = months[d.getMonth()];
                byMonth[m] = (byMonth[m] || 0) + e.amount_total;
            });

            stats = { totalAmount, byCategory, byMonth };
        }

        return NextResponse.json({
            success: true,
            data: expenses,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: count ? Math.ceil(count / limit) : 0
            },
            stats
        });

    } catch (error: any) {
        console.error('Fetch user expenses error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
