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
    const { id } = await params;
    const user = getUserFromRequest(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
        .from('expenses')
        .select(`
            *,
            categories (*),
            payment_channels (*),
            expense_installments (*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error('Error fetching expense:', error);
        return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 });
    }

    if (data && data.expense_installments) {
        data.expense_installments.sort((a: any, b: any) => a.period_number - b.period_number);
    }

    return NextResponse.json({ success: true, data });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = getUserFromRequest(request);
    if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();

    // 1. Delete installments first (optional if cascade is on, but good to be explicit/safe with user_id)
    const { error: instError } = await supabase
        .from('expense_installments')
        .delete()
        .eq('expense_id', id)
        .eq('user_id', user.id);

    if (instError) {
        return NextResponse.json({ success: false, error: instError.message }, { status: 500 });
    }

    // 2. Delete the expense
    const { error: expError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (expError) {
        return NextResponse.json({ success: false, error: expError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            transactionDate,
            itemName,
            amount,
            categoryId,
            paymentChannelId,
            paymentType,
            necessity,
            note,
            status,
            installments
        } = body;

        const supabase = createSupabaseAdminClient();

        // 1. Update expenses table
        const { data: expense, error: expenseError } = await supabase
            .from('expenses')
            .update({
                transaction_date: transactionDate,
                item_name: itemName,
                amount_total: parseFloat(amount),
                category_id: categoryId,
                payment_channel_id: paymentChannelId,
                payment_type: paymentType,
                necessity: necessity,
                note: note,
                status: status
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (expenseError) {
            console.error('Error updating expense:', expenseError);
            return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
        }

        // 2. Update installments if provided
        if (installments && installments.length > 0) {
            const updatePromises = installments.map((inst: any) =>
                supabase
                    .from('expense_installments')
                    .update({ status: inst.status })
                    .eq('id', inst.id)
            );

            const results = await Promise.all(updatePromises);
            results.forEach((res, idx) => {
                if (res.error) console.error(`Error updating installment ${idx}:`, res.error);
            });
        }

        return NextResponse.json({ success: true, data: expense });

    } catch (error) {
        console.error('Update expense error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
