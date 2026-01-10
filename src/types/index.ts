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

// Investment Types
export type AssetCategory = 'GOLD' | 'CRYPTO' | 'STOCK';
export type StrategyType = 'DCA' | 'LONG_TERM' | 'TRADE';
export type InvestmentStatus = 'OPEN' | 'CLOSED';

export interface SellRecord {
    datetime: string;
    qty: number;
    price: number;
    currency: string;
    fee: number;
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
