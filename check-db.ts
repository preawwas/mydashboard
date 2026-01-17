
import { createSupabaseAdminClient } from './src/lib/supabase-server';

async function checkSchema() {
    try {
        const supabase = createSupabaseAdminClient();

        // Query to check table columns and types
        const { data, error } = await supabase.rpc('get_table_info', { table_name: 'users' });

        if (error) {
            // If RPC is not available, try a generic query to get one row
            const { data: row, error: rowError } = await supabase.from('users').select('*').limit(1);
            if (rowError) {
                console.error('Error fetching users:', rowError);
                return;
            }
            console.log('Sample user row:', row);
        } else {
            console.log('Table info:', data);
        }
    } catch (e) {
        console.error('Script error:', e);
    }
}

checkSchema();
