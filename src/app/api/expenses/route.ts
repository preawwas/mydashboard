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

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            transactionDate, // Frontend uses this name
            categoryId,
            itemName,
            amount,
            paymentChannelId,
            paymentType,
            installmentPeriods,
            necessity,
            note,
            status
        } = body;

        // Basic validation
        if (!transactionDate || !itemName || !amount || !categoryId || !paymentChannelId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createSupabaseAdminClient();

        // 1. Insert into expenses table
        const { data: expense, error: expenseError } = await supabase
            .from('expenses')
            .insert({
                user_id: user.id,
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
            .select()
            .single();

        if (expenseError) {
            console.error('Error creating expense:', expenseError);
            return NextResponse.json({ error: expenseError.message, details: expenseError }, { status: 500 });
        }

        // 2. If Installment, create installment periods
        if (paymentType === 'INSTALLMENT' && installmentPeriods) {
            const periods = parseInt(installmentPeriods);
            const amountPerPeriod = parseFloat(amount) / periods;
            const installments = [];

            const startDate = new Date(transactionDate);

            for (let i = 1; i <= periods; i++) {
                // Calculate due date: same day of month, incrementing months
                const dueDate = new Date(startDate);
                dueDate.setMonth(dueDate.getMonth() + (i - 1)); // first installment is current month or next?
                // User said: "เมื่อเริ่มต้นเดือนใหม่ ให้ List รายการเป็นข้อๆ ว่า รายการค่าใช้จ่าย Status เป็น PENDING เหลือรายการอะไรบ้าง"
                // Usually first installment is immediate or next month. 
                // Let's stick to Month + (i-1) if they want 1st installment in the same month.

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
                return NextResponse.json({ error: 'Expense created but installments failed' }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, data: expense });

    } catch (error: any) {
        console.error('Create expense error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
            .order('transaction_date', { ascending: false });

        if (error) {
            console.error('Error fetching expenses:', error);
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: expenses });

    } catch (error: any) {
        console.error('Fetch expenses error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
