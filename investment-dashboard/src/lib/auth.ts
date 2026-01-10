import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthUser } from '@/types';
import { createSupabaseApiClient, createSupabaseAdminClient } from './supabase-server';
import { DbUser } from './supabase-types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

export function verifyToken(token: string): AuthUser | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        return decoded;
    } catch {
        return null;
    }
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
    const supabase = createSupabaseAdminClient();

    // Find user by email
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !user) {
        console.error('User not found:', error?.message);
        return null;
    }

    const dbUser = user as DbUser;

    // Verify password
    const isValid = await verifyPassword(password, dbUser.password_hash);
    if (!isValid) {
        return null;
    }

    // Check if email is confirmed in Supabase Auth
    // We need to fetch the Auth User object to check email_confirmed_at
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(dbUser.id);

    if (authError || !authUser.user) {
        // Technically shouldn't happen if public user exists and is linked
        return null;
    }

    if (!authUser.user.email_confirmed_at) {
        // Email not confirmed yet using Supabase's mechanism
        throw new Error('Please verify your email address.');
    }

    return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
    };
}

export async function registerUser(
    email: string,
    password: string,
    name: string
): Promise<AuthUser | null> {
    const supabase = createSupabaseAdminClient();

    // Check if user exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (existingUser) {
        return null;
    }

    // Check if user exists in Supabase Auth (but not in public.users, effectively "orphaned")
    // If so, we delete the Auth user to allow fresh registration
    const { data: authUserLists } = await supabase.auth.admin.listUsers();
    // Note: listUsers might not scale for millions, but getUserByEmail is not directly exposed on admin without weird workarounds sometimes, 
    // actually admin.listUsers() is not ideal for search.
    // Better: Attempt to create user. If it fails with "User already registered", then we know.
    // BUT we want to delete it.

    // There isn't a direct "getUserByEmail" on admin client in some versions, but we can try generic listing or just catch the error below.
    // However, to be clean:
    // We can try to sign up. If it fails, check if the failure is "User already registered".
    // If so, delete that user and try again.

    // Let's rely on cleaning up BEFORE signUp if possible.
    // Admin API usually has listUsers with filters or we can iterate.
    // Actually SDK v2 has `createUser` and `deleteUser`, but verifying existence by email is tricky without listing.
    // Let's use `listUsers` with filter? No, Supabase JS admin listUsers doesn't filter by email well in all versions.
    // Let's implement the "Try/Catch/Retry" pattern.

    // Hash password
    const hashedPassword = await hashPassword(password);

    // 1. Create user in Supabase Auth using signUp
    const publicSupabase = createSupabaseApiClient();
    let authSignUpResponse = await publicSupabase.auth.signUp({
        email,
        password: password,
        options: {
            data: { name }
        }
    });

    if (authSignUpResponse.error?.message === 'User already registered') {
        // Orphaned user case: Exists in Auth but not in public.users (checked above)
        // We need to find the user ID to delete it.
        // Since we are admin, we can find it.
        // We'll iterate/search (inefficient but safe for now) or typically just use admin delete if we had ID.
        // Start by getting users.
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const orphanedUser = users.find(u => u.email === email);

        if (orphanedUser) {
            console.log('Found orphaned auth user, deleting:', orphanedUser.id);
            await supabase.auth.admin.deleteUser(orphanedUser.id);

            // Retry sign up
            authSignUpResponse = await publicSupabase.auth.signUp({
                email,
                password: password,
                options: {
                    data: { name }
                }
            });
        }
    }

    const { data: authUser, error: authError } = authSignUpResponse;

    if (authError || !authUser.user) {
        console.error('Failed to create auth user:', authError?.message);
        return null;
    }

    // Identical user ID from Auth
    const userId = authUser.user.id;

    // 2. Create user in public.users (using the SAME ID) via Admin Client (to bypass RLS if needed)
    // Note: We use the admin client we already have at the top of the function
    const { data: newUser, error } = await supabase
        .from('users')
        .insert({
            id: userId, // Explicitly set ID to match Auth User
            email,
            name,
            role: 'user',
            password_hash: hashedPassword,
        })
        .select()
        .single();

    if (error || !newUser) {
        console.error('Failed to create user:', error?.message);
        return null;
    }

    const dbUser = newUser as DbUser;

    return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
    };
}

// Helper function to get user by ID
export async function getUserById(id: string): Promise<AuthUser | null> {
    const supabase = createSupabaseAdminClient();

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !user) {
        return null;
    }

    const dbUser = user as DbUser;

    return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
    };
}
