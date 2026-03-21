import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { updateProfileSchema, validateRequest } from '@/lib/validation';

export async function PUT(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'User not found. Please log in again.' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const user = verifyToken(token);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Session expired. Please log in again.' }, { status: 401 });
        }

        const body = await request.json();
        const validation = validateRequest(updateProfileSchema, body);
        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
        }

        const { name } = validation.data;
        const supabaseAdmin = createSupabaseAdminClient();

        const { data: updatedUser, error } = await supabaseAdmin
            .from('users')
            .update({ name })
            .eq('id', user.id)
            .select('id, email, name, role')
            .single();

        if (error || !updatedUser) {
            return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            user: updatedUser,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ success: false, error: 'An error occurred. Please try again.' }, { status: 500 });
    }
}
