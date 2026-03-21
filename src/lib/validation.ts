import { z } from 'zod';

// ── Auth Schemas ──
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required').max(100),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateProfileSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(100),
});

// ── Expense Schemas ──
export const createExpenseSchema = z.object({
    transactionDate: z.string().min(1, 'Transaction date is required'),
    categoryId: z.string().uuid('Invalid category ID'),
    itemName: z.string().min(1, 'Item name is required').max(200),
    amount: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().positive('Amount must be positive')),
    paymentChannelId: z.string().uuid('Invalid payment channel ID'),
    paymentType: z.enum(['FULL', 'INSTALLMENT']),
    installmentPeriods: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().int().min(1)).optional(),
    necessity: z.enum(['NEED', 'WANT']),
    note: z.string().max(500).optional().nullable(),
    status: z.enum(['PAID', 'PENDING']),
});

export const updateExpenseSchema = createExpenseSchema.partial();

// ── Investment Schemas ──
export const createInvestmentSchema = z.object({
    asset_category: z.enum(['GOLD', 'CRYPTO', 'STOCK', 'FUND', 'USD', 'OTHER']),
    asset_code: z.string().min(1, 'Asset code is required').max(20),
    asset_name: z.string().min(1, 'Asset name is required').max(100),
    market: z.string().max(50).default(''),
    strategy_type: z.enum(['DCA', 'LONG_TERM', 'TRADE']),
    status: z.enum(['OPEN', 'CLOSED']),
    buy_quantity: z.number().positive('Quantity must be positive'),
    buy_price_per_unit: z.number().positive('Price must be positive'),
    buy_currency: z.string().min(1).max(10).default('THB'),
    buy_fee: z.number().min(0, 'Fee cannot be negative').default(0),
    buy_datetime: z.string().min(1, 'Buy date is required'),
    sell_history: z.array(z.object({
        datetime: z.string(),
        qty: z.number().positive(),
        price: z.number().positive(),
        currency: z.string(),
        fee: z.number().min(0),
    })).default([]),
    note: z.string().max(500).optional().nullable(),
});

export const updateInvestmentSchema = createInvestmentSchema.partial();

// ── Helper to validate and return typed result ──
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
    details: z.ZodError;
} {
    const result = schema.safeParse(data);
    if (!result.success) {
        const firstError = result.error.issues[0];
        return {
            success: false,
            error: `${firstError.path.join('.')}: ${firstError.message}`,
            details: result.error,
        };
    }
    return { success: true, data: result.data };
}
