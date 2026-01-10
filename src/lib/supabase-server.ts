import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-side Supabase client (for use in API routes and Server Components)
export async function createSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                }
            },
        },
    });
}

// Simple server client for API routes (without cookies management)
export function createSupabaseApiClient(accessToken?: string) {
    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return [];
            },
            setAll() {
                // No-op for API routes
            },
        },
        global: accessToken ? {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        } : undefined,
    });
}

// Admin client using Service Role Key (Bypasses RLS)
export function createSupabaseAdminClient() {
    if (!supabaseServiceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
    }

    return createServerClient(supabaseUrl, supabaseServiceRoleKey, {
        cookies: {
            getAll() { return []; },
            setAll() { },
        },
        auth: {
            persistSession: false,
        }
    });
}
