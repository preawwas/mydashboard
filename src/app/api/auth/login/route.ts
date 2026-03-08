import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';
import { loginSchema, validateRequest } from '@/lib/validation';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = validateRequest(loginSchema, body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;

        // Authenticate user
        const user = await authenticateUser(email, password);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate token
        const token = generateToken(user);

        return NextResponse.json({
            success: true,
            user,
            token,
            message: 'Login successful',
        });
    } catch (error: unknown) {
        console.error('Login error:', error);
        if (error instanceof Error && error.message === 'Please verify your email address.') {
            return NextResponse.json(
                { success: false, error: 'Please verify your email before logging in' },
                { status: 403 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'An error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
