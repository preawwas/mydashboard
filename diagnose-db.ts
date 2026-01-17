
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^#\s][^=]*)=(['"]?)(.*)\2/);
        if (match) {
            const key = match[1].trim();
            const value = match[3].trim();
            process.env[key] = value;
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing env vars:', { supabaseUrl: !!supabaseUrl, supabaseServiceRoleKey: !!supabaseServiceRoleKey });
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function diagnose() {
    console.log('--- Database Schema Diagnosis ---');

    const tables = ['users', 'categories', 'payment_channels', 'expenses', 'investments'];

    for (const table of tables) {
        console.log(`\nTable: ${table}`);

        // 1. Check a sample row
        const { data: rows, error: rowError } = await supabase.from(table).select('*').limit(1);
        if (rowError) {
            console.error(`  Query error: ${rowError.message}`);
        } else if (rows.length === 0) {
            console.log('  Status: Table exists but is EMPTY.');
        } else {
            console.log('  Status: Success. Sample ID type:', typeof rows[0].id, `(${rows[0].id})`);
            if (rows[0].user_id) console.log('  Sample user_id:', rows[0].user_id, typeof rows[0].user_id);
        }

        // 2. Query information_schema for column types (requires specific permissions, but service_role might have it)
        // Since we can't run raw SQL directly via the client easily without an RPC, 
        // let's try to use a dummy insert to catch type errors if we suspect specific things.
    }

    // Diagnostic Test: Attempt to insert a record with a potential type mismatch
    console.log('\n--- Diagnostic Test: Insert Category ---');
    // First find a valid user ID from public.users
    const { data: users } = await supabase.from('users').select('id').limit(1);
    if (users && users.length > 0) {
        const testUserId = users[0].id;
        console.log(`Testing insert for user_id: ${testUserId} (type: ${typeof testUserId})`);

        const { data: insertData, error: insertError } = await supabase
            .from('categories')
            .insert({
                user_id: testUserId,
                name: 'Diagnostic Test ' + new Date().getTime(),
                color: '#FF0000'
            })
            .select();

        if (insertError) {
            console.error('Insert Category FAILED:', insertError);
            console.log('  Hint: This error message reveals the core mismatch.');
        } else {
            console.log('Insert Category SUCCESS:', insertData[0].id);
            // Cleanup
            await supabase.from('categories').delete().eq('id', insertData[0].id);
        }
    } else {
        console.log('No users found to test with.');
    }
}

diagnose();
