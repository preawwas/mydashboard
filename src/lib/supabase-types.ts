
export interface DbUser {
    id: string;
    email: string;
    name: string | null;
    role: 'user' | 'admin';
    password_hash: string;
    created_at: string;
    updated_at: string;
}

export interface DbInvestment {
    id: string;
    user_id: string;
    asset_category: 'GOLD' | 'CRYPTO' | 'STOCK';
    asset_code: string;
    asset_name: string;
    market: string;
    strategy_type: 'DCA' | 'LONG_TERM' | 'TRADE';
    status: 'OPEN' | 'CLOSED';
    buy_quantity: number;
    buy_price_per_unit: number;
    buy_currency: string;
    buy_fee: number;
    buy_datetime: string;
    sell_history: SellRecord[];
    note: string | null;
    created_at: string;
    updated_at: string;
}

export interface SellRecord {
    datetime: string;
    qty: number;
    price: number;
    currency: string;
    fee: number;
}

export interface DbCategory {
    id: string;
    user_id: string;
    name: string;
    icon: string | null;
    color: string | null;
    is_system: boolean;
    created_at: string;
    updated_at: string;
}

export interface DbPaymentChannel {
    id: string;
    user_id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface DbExpense {
    id: string;
    user_id: string;
    transaction_date: string;
    item_name: string;
    amount_total: number;
    category_id: string | null;
    payment_channel_id: string | null;
    payment_type: 'FULL' | 'INSTALLMENT';
    necessity: 'NEED' | 'WANT';
    note: string | null;
    status: 'PAID' | 'PENDING';
    created_at: string;
    updated_at: string;
}

export interface DbExpenseInstallment {
    id: string;
    user_id: string;
    expense_id: string;
    period_number: number;
    due_date: string;
    amount: number;
    status: 'PAID' | 'PENDING';
    paid_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbNoteCategory {
    note_category_id: string;
    user_id: string;
    name: string;
    color_code: string | null;
    icon: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbNote {
    note_id: string;
    user_id: string;
    note_category_id: string | null;
    title: string;
    content: string | null;
    status: 'New' | 'In Progress' | 'Urgent' | 'Done';
    is_favorite: boolean;
    is_archived: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface DbReminder {
    reminder_id: string;
    note_id: string;
    due_date: string;
    reminder_type: 'Daily' | 'Weekly';
    created_at: string;
    updated_at: string;
}
export interface DbTag {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
}

export interface DbNoteTag {
    note_id: string;
    tag_id: string;
}

export interface DbNoteWithTags extends DbNote {
    note_categories?: DbNoteCategory;
    reminders?: DbReminder;
    tags?: DbTag[];
}

export interface DbShortNote {
    note_id: string;
    user_id: string;
    title: string;
    content: string | null;
    is_favorite: boolean;
    created_at: string;
    updated_at: string;
}

export interface DbShortNoteTag {
    note_id: string;
    tag_id: string;
}

export interface DbShortNoteWithTags extends DbShortNote {
    tags?: DbTag[];
}
