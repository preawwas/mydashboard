import { NextRequest, NextResponse } from 'next/server';
import { registerUser, generateToken } from '@/lib/auth';
import { registerSchema, validateRequest } from '@/lib/validation';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = validateRequest(registerSchema, body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const { name, email, password } = validation.data;

        // Calculate redirect URL based on current origin
        const origin = request.nextUrl.origin;
        const redirectTo = `${origin}/auth/callback`;

        // Register user
        const user = await registerUser(email, password, name, redirectTo);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'This email is already in use' },
                { status: 409 }
            );
        }

        // Generate token
        const token = generateToken(user);

        return NextResponse.json({
            success: true,
            user,
            token,
            message: 'Registration successful',
        });
    } catch (error: unknown) {
        console.error('Register error:', error);
        return NextResponse.json(
            { success: false, error: 'An error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
