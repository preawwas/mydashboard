import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { 
    sendUnifiedReminderEmail, 
    PendingExpenseItem, 
    JourneyReminderItem, 
    EmailRecipient,
    UnifiedReminderData
} from '@/lib/email';

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

// Helper to get expense items (similar to original logic)
function getMonthlyPendingExpenses(expense: any): PendingExpenseItem[] {
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
        if (!verifyCronSecret(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createSupabaseAdminClient();
        const { data: users, error: usersError } = await supabase.from('users').select('id, email, name');

        if (usersError) throw usersError;

        const results = [];
        const dashboardUrl = 'https://fluffy-ty.vercel.app';
        const now = new Date();
        const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        
        console.log(`[Unified Cron] Running for date: ${today}`);

        for (const user of users || []) {
            // 1. Fetch Expenses
            const { data: expenses } = await supabase
                .from('expenses')
                .select('*, expense_installments (*)')
                .eq('user_id', user.id)
                .eq('status', 'PENDING');

            const pendingExpenses: PendingExpenseItem[] = [];
            for (const exp of expenses || []) {
                pendingExpenses.push(...getMonthlyPendingExpenses(exp));
            }

            // 2. Fetch Tasks due today (Any category)
            const { data: notes, error: notesError } = await supabase
                .from('notes')
                .select(`
                    title, content, status,
                    note_categories(name),
                    reminders!inner(due_date)
                `)
                .eq('user_id', user.id)
                .neq('status', 'Done')
                .eq('is_deleted', false)
                .eq('is_archived', false)
                .eq('reminders.due_date', today);

            if (notesError) {
                console.error(`[Unified Cron] Error fetching notes for ${user.email}:`, notesError);
            }

            const taskItems: JourneyReminderItem[] = (notes || []).map(note => ({
                noteTitle: note.title,
                description: note.content || '',
                dueDate: (note as any).reminders[0]?.due_date || today,
                status: note.status
            }));

            if (taskItems.length > 0) {
                console.log(`[Unified Cron] Found ${taskItems.length} tasks for ${user.email}`);
            }

            // 3. Send Unified Email if needed
            if (pendingExpenses.length > 0 || taskItems.length > 0) {
                const recipient: EmailRecipient = { email: user.email, name: user.name };
                const emailData: UnifiedReminderData = {
                    expenses: pendingExpenses,
                    journey: taskItems // Keeping the property name for library compatibility
                };

                const emailResult = await sendUnifiedReminderEmail(recipient, emailData, dashboardUrl);
                results.push({
                    userId: user.id,
                    email: user.email,
                    success: emailResult.success,
                    expenseCount: pendingExpenses.length,
                    taskCount: taskItems.length,
                    error: emailResult.error
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${users?.length || 0} users, sent ${results.filter(r => r.success).length} summary emails`,
            results
        });

    } catch (error: any) {
        console.error('Unified Cron error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
