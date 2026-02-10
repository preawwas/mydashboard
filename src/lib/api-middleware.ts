import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { AuthUser } from '@/types';

/**
 * Extract and verify user from Authorization header.
 * Shared across all API routes to avoid duplicate code.
 */
export function getUserFromRequest(request: NextRequest): AuthUser | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
}

/**
 * Higher-order function that wraps an API handler with authentication.
 * Returns 401 if user is not authenticated.
 */
export function withAuth(
    handler: (request: NextRequest, user: AuthUser, ...args: unknown[]) => Promise<NextResponse>
) {
    return async (request: NextRequest, ...args: unknown[]) => {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }
        return handler(request, user, ...args);
    };
}
