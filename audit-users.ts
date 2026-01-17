
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

async function checkUsers() {
    console.log('--- User ID Audit ---');
    const { data: users, error } = await supabase.from('users').select('id, email, name');
    if (error) {
        console.error('Error:', error.message);
        return;
    }

    users.forEach(user => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
        console.log(`User: ${user.email} | ID: ${user.id} | Valid UUID: ${isUUID}`);
    });
}

checkUsers();
