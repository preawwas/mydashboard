import nodemailer from 'nodemailer';

export interface PendingExpenseItem {
    itemName: string;
    amount: number;
    date: string;
    type: 'FULL' | 'INSTALLMENT';
    periodNumber?: number;
    totalPeriods?: number;
}

export interface EmailRecipient {
    email: string;
    name: string | null;
}

// Create reusable transporter
function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

// Generate HTML email template
function generateEmailTemplate(
    recipientName: string,
    pendingItems: PendingExpenseItem[],
    totalAmount: number,
    dashboardUrl: string
): string {
    const itemsHtml = pendingItems.map(item => {
        const periodLabel = item.type === 'INSTALLMENT' && item.periodNumber
            ? ` (งวดที่ ${item.periodNumber}/${item.totalPeriods})`
            : '';

        return `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #2E2C24;">
                    <span style="color: #FAFAFA; font-weight: 500;">${item.itemName}${periodLabel}</span>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #2E2C24; text-align: right;">
                    <span style="color: #F5C542; font-weight: 600;">฿${item.amount.toLocaleString()}</span>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #2E2C24; text-align: right;">
                    <span style="color: #A1A1AA; font-size: 12px;">${item.date}</span>
                </td>
            </tr>
        `;
    }).join('');

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
            <h1 style="color: #F5C542; margin: 0 0 8px 0; font-size: 24px;">📋 แจ้งเตือนรายจ่าย</h1>
            <p style="color: #A1A1AA; margin: 0; font-size: 14px;">
                สวัสดี ${recipientName || 'คุณ'}, คุณมี <strong style="color: #FAFAFA;">${pendingItems.length} รายการ</strong> ที่รอชำระ
            </p>
        </div>

        <!-- Summary Card -->
        <div style="background-color: #15140F; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #F5C542; text-align: center;">
            <p style="color: #A1A1AA; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase;">ยอดรวมที่ต้องชำระ</p>
            <p style="color: #F5C542; margin: 0; font-size: 32px; font-weight: 700;">฿${totalAmount.toLocaleString()}</p>
        </div>

        <!-- Items Table -->
        <div style="background-color: #15140F; border-radius: 12px; overflow: hidden; border: 1px solid #2E2C24;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #1C1B16;">
                        <th style="padding: 12px; text-align: left; color: #71717A; font-size: 12px; text-transform: uppercase;">รายการ</th>
                        <th style="padding: 12px; text-align: right; color: #71717A; font-size: 12px; text-transform: uppercase;">จำนวน</th>
                        <th style="padding: 12px; text-align: right; color: #71717A; font-size: 12px; text-transform: uppercase;">วันที่</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-top: 24px;">
            <a href="${dashboardUrl}" style="display: inline-block; background-color: #F5C542; color: #15140F; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                ดูรายละเอียด
            </a>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #2E2C24;">
            <p style="color: #71717A; font-size: 12px; margin: 0;">
                ส่งจาก PWSN Dashboard<br>
                <span style="color: #A1A1AA;">อีเมลนี้ส่งอัตโนมัติ กรุณาอย่าตอบกลับ</span>
            </p>
        </div>
    </div>
</body>
</html>
    `;
}

// Send expense reminder email
export async function sendExpenseReminderEmail(
    recipient: EmailRecipient,
    pendingItems: PendingExpenseItem[],
    dashboardUrl: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Validate SMTP config
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.error('SMTP credentials not configured');
            return { success: false, error: 'SMTP credentials not configured' };
        }

        if (pendingItems.length === 0) {
            return { success: true }; // Nothing to send
        }

        const transporter = createTransporter();
        const totalAmount = pendingItems.reduce((sum, item) => sum + item.amount, 0);

        const mailOptions = {
            from: process.env.EMAIL_FROM || `PWSN Dashboard <${process.env.SMTP_USER}>`,
            to: recipient.email,
            subject: `📋 แจ้งเตือน: มี ${pendingItems.length} รายการรอชำระ (฿${totalAmount.toLocaleString()})`,
            html: generateEmailTemplate(
                recipient.name || '',
                pendingItems,
                totalAmount,
                dashboardUrl
            ),
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${recipient.email}`);

        return { success: true };
    } catch (error: any) {
        console.error('Failed to send email:', error);
        return { success: false, error: error.message };
    }
}
