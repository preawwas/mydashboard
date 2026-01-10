
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
