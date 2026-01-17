import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTypes() {
    console.log('Fetching expenses...');
    const { data: expenses, error } = await supabase
        .from('expenses')
        .select('id, amount_total, transaction_date')
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (!expenses || expenses.length === 0) {
        console.log('No expenses found.');
        return;
    }

    console.log('Sample Expense:', expenses[0]);
    console.log('TypeOf amount_total:', typeof expenses[0].amount_total);
    console.log('TypeOf transaction_date:', typeof expenses[0].transaction_date);
}

checkTypes();
