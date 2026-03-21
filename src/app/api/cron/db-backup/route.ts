import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import nodemailer from 'nodemailer';

// Tables to backup
const BACKUP_TABLES = [
    'users',
    'investments',
    'categories',
    'payment_channels',
    'expenses',
    'expense_installments',
    'notes',
    'note_categories',
    'tags',
    'note_tags',
    'reminders'
];

// Verify cron secret (same as expense-reminders)
function verifyCronSecret(request: NextRequest): boolean {
    const secret = request.nextUrl.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.warn('CRON_SECRET not configured');
        return false;
    }

    return secret === cronSecret;
}

// Create email transporter
function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

// Format date for Thai timezone
function formatThaiDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok'
    });
}

// Generate backup email HTML
function generateBackupEmailHtml(
    backupDate: string,
    tableStats: { table: string; count: number }[]
): string {
    const statsHtml = tableStats.map(stat => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #2E2C24;">
                <span style="color: #FAFAFA; font-weight: 500;">${stat.table}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #2E2C24; text-align: right;">
                <span style="color: #2E7D7F; font-weight: 600;">${stat.count.toLocaleString()} records</span>
            </td>
        </tr>
    `).join('');

    const totalRecords = tableStats.reduce((sum, stat) => sum + stat.count, 0);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F0C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1C1B16 0%, #15140F 100%); border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid #2E2C24;">
            <h1 style="color: #2E7D7F; margin: 0 0 8px 0; font-size: 24px;">Database Backup</h1>
            <p style="color: #A1A1AA; margin: 0; font-size: 14px;">
                Backup created on <strong style="color: #FAFAFA;">${backupDate}</strong>
            </p>
        </div>

        <!-- Summary Card -->
        <div style="background-color: #FFFFFF; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #2E7D7F; text-align: center;">
            <p style="color: #A1A1AA; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase;">Total Records</p>
            <p style="color: #2E7D7F; margin: 0; font-size: 32px; font-weight: 700;">${totalRecords.toLocaleString()}</p>
        </div>

        <!-- Table Stats -->
        <div style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #2E2C24;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #1C1B16;">
                        <th style="padding: 12px; text-align: left; color: #71717A; font-size: 12px; text-transform: uppercase;">Table</th>
                        <th style="padding: 12px; text-align: right; color: #71717A; font-size: 12px; text-transform: uppercase;">Records</th>
                    </tr>
                </thead>
                <tbody>
                    ${statsHtml}
                </tbody>
            </table>
        </div>

        <!-- Info -->
        <div style="margin-top: 20px; padding: 16px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #2E2C24;">
            <p style="color: #A1A1AA; margin: 0; font-size: 13px;">
                Backup file is attached to this email in JSON format.<br>
                Please keep the file in a safe place.
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #2E2C24;">
            <p style="color: #71717A; font-size: 12px; margin: 0;">
                Sent from PWSN Dashboard<br>
                <span style="color: #A1A1AA;">This is an automated email. Please do not reply.</span>
            </p>
        </div>
    </div>
</body>
</html>
    `;
}

export async function GET(request: NextRequest) {
    try {
        // Verify secret
        if (!verifyCronSecret(request)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check SMTP config
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            return NextResponse.json(
                { error: 'SMTP credentials not configured' },
                { status: 500 }
            );
        }

        // Check backup email
        const backupEmail = process.env.BACKUP_EMAIL;
        if (!backupEmail) {
            return NextResponse.json(
                { error: 'BACKUP_EMAIL not configured' },
                { status: 500 }
            );
        }

        const supabase = createSupabaseAdminClient();
        const backupData: Record<string, any[]> = {};
        const tableStats: { table: string; count: number }[] = [];

        // Fetch all tables
        for (const table of BACKUP_TABLES) {
            const { data, error } = await supabase
                .from(table)
                .select('*');

            if (error) {
                console.error(`Failed to fetch ${table}:`, error);
                backupData[table] = [];
                tableStats.push({ table, count: 0 });
            } else {
                backupData[table] = data || [];
                tableStats.push({ table, count: data?.length || 0 });
            }
        }

        // Create JSON backup
        const backupDate = new Date();
        const backupJson = JSON.stringify(backupData, null, 2);
        const fileName = `pwsn_backup_${backupDate.toISOString().split('T')[0]}.json`;

        // Send email with attachment
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || `PWSN Dashboard <${process.env.SMTP_USER}>`,
            to: backupEmail,
            subject: `[PWSN] Database Backup - ${formatThaiDate(backupDate)}`,
            html: generateBackupEmailHtml(formatThaiDate(backupDate), tableStats),
            attachments: [
                {
                    filename: fileName,
                    content: backupJson,
                    contentType: 'application/json'
                }
            ]
        };

        await transporter.sendMail(mailOptions);

        const totalRecords = tableStats.reduce((sum, stat) => sum + stat.count, 0);

        return NextResponse.json({
            success: true,
            message: `Backup sent successfully to ${backupEmail}`,
            timestamp: backupDate.toISOString(),
            stats: {
                tables: tableStats.length,
                totalRecords,
                fileSize: `${(backupJson.length / 1024).toFixed(2)} KB`
            },
            tableStats
        });

    } catch (error: any) {
        console.error('Backup job error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}


