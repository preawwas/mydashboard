import { format } from 'date-fns';

const CBF_PREFIX = /^\/cbf\b/i;

const CBF_CATEGORY_ID = 'd0094ff7-4dd2-4bb2-99c8-d98169e909fb';
const CBF_PAYMENT_SHOPEE = '34681cf9-3375-4f47-bff6-8a747c9c4b4a';
const CBF_PAYMENT_FULL = '26c3aaf7-bd82-4899-87af-b491ed6f9b12';

const CBF_EXAMPLE_FULL = '/CBF ครีม 150 เต็ม';
const CBF_EXAMPLE_INSTALLMENT = '/CBF ครีม 150 ผ่อน 3';

export interface CbfExpensePayload {
    transactionDate: string;
    categoryId: string;
    itemName: string;
    amount: string;
    paymentChannelId: string;
    paymentType: 'FULL' | 'INSTALLMENT';
    installmentPeriods?: string;
    necessity: 'WANT';
    note: string;
    status: 'PENDING';
}

function extractCbfBody(text: string): string | null {
    const trimmed = text.trim();
    const match = trimmed.match(CBF_PREFIX);
    if (!match) return null;
    return trimmed.slice(match[0].length).trim();
}

export function isCbfCommand(text: string): boolean {
    return CBF_PREFIX.test(text.trim());
}

export function parseCbfExpenseCommand(text: string): { payload: CbfExpensePayload } | { error: string } {
    const rawBody = extractCbfBody(text);
    if (rawBody === null) {
        return { error: 'Not a /CBF command' };
    }
    if (!rawBody) {
        return {
            error: `กรุณาระบุชื่อสินค้า จำนวนเงิน และรูปแบบการจ่าย (shoppee, เต็ม หรือ ผ่อน จำนวนเดือน) — ตัวอย่าง: ${CBF_EXAMPLE_FULL} หรือ ${CBF_EXAMPLE_INSTALLMENT}`,
        };
    }

    let paymentChannelId: string | null = null;
    let paymentType: 'FULL' | 'INSTALLMENT' = 'FULL';
    let installmentPeriods: string | undefined;
    let body = rawBody;

    const installmentMatch = rawBody.match(/ผ่อน\s+(\d+)/);
    if (installmentMatch) {
        paymentType = 'INSTALLMENT';
        paymentChannelId = CBF_PAYMENT_SHOPEE;
        installmentPeriods = installmentMatch[1];
        body = rawBody.replace(/ผ่อน\s+\d+/g, ' ');
    } else if (/ผ่อน/.test(rawBody)) {
        return {
            error: `ระบุจำนวนเดือนหลังคำว่า ผ่อน — ตัวอย่าง: ${CBF_EXAMPLE_INSTALLMENT}`,
        };
    } else if (/เต็ม/.test(rawBody)) {
        paymentChannelId = CBF_PAYMENT_FULL;
        body = rawBody.replace(/เต็ม/g, ' ');
    } else if (/shoppee|shopee/i.test(rawBody)) {
        paymentChannelId = CBF_PAYMENT_SHOPEE;
        body = rawBody.replace(/\bshoppee\b|\bshopee\b/gi, ' ');
    }

    if (!paymentChannelId) {
        return {
            error: `ระบุรูปแบบการจ่ายด้วย shoppee, เต็ม หรือ ผ่อน จำนวนเดือน — ตัวอย่าง: ${CBF_EXAMPLE_FULL} หรือ ${CBF_EXAMPLE_INSTALLMENT}`,
        };
    }

    body = body.replace(/\s+/g, ' ').trim();

    const parts = body.split(' ').filter(Boolean);
    const amountIndex = parts.findIndex((part) => /^\d+(\.\d+)?$/.test(part));

    if (amountIndex === -1) {
        return { error: `ไม่พบจำนวนเงิน — ตัวอย่าง: ${CBF_EXAMPLE_FULL} หรือ ${CBF_EXAMPLE_INSTALLMENT}` };
    }

    const amount = parts[amountIndex];
    const itemName = parts.filter((_, index) => index !== amountIndex).join(' ').trim();

    if (!itemName) {
        return { error: `ไม่พบชื่อรายการ — ตัวอย่าง: ${CBF_EXAMPLE_FULL} หรือ ${CBF_EXAMPLE_INSTALLMENT}` };
    }

    const payload: CbfExpensePayload = {
        transactionDate: format(new Date(), 'yyyy-MM-dd'),
        categoryId: CBF_CATEGORY_ID,
        itemName,
        amount,
        paymentChannelId,
        paymentType,
        necessity: 'WANT',
        note: '',
        status: 'PENDING',
    };

    if (paymentType === 'INSTALLMENT' && installmentPeriods) {
        payload.installmentPeriods = installmentPeriods;
    }

    return { payload };
}
