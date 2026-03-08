import React, { memo, useCallback } from 'react';
import { Input, Select } from '@/components/ui';
import { InvestmentFormData } from '@/types';

interface InvestmentDetailsProps {
    formData: InvestmentFormData;
    errors: Record<string, string>;
    onChange: (field: keyof InvestmentFormData, value: any) => void;
    clearError: (field: string) => void;
}

const InvestmentDetails: React.FC<InvestmentDetailsProps> = ({
    formData,
    errors,
    onChange,
    clearError,
}) => {

    const assetCategoryOptions = [
        { value: 'GOLD', label: 'Gold' },
        { value: 'CRYPTO', label: 'Crypto' },
        { value: 'STOCK', label: 'Stock' },
        { value: 'FUND', label: 'Fund' },
        { value: 'USD', label: 'USD' },
        { value: 'OTHER', label: 'Others' },
    ];

    const marketOptions = [
        { value: 'GOLDNOW', label: 'Gold Now' },
        { value: 'PAOTANG', label: 'Paotang' },
        { value: 'BINANCE TH', label: 'Binance TH' },
        { value: 'DIME', label: 'DIME' },
        { value: 'SET', label: 'SET' },
        { value: 'MUTUAL_FUND', label: 'Mutual Fund' },
        { value: 'OTHER', label: 'Others' },
    ];

    const strategyOptions = [
        { value: 'DCA', label: 'DCA' },
        { value: 'LONG_TERM', label: 'Long Term' },
        { value: 'TRADE', label: 'Trade' },
    ];

    const statusOptions = [
        { value: 'OPEN', label: 'Open' },
        { value: 'CLOSED', label: 'Closed' },
    ];

    const currencyOptions = [
        { value: 'THB', label: 'THB' },
        { value: 'USD', label: 'USD' },
    ];
    const handleAssetCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange('asset_code', e.target.value.toUpperCase());
        clearError('asset_code');
    }, [onChange, clearError]);

    const handleAssetNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange('asset_name', e.target.value);
        clearError('asset_name');
    }, [onChange, clearError]);

    const handleAssetCategoryChange = useCallback((value: string) => {
        onChange('asset_category', value);
    }, [onChange]);

    const handleMarketChange = useCallback((value: string) => {
        onChange('market', value);
    }, [onChange]);

    const handleStrategyChange = useCallback((value: string) => {
        onChange('strategy_type', value);
    }, [onChange]);

    const handleStatusChange = useCallback((value: string) => {
        onChange('status', value);
    }, [onChange]);

    const handleBuyDatetimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange('buy_datetime', e.target.value);
    }, [onChange]);

    const handleBuyQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange('buy_quantity', parseFloat(e.target.value) || 0);
        clearError('buy_quantity');
    }, [onChange, clearError]);

    const handleBuyPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange('buy_price_per_unit', parseFloat(e.target.value) || 0);
        clearError('buy_price_per_unit');
    }, [onChange, clearError]);

    const handleBuyCurrencyChange = useCallback((value: string) => {
        onChange('buy_currency', value);
    }, [onChange]);

    const handleBuyFeeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange('buy_fee', parseFloat(e.target.value) || 0);
    }, [onChange]);

    const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange('note', e.target.value);
    }, [onChange]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-12 gap-x-4 gap-y-3 sm:gap-y-4">
                {/* Row 1: Identity & Classification */}
                <div className="col-span-12 sm:col-span-6 md:col-span-3">
                    <Input
                        label="Asset Code"
                        placeholder="Enter Asset Code"
                        value={formData.asset_code}
                        onChange={handleAssetCodeChange}
                        error={errors.asset_code}
                        required
                    />
                </div>
                <div className="col-span-12 sm:col-span-6 md:col-span-6">
                    <Input
                        label="Asset Name"
                        placeholder="Enter Asset Name"
                        value={formData.asset_name}
                        onChange={handleAssetNameChange}
                        error={errors.asset_name}
                        required
                    />
                </div>
                <div className="col-span-12 sm:col-span-12 md:col-span-3">
                    <Select
                        label="Type"
                        options={assetCategoryOptions}
                        value={formData.asset_category}
                        onChange={handleAssetCategoryChange}
                    />
                </div>

                {/* Row 2: Market & Strategy Setup */}
                <div className="col-span-12 sm:col-span-6 md:col-span-3">
                    <Select
                        label="Market"
                        options={marketOptions}
                        value={formData.market}
                        onChange={handleMarketChange}
                    />
                </div>
                <div className="col-span-12 sm:col-span-6 md:col-span-3">
                    <Select
                        label="Strategy"
                        options={strategyOptions}
                        value={formData.strategy_type}
                        onChange={handleStrategyChange}
                    />
                </div>
                <div className="col-span-12 sm:col-span-6 md:col-span-3">
                    <Select
                        label="Status"
                        options={statusOptions}
                        value={formData.status}
                        onChange={handleStatusChange}
                    />
                </div>
                <div className="col-span-12 sm:col-span-6 md:col-span-3">
                    <Input
                        label="Buy Date"
                        type="date"
                        value={formData.buy_datetime}
                        onChange={handleBuyDatetimeChange}
                    />
                </div>

                {/* Row 3: Transaction Numbers */}
                <div className="col-span-12 sm:col-span-6 md:col-span-3">
                    <Input
                        label="Buy Quantity"
                        type="number"
                        step="0.00000001"
                        placeholder="0.00"
                        value={formData.buy_quantity || ''}
                        onChange={handleBuyQuantityChange}
                        error={errors.buy_quantity}
                        required
                    />
                </div>
                <div className="col-span-12 sm:col-span-6 md:col-span-3">
                    <Input
                        label="Price Per Unit"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.buy_price_per_unit || ''}
                        onChange={handleBuyPriceChange}
                        error={errors.buy_price_per_unit}
                        required
                    />
                </div>
                <div className="col-span-12 sm:col-span-6 md:col-span-3">
                    <Select
                        label="Currency"
                        options={currencyOptions}
                        value={formData.buy_currency}
                        onChange={handleBuyCurrencyChange}
                    />
                </div>
                <div className="col-span-12 sm:col-span-6 md:col-span-3">
                    <Input
                        label="Fee"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.buy_fee || ''}
                        onChange={handleBuyFeeChange}
                    />
                </div>

                {/* Row 4: Note */}
                <div className="col-span-12 mt-2">
                    <label 
                        htmlFor="investment-notes"
                        className="block text-sm font-medium text-muted-foreground mb-1.5 px-0.5"
                    >
                        Notes
                    </label>
                    <textarea
                        id="investment-notes"
                        className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none shadow-sm"
                        rows={3}
                        placeholder="Additional notes..."
                        value={formData.note}
                        onChange={handleNoteChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default memo(InvestmentDetails);
