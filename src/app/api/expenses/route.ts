import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { createExpenseSchema, validateRequest } from '@/lib/validation';
import { AuthUser } from '@/types';

export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
    try {
        const body = await request.json();
        const validation = validateRequest(createExpenseSchema, body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const {
            transactionDate,
            categoryId,
            itemName,
            amount,
            paymentChannelId,
            paymentType,
            installmentPeriods,
            necessity,
            note,
            status
        } = validation.data;

        const supabase = createSupabaseAdminClient();

        // 1. Insert into expenses table
        const { data: expense, error: expenseError } = await supabase
            .from('expenses')
            .insert({
                user_id: user.id,
                transaction_date: transactionDate,
                item_name: itemName,
                amount_total: amount,
                category_id: categoryId,
                payment_channel_id: paymentChannelId,
                payment_type: paymentType,
                necessity: necessity,
                note: note,
                status: status
            })
            .select()
            .single();

        if (expenseError) {
            console.error('Error creating expense:', expenseError);
            return NextResponse.json(
                { success: false, error: expenseError.message },
                { status: 500 }
            );
        }

        // 2. If Installment, create installment periods
        if (paymentType === 'INSTALLMENT' && installmentPeriods) {
            const periods = installmentPeriods;
            const amountPerPeriod = amount / periods;
            const installments = [];
            const startDate = new Date(transactionDate);

            for (let i = 1; i <= periods; i++) {
                const dueDate = new Date(startDate);
                dueDate.setMonth(dueDate.getMonth() + i);

                installments.push({
                    user_id: user.id,
                    expense_id: expense.id,
                    period_number: i,
                    due_date: dueDate.toISOString().split('T')[0],
                    amount: amountPerPeriod,
                    status: 'PENDING'
                });
            }

            const { error: installmentError } = await supabase
                .from('expense_installments')
                .insert(installments);

            if (installmentError) {
                console.error('Error creating installments:', installmentError);
                return NextResponse.json(
                    { success: false, error: 'Expense created but installments failed' },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true, data: expense });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('Create expense error:', error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});

export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();

        const { data: expenses, error } = await supabase
            .from('expenses')
            .select(`
                *,
                categories (id, name, color, icon),
                payment_channels (id, name),
                expense_installments (*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching expenses:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data: expenses });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('Fetch expenses error:', error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});
