import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { createInvestmentSchema, validateRequest } from '@/lib/validation';
import { AuthUser, InvestmentFilters, SellRecord } from '@/types';

// GET /api/investments - List investments with summary stats
export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const filters: InvestmentFilters = {
            asset_category: searchParams.get('asset_category') as InvestmentFilters['asset_category'],
            strategy_type: searchParams.get('strategy_type') as InvestmentFilters['strategy_type'],
            status: searchParams.get('status') as InvestmentFilters['status'],
            search: searchParams.get('search') || undefined,
        };

        // Build query for ALL matching records to calculate stats
        let allQuery = supabase
            .from('investments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters.asset_category) {
            allQuery = allQuery.eq('asset_category', filters.asset_category);
        }
        if (filters.strategy_type) {
            allQuery = allQuery.eq('strategy_type', filters.strategy_type);
        }
        if (filters.status) {
            allQuery = allQuery.eq('status', filters.status);
        }
        if (filters.search) {
            allQuery = allQuery.or(`asset_code.ilike.%${filters.search}%,asset_name.ilike.%${filters.search}%`);
        }

        const { data: allFilteredData, error: allQueryError } = await allQuery;

        if (allQueryError) {
            console.error('Get all investments error:', allQueryError);
            return NextResponse.json(
                { success: false, error: allQueryError.message },
                { status: 500 }
            );
        }

        const allItems = allFilteredData || [];

        // Calculate aggregate stats for the filtered set
        let totalValue = 0;
        let totalProfitLoss = 0;
        let openPositions = 0;
        let closedPositions = 0;
        const assetAllocationMap = new Map<string, number>();

        const USD_TO_THB = 31.00;
        const convertToTHB = (amount: number, currency: string) => {
            if (currency === 'USD') return amount * USD_TO_THB;
            return amount;
        };

        allItems.forEach((item) => {
            if (item.status === 'OPEN') {
                openPositions++;
                const costInOriginal = (item.buy_quantity * item.buy_price_per_unit) + (item.buy_fee || 0);
                const cost = convertToTHB(costInOriginal, item.buy_currency);
                totalValue += cost;

                const currentAlloc = assetAllocationMap.get(item.asset_category) || 0;
                assetAllocationMap.set(item.asset_category, currentAlloc + cost);
            } else {
                closedPositions++;
            }

            if (item.sell_history && Array.isArray(item.sell_history)) {
                (item.sell_history as SellRecord[]).forEach((sell) => {
                    const proportionalCostInOriginal = (sell.qty / item.buy_quantity) * (item.buy_quantity * item.buy_price_per_unit + (item.buy_fee || 0));
                    const cost = convertToTHB(proportionalCostInOriginal, item.buy_currency);
                    const revenueInOriginal = sell.qty * sell.price - (sell.fee || 0);
                    const revenue = convertToTHB(revenueInOriginal, sell.currency);
                    totalProfitLoss += (revenue - cost);
                });
            }
        });

        const assetAllocation = Array.from(assetAllocationMap.entries()).map(([category, value]) => ({
            category,
            value,
            percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
        }));

        const total = allItems.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const paginatedData = allItems.slice(startIndex, startIndex + limit);

        return NextResponse.json({
            success: true,
            data: paginatedData,
            stats: {
                totalValue,
                totalProfitLoss,
                profitLossPercentage: totalValue > 0 ? (totalProfitLoss / totalValue) * 100 : 0,
                totalAssets: total,
                openPositions,
                closedPositions,
                assetAllocation
            },
            total,
            page,
            limit,
            totalPages,
        });
    } catch (error: unknown) {
        console.error('Get investments error:', error);
        return NextResponse.json(
            { success: false, error: 'An error occurred. Please try again.' },
            { status: 500 }
        );
    }
});

// POST /api/investments - Create investment
export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();
        const body = await request.json();

        const validation = validateRequest(createInvestmentSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Insert investment
        const { data: investment, error } = await supabase
            .from('investments')
            .insert({
                user_id: user.id,
                ...data,
            })
            .select()
            .single();

        if (error) {
            console.error('Create investment error:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: investment,
            message: 'Investment added successfully',
        });
    } catch (error: unknown) {
        console.error('Create investment error:', error);
        return NextResponse.json(
            { success: false, error: 'An error occurred. Please try again.' },
            { status: 500 }
        );
    }
});
