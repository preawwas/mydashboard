import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, verifyPassword, hashPassword } from '@/lib/auth';
import { changePasswordSchema, validateRequest } from '@/lib/validation';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        // 1. Get token from header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'User not found. Please log in again.' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const user = verifyToken(token);

        if (!user) {
            return NextResponse.json({ success: false, error: 'Session expired. Please log in again.' }, { status: 401 });
        }

        // 2. Parse request body
        const body = await request.json();
        const validation = validateRequest(changePasswordSchema, body);

        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
        }

        const { currentPassword, newPassword } = validation.data;

        const supabaseAdmin = createSupabaseAdminClient();

        // 3. Fetch user from custom users table
        const { data: dbUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('password_hash')
            .eq('id', user.id)
            .single();

        if (fetchError || !dbUser) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // 4. Verify current password
        const isPasswordValid = await verifyPassword(currentPassword, dbUser.password_hash);
        if (!isPasswordValid) {
            return NextResponse.json({ success: false, error: 'Incorrect current password' }, { status: 400 });
        }

        // 5. Update password in Supabase Auth
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
            password: newPassword
        });

        if (authError) {
            console.error('Failed to update password in Supabase Auth:', authError);
            return NextResponse.json({ success: false, error: 'Unable to change password. Please try again.' }, { status: 500 });
        }

        // 6. Update password in users table
        const newPasswordHash = await hashPassword(newPassword);
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ password_hash: newPasswordHash })
            .eq('id', user.id);

        if (updateError) {
            console.error('Failed to update password in users table:', updateError);
            // We got out of sync here, which is bad, but usually unlikely if auth update succeeded.
            return NextResponse.json({ success: false, error: 'Failed to update user data' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ success: false, error: 'An error occurred. Please try again.' }, { status: 500 });
    }
}
