import nodemailer from 'nodemailer';

export interface PendingExpenseItem {
    itemName: string;
    amount: number;
    date: string;
    type: 'FULL' | 'INSTALLMENT';
    periodNumber?: number;
    totalPeriods?: number;
}

export interface JourneyReminderItem {
    noteTitle: string;
    description: string;
    dueDate: string;
    status: string;
}

export interface UnifiedReminderData {
    expenses: PendingExpenseItem[];
    journey: JourneyReminderItem[];
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
            ? ` (Period ${item.periodNumber}/${item.totalPeriods})`
            : '';

        return `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #2E2C24;">
                    <span style="color: #FAFAFA; font-weight: 500;">${item.itemName}${periodLabel}</span>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #2E2C24; text-align: right;">
                    <span style="color: #2E7D7F; font-weight: 600;">THB ${item.amount.toLocaleString()}</span>
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
            <h1 style="color: #2E7D7F; margin: 0 0 8px 0; font-size: 24px;">Expense Reminder</h1>
            <p style="color: #A1A1AA; margin: 0; font-size: 14px;">
                Hello ${recipientName || 'there'}, you have <strong style="color: #FAFAFA;">${pendingItems.length} items</strong> pending payment.
            </p>
        </div>

        <!-- Summary Card -->
        <div style="background-color: #FFFFFF; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #2E7D7F; text-align: center;">
            <p style="color: #A1A1AA; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase;">Total amount due</p>
            <p style="color: #2E7D7F; margin: 0; font-size: 32px; font-weight: 700;">THB ${totalAmount.toLocaleString()}</p>
        </div>

        <!-- Items Table -->
        <div style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #2E2C24;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #1C1B16;">
                        <th style="padding: 12px; text-align: left; color: #71717A; font-size: 12px; text-transform: uppercase;">Item</th>
                        <th style="padding: 12px; text-align: right; color: #71717A; font-size: 12px; text-transform: uppercase;">Amount</th>
                        <th style="padding: 12px; text-align: right; color: #71717A; font-size: 12px; text-transform: uppercase;">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-top: 24px;">
            <a href="${dashboardUrl}" style="display: inline-block; background-color: #2E7D7F; color: #FFFFFF; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                View Details
            </a>
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
            subject: `[PWSN] Reminder: ${pendingItems.length} items pending payment (THB ${totalAmount.toLocaleString()})`,
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

// Generate Journey HTML email template
function generateJourneyEmailTemplate(
    recipientName: string,
    journeyItems: JourneyReminderItem[],
    dashboardUrl: string
): string {
    const itemsHtml = journeyItems.map(item => {
        return `
            <tr>
                <td style="padding: 16px; border-bottom: 1px solid #2E2C24;">
                    <div style="color: #FAFAFA; font-weight: 600; font-size: 16px; margin-bottom: 4px;">${item.noteTitle}</div>
                    <div style="color: #A1A1AA; font-size: 13px; line-height: 1.5;">${item.description || 'No description provided'}</div>
                </td>
                <td style="padding: 16px; border-bottom: 1px solid #2E2C24; text-align: right; vertical-align: top;">
                    <div style="display: inline-block; padding: 4px 8px; border-radius: 4px; background-color: #3B82F61A; color: #60A5FA; font-size: 11px; font-weight: 600; margin-bottom: 4px;">
                        ${item.status}
                    </div>
                    <div style="color: #A1A1AA; font-size: 12px;">Due: ${item.dueDate}</div>
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
        <div style="background: linear-gradient(135deg, #161D2E 0%, #0F1420 100%); border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid #1E293B;">
            <h1 style="color: #60A5FA; margin: 0 0 8px 0; font-size: 24px;">Journey Reminder</h1>
            <p style="color: #94A3B8; margin: 0; font-size: 14px;">
                Hello ${recipientName || 'there'}, you have <strong style="color: #FAFAFA;">${journeyItems.length} Journey tasks</strong> due today.
            </p>
        </div>

        <!-- Items Table -->
        <div style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #2E2C24;">
            <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-top: 24px;">
            <a href="${dashboardUrl}" style="display: inline-block; background-color: #3B82F6; color: #FFFFFF; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                View Journey Board
            </a>
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

// Send journey reminder email
export async function sendJourneyReminderEmail(
    recipient: EmailRecipient,
    journeyItems: JourneyReminderItem[],
    dashboardUrl: string
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.error('SMTP credentials not configured');
            return { success: false, error: 'SMTP credentials not configured' };
        }

        if (journeyItems.length === 0) {
            return { success: true };
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || `PWSN Dashboard <${process.env.SMTP_USER}>`,
            to: recipient.email,
            subject: `[PWSN] Journey Reminder: ${journeyItems.length} tasks due today`,
            html: generateJourneyEmailTemplate(
                recipient.name || '',
                journeyItems,
                dashboardUrl
            ),
        };

        await transporter.sendMail(mailOptions);
        console.log(`Journey email sent successfully to ${recipient.email}`);

        return { success: true };
    } catch (error: any) {
        console.error('Failed to send journey email:', error);
        return { success: false, error: error.message };
    }
}

// Generate Unified Daily Summary HTML email template
function generateUnifiedEmailTemplate(
    recipientName: string,
    data: UnifiedReminderData,
    dashboardUrl: string
): string {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    
    const expenseTotal = data.expenses.reduce((sum, item) => sum + item.amount, 0);
    
    const expensesHtml = data.expenses.length > 0 ? `
        <!-- Expenses Section -->
        <div style="margin-bottom: 32px;">
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <h2 style="color: #2E7D7F; margin: 0; font-size: 18px; display: flex; align-items: center;">
                    Pending Expenses
                </h2>
                <div style="margin-left: auto; background-color: #2E7D7F1A; color: #2E7D7F; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;">
                    THB ${expenseTotal.toLocaleString()}
                </div>
            </div>
            <div style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #2E2C24;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #1C1B16;">
                            <th style="padding: 12px; text-align: left; color: #71717A; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Item</th>
                            <th style="padding: 12px; text-align: right; color: #71717A; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.expenses.map(item => `
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #2E2C24;">
                                    <div style="color: #FAFAFA; font-weight: 500; font-size: 14px;">${item.itemName}${item.type === 'INSTALLMENT' ? ` <span style="color: #71717A; font-size: 12px;">(${item.periodNumber}/${item.totalPeriods})</span>` : ''}</div>
                                    <div style="color: #71717A; font-size: 11px;">Due: ${item.date}</div>
                                </td>
                                <td style="padding: 12px; border-bottom: 1px solid #2E2C24; text-align: right;">
                                    <span style="color: #2E7D7F; font-weight: 600;">THB ${item.amount.toLocaleString()}</span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="text-align: center; margin-top: 16px;">
                <a href="${dashboardUrl}/expenses" style="color: #2E7D7F; text-decoration: none; font-size: 13px; font-weight: 500;">Manage Expenses -></a>
            </div>
        </div>
    ` : '';

    const journeyHtml = data.journey.length > 0 ? `
        <!-- Journey Section -->
        <div style="margin-bottom: 16px;">
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <h2 style="color: #60A5FA; margin: 0; font-size: 18px; display: flex; align-items: center;">
                    Daily Tasks
                </h2>
                <div style="margin-left: auto; background-color: #3B82F61A; color: #60A5FA; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;">
                    ${data.journey.length} Tasks
                </div>
            </div>
            <div style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #2E2C24;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tbody>
                        ${data.journey.map(item => {
                            const isToday = item.dueDate === new Date().toISOString().split('T')[0];
                            const dueLabel = isToday ? 'Today' : item.dueDate;
                            const labelColor = isToday ? '#60A5FA' : '#EF4444'; // Red for overdue
                            const bgColor = isToday ? '#3B82F61A' : '#EF44441A';

                            return `
                                <tr>
                                    <td style="padding: 16px; border-bottom: 1px solid #2E2C24;">
                                        <div style="color: #FAFAFA; font-weight: 600; font-size: 15px; margin-bottom: 8px;">${item.noteTitle}</div>
                                        <div>
                                            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background-color: ${bgColor}; color: ${labelColor}; font-size: 10px; font-weight: 700; text-transform: uppercase;">${item.status}</span>
                                            <span style="color: ${isToday ? '#71717A' : '#EF4444'}; font-size: 11px; margin-left: 8px;">Due: ${dueLabel}</span>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <div style="text-align: center; margin-top: 16px;">
                <a href="${dashboardUrl}/notes" style="color: #60A5FA; text-decoration: none; font-size: 13px; font-weight: 500;">View Journey Board -></a>
            </div>
        </div>
    ` : '';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F0C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #FAFAFA;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1C1B16 0%, #0F0F0C 100%); border-radius: 20px; padding: 32px 24px; margin-bottom: 32px; border: 1px solid #2E2C24; text-align: center;">
            <div style="width: 60px; height: 64px; background-color: #FAFAFA; border-radius: 12px; overflow: hidden; margin: 0 auto 20px auto; border: 1px solid #2E2C24;">
                <div style="background-color: #EF4444; color: #FAFAFA; font-size: 11px; font-weight: 900; padding: 4px 0; text-transform: uppercase; letter-spacing: 1px;">${month}</div>
                <div style="color: #FFFFFF; font-size: 28px; font-weight: 800; padding-top: 6px;">${day}</div>
            </div>
            <h1 style="color: #FAFAFA; margin: 0 0 8px 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em;">Daily Summary</h1>
            <p style="color: #A1A1AA; margin: 0; font-size: 15px; line-height: 1.5;">
                Hello ${recipientName || 'there'}, here's what's on your radar for today.
            </p>
        </div>

        ${journeyHtml}
        ${expensesHtml}

        <!-- Footer -->
        <div style="text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid #2E2C24;">
            <p style="color: #71717A; font-size: 12px; margin: 0; line-height: 1.6;">
                Sent with love from <strong>PWSN Dashboard</strong><br>
                This is an automated daily overview.
            </p>
        </div>
    </div>
</body>
</html>
    `;
}

// Send unified reminder email
export async function sendUnifiedReminderEmail(
    recipient: EmailRecipient,
    data: UnifiedReminderData,
    dashboardUrl: string
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.error('SMTP credentials not configured');
            return { success: false, error: 'SMTP credentials not configured' };
        }

        const hasExpenses = data.expenses.length > 0;
        const hasJourney = data.journey.length > 0;

        if (!hasExpenses && !hasJourney) {
            return { success: true };
        }

        const transporter = createTransporter();
        
        let subject = '[PWSN] Daily Summary';
        if (hasExpenses && hasJourney) {
            subject = `[PWSN] Daily Summary: Expenses & Journey Tasks`;
        } else if (hasExpenses) {
            subject = `[PWSN] Daily Summary: Pending Expenses`;
        } else if (hasJourney) {
            subject = `[PWSN] Daily Summary: Journey Tasks`;
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM || `PWSN Dashboard <${process.env.SMTP_USER}>`,
            to: recipient.email,
            subject: subject,
            html: generateUnifiedEmailTemplate(
                recipient.name || '',
                data,
                dashboardUrl
            ),
        };

        await transporter.sendMail(mailOptions);
        console.log(`Unified email sent successfully to ${recipient.email}`);

        return { success: true };
    } catch (error: any) {
        console.error('Failed to send unified email:', error);
        return { success: false, error: error.message };
    }
}


