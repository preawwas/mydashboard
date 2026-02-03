import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { sendExpenseReminderEmail, PendingExpenseItem, EmailRecipient } from '@/lib/email';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
    const secret = request.nextUrl.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.warn('CRON_SECRET not configured');
        return false;
    }

    return secret === cronSecret;
}

// Get pending amount for current month (same logic as frontend)
function getMonthlyPendingItems(expense: any): PendingExpenseItem[] {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const items: PendingExpenseItem[] = [];

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (expense.payment_type === 'FULL') {
        const d = new Date(expense.transaction_date);
        const isPending = expense.status === 'PENDING' && (
            (d.getFullYear() < currentYear) ||
            (d.getFullYear() === currentYear && d.getMonth() <= currentMonth)
        );

        if (isPending) {
            items.push({
                itemName: expense.item_name,
                amount: expense.amount_total,
                date: formatDate(expense.transaction_date),
                type: 'FULL'
            });
        }
    }

    if (expense.payment_type === 'INSTALLMENT' && expense.expense_installments) {
        const totalPeriods = expense.expense_installments.length;

        expense.expense_installments.forEach((inst: any) => {
            const due = new Date(inst.due_date);
            const isPending = inst.status === 'PENDING' && (
                (due.getFullYear() < currentYear) ||
                (due.getFullYear() === currentYear && due.getMonth() <= currentMonth)
            );

            if (isPending) {
                items.push({
                    itemName: expense.item_name,
                    amount: inst.amount,
                    date: formatDate(inst.due_date),
                    type: 'INSTALLMENT',
                    periodNumber: inst.period_number,
                    totalPeriods
                });
            }
        });
    }

    return items;
}

export async function GET(request: NextRequest) {
    try {
        // Verify secret
        if (!verifyCronSecret(request)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createSupabaseAdminClient();

        // Get all users with their email
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, name');

        if (usersError) {
            console.error('Failed to fetch users:', usersError);
            return NextResponse.json(
                { error: 'Failed to fetch users' },
                { status: 500 }
            );
        }

        const results: { userId: string; email: string; success: boolean; itemCount: number; error?: string }[] = [];
        const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        for (const user of users || []) {
            // Fetch expenses with installments for this user
            const { data: expenses, error: expError } = await supabase
                .from('expenses')
                .select(`
                    *,
                    expense_installments (*)
                `)
                .eq('user_id', user.id)
                .eq('status', 'PENDING');

            if (expError) {
                console.error(`Failed to fetch expenses for user ${user.id}:`, expError);
                results.push({
                    userId: user.id,
                    email: user.email,
                    success: false,
                    itemCount: 0,
                    error: expError.message
                });
                continue;
            }

            // Collect all pending items for this user
            const pendingItems: PendingExpenseItem[] = [];
            for (const expense of expenses || []) {
                pendingItems.push(...getMonthlyPendingItems(expense));
            }

            if (pendingItems.length === 0) {
                // No pending items, skip email
                results.push({
                    userId: user.id,
                    email: user.email,
                    success: true,
                    itemCount: 0
                });
                continue;
            }

            // Send email
            const recipient: EmailRecipient = {
                email: user.email,
                name: user.name
            };

            const emailResult = await sendExpenseReminderEmail(
                recipient,
                pendingItems,
                `${dashboardUrl}/expenses`
            );

            results.push({
                userId: user.id,
                email: user.email,
                success: emailResult.success,
                itemCount: pendingItems.length,
                error: emailResult.error
            });
        }

        const successCount = results.filter(r => r.success && r.itemCount > 0).length;
        const totalEmails = results.filter(r => r.itemCount > 0).length;

        return NextResponse.json({
            success: true,
            message: `Processed ${users?.length || 0} users, sent ${successCount}/${totalEmails} emails`,
            results
        });

    } catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
