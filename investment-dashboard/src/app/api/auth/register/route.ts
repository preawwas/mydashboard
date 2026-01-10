import { NextRequest, NextResponse } from 'next/server';
import { registerUser, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
                { status: 400 }
            );
        }

        // Register user
        const user = await registerUser(email, password, name);

        if (!user) {
            return NextResponse.json(
                { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
                { status: 409 }
            );
        }

        // Generate token
        const token = generateToken(user);

        return NextResponse.json({
            success: true,
            user,
            token,
            message: 'สมัครสมาชิกสำเร็จ',
        });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}
