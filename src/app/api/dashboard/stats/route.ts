import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createSupabaseApiClient, createSupabaseAdminClient } from '@/lib/supabase-server';
import { Investment, PortfolioSummary, SellRecord } from '@/types';

// Helper to get user from token
function getUserFromRequest(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
}

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createSupabaseAdminClient();

        // Fetch all investments for the user
        const { data: investments, error } = await supabase
            .from('investments')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
            console.error('Get investments error:', error);
            return NextResponse.json(
                { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
                { status: 500 }
            );
        }

        const items = (investments || []) as Investment[];

        // Calculate stats
        let totalValue = 0;
        let totalProfitLoss = 0;
        let openPositions = 0;
        let closedPositions = 0;

        const assetAllocationMap = new Map<string, number>();

        // Exchange rate USD -> THB
        const USD_TO_THB = 31.00;
        const convertToTHB = (amount: number, currency: string) => {
            if (currency === 'USD') return amount * USD_TO_THB;
            return amount; // Already THB
        };

        items.forEach(item => {
            // Count positions
            if (item.status === 'OPEN') {
                openPositions++;

                // Calculate Portfolio Value (Cost Basis for now)
                // In a real app with market data, this would be: current_price * quantity
                // We include fee to match the existing frontend logic for 'Total Value' (Total Cost)
                const valueInOriginal = (item.buy_quantity * item.buy_price_per_unit) + (item.buy_fee || 0);
                const value = convertToTHB(valueInOriginal, item.buy_currency);
                totalValue += value;

                // Asset Allocation
                const currentAlloc = assetAllocationMap.get(item.asset_category) || 0;
                assetAllocationMap.set(item.asset_category, currentAlloc + value);
            } else {
                closedPositions++;
            }

            // Calculate Realized Profit/Loss from sell history
            if (item.sell_history && Array.isArray(item.sell_history)) {
                item.sell_history.forEach((sell: SellRecord) => {
                    // Logic: (Sell Price - Buy Price) * Sell Quantity - Sell Fee
                    // Better: Total Revenue - Proportional Buy Cost (including proportional buy fee)
                    const proportionalCostInOriginal = (sell.qty / item.buy_quantity) * (item.buy_quantity * item.buy_price_per_unit + (item.buy_fee || 0));
                    const cost = convertToTHB(proportionalCostInOriginal, item.buy_currency);

                    const revenueInOriginal = sell.qty * sell.price - (sell.fee || 0);
                    const revenue = convertToTHB(revenueInOriginal, sell.currency);

                    const profit = revenue - cost;
                    totalProfitLoss += profit;
                });
            }
        });

        const totalAssets = openPositions; // Total assets currently held

        // Format Asset Allocation
        const assetAllocation = Array.from(assetAllocationMap.entries()).map(([category, value]) => ({
            category: category as any,
            value,
            percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
        }));

        // Calculate overall P/L percentage (based on total invested capital that generated this P/L? 
        // Or just % of current portfolio? Let's do % of current portfolio value for simplicity, 
        // essentially "How much have I made relative to what I have now?")
        // A better metric might be Return on Investment (ROI) = (Net Profit / Cost of Investment) * 100
        // For now, let's leave it as a simple calculation or 0 if no value.
        const profitLossPercentage = totalValue > 0 ? (totalProfitLoss / totalValue) * 100 : 0;

        const summary: PortfolioSummary = {
            totalValue,
            totalProfitLoss,
            profitLossPercentage,
            totalAssets,
            openPositions,
            closedPositions,
            assetAllocation
        };

        return NextResponse.json({
            success: true,
            data: summary
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการคำนวณสถิติ' },
            { status: 500 }
        );
    }
}
