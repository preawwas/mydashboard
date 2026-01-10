import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'กรุณากรอกอีเมลและรหัสผ่าน' },
                { status: 400 }
            );
        }

        // Authenticate user
        const user = await authenticateUser(email, password);

        if (!user) {
            return NextResponse.json(
                { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
                { status: 401 }
            );
        }

        // Generate token
        const token = generateToken(user);

        return NextResponse.json({
            success: true,
            user,
            token,
            message: 'เข้าสู่ระบบสำเร็จ',
        });
    } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'Please verify your email address.') {
            return NextResponse.json(
                { error: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ' },
                { status: 403 }
            );
        }
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}
