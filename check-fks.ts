
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
const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

async function checkFKs() {
    console.log('--- Foreign Key Inspection ---');

    // We try to query information_schema.key_column_usage
    // This might fail if the user doesn't have permissions, but service_role usually does.
    // However, Supabase doesn't expose raw SQL directly easily.
    // Let's try to query a system view if we can, or just infer from error.

    // Since we can't run raw SQL, let's try to infer by checking if public.users has the ID.
    const testId = '73ee8269-1bb3-402d-8a60-5072377d2be2';
    console.log(`Checking if user ${testId} exists in public.users...`);

    const { data, error } = await supabase.from('users').select('id').eq('id', testId).single();
    if (error) {
        console.log(`Result: User ${testId} DOES NOT exist in public.users. (Error: ${error.message})`);
    } else {
        console.log(`Result: User ${testId} EXISTS in public.users.`);
    }

    // Now let's try to check auth.users (via admin API)
    console.log(`Checking if user ${testId} exists in auth.users...`);
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(testId);
    if (authError) {
        console.log(`Result: User ${testId} DOES NOT exist in auth.users. (Error: ${authError.message})`);
    } else {
        console.log(`Result: User ${testId} EXISTS in auth.users. Email: ${authUser.user?.email}`);
    }
}

checkFKs();
