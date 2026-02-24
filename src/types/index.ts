// User Types
export interface User {
    id: string;
    email: string;
    name: string | null;
    role: 'user' | 'admin';
    created_at: string;
    updated_at: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    role: 'user' | 'admin';
}

export interface Category {
    id: string;
    user_id: string | null;
    name: string;
    icon: string | null;
    color: string | null;
    is_system: boolean;
    created_at: string;
    updated_at: string;
}

export interface PaymentChannel {
    id: string;
    user_id: string | null;
    name: string;
    is_active: boolean;
    is_system: boolean;
    created_at: string;
    updated_at: string;
}

// Investment Types
export type AssetCategory = 'GOLD' | 'CRYPTO' | 'STOCK' | 'FUND' | 'USD' | 'OTHER';
export type StrategyType = 'DCA' | 'LONG_TERM' | 'TRADE';
export type InvestmentStatus = 'OPEN' | 'CLOSED';

export interface SellRecord {
    datetime: string;
    qty: number;
    price: number;
    currency: string;
    fee: number;
}

// Extended SellRecord with unique ID for React key management
export interface SellRecordWithId extends SellRecord {
    _id: string;
}

export interface Investment {
    id: string;
    user_id: string;
    asset_category: AssetCategory;
    asset_code: string;
    asset_name: string;
    market: string;
    strategy_type: StrategyType;
    status: InvestmentStatus;
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

export interface InvestmentFormData {
    asset_category: AssetCategory;
    asset_code: string;
    asset_name: string;
    market: string;
    strategy_type: StrategyType;
    status: InvestmentStatus;
    buy_quantity: number;
    buy_price_per_unit: number;
    buy_currency: string;
    buy_fee: number;
    buy_datetime: string;
    sell_history: SellRecord[];
    note: string;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Filter Types
export interface InvestmentFilters {
    asset_category?: AssetCategory;
    strategy_type?: StrategyType;
    status?: InvestmentStatus;
    search?: string;
}

// Summary Types
export interface PortfolioSummary {
    totalValue: number;
    totalProfitLoss: number;
    profitLossPercentage: number;
    totalAssets: number;
    openPositions: number;
    closedPositions: number;
    assetAllocation: {
        category: AssetCategory;
        value: number;
        percentage: number;
    }[];
}

// Expense Types
export type PaymentType = 'FULL' | 'INSTALLMENT';
export type ExpenseStatus = 'PAID' | 'PENDING';
export type NecessityType = 'NEED' | 'WANT';

export interface ExpenseInstallment {
    id: string;
    expense_id: string;
    period_number: number;
    due_date: string;
    amount: number;
    status: ExpenseStatus;
    created_at: string;
    updated_at: string;
}

export interface Expense {
    id: string;
    user_id: string;
    category_id: string;
    payment_channel_id: string;
    item_name: string;
    amount_total: number;
    transaction_date: string;
    payment_type: PaymentType;
    status: ExpenseStatus;
    necessity: NecessityType;
    note: string | null;
    created_at: string;
    updated_at: string;
    categories?: Category;
    payment_channels?: PaymentChannel;
    expense_installments?: ExpenseInstallment[];
}


export type FloatingItemType = "emoji" | "image";

export interface FloatingItemConfig {
    type: FloatingItemType;
    value: string; // Emoji character or Image URL
}
