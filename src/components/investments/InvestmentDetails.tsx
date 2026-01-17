import React, { memo, useCallback } from 'react';
import { Input, Select } from '@/components/ui';
import { InvestmentFormData } from '@/types';
import { useTranslation } from '@/lib/useTranslation';

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
    const { t } = useTranslation();

    const assetCategoryOptions = [
        { value: 'GOLD', label: t('investment.type.gold') },
        { value: 'CRYPTO', label: t('investment.type.crypto') },
        { value: 'STOCK', label: t('investment.type.stock') },
        { value: 'USD', label: 'USD' },
        { value: 'OTHER', label: t('common.others') },
    ];

    const marketOptions = [
        { value: 'GOLDNOW', label: 'Gold Now' },
        { value: 'PAOTANG', label: 'Paotang' },
        { value: 'BINANCE TH', label: 'Binance TH' },
        { value: 'DIME', label: 'DIME' },
        { value: 'SET', label: 'SET' },
        { value: 'OTHER', label: t('common.others') },
    ];

    const strategyOptions = [
        { value: 'DCA', label: 'DCA' },
        { value: 'LONG_TERM', label: 'Long Term' },
        { value: 'TRADE', label: 'Trade' },
    ];

    const statusOptions = [
        { value: 'OPEN', label: t('investment.status.open') },
        { value: 'CLOSED', label: t('investment.status.closed') },
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
            <div className="grid grid-cols-12 gap-4">
                {/* Row 1: Identity & Classification */}
                <div className="col-span-12 md:col-span-3">
                    <Input
                        label={t('investment.assetCode')}
                        placeholder={t('investment.enterAssetCode')}
                        value={formData.asset_code}
                        onChange={handleAssetCodeChange}
                        error={errors.asset_code}
                        required
                    />
                </div>
                <div className="col-span-12 md:col-span-6">
                    <Input
                        label={t('investment.assetName')}
                        placeholder={t('investment.enterAssetName')}
                        value={formData.asset_name}
                        onChange={handleAssetNameChange}
                        error={errors.asset_name}
                        required
                    />
                </div>
                <div className="col-span-12 md:col-span-3">
                    <Select
                        label={t('investment.type.label')}
                        options={assetCategoryOptions}
                        value={formData.asset_category}
                        onChange={handleAssetCategoryChange}
                    />
                </div>

                {/* Row 2: Market & Strategy Setup */}
                <div className="col-span-12 md:col-span-3">
                    <Select
                        label={t('investment.market')}
                        options={marketOptions}
                        value={formData.market}
                        onChange={handleMarketChange}
                    />
                </div>
                <div className="col-span-12 md:col-span-3">
                    <Select
                        label={t('investment.strategy')}
                        options={strategyOptions}
                        value={formData.strategy_type}
                        onChange={handleStrategyChange}
                    />
                </div>
                <div className="col-span-12 md:col-span-3">
                    <Select
                        label={t('common.status')}
                        options={statusOptions}
                        value={formData.status}
                        onChange={handleStatusChange}
                    />
                </div>
                <div className="col-span-12 md:col-span-3">
                    <Input
                        label={t('investment.buyDate')}
                        type="datetime-local"
                        value={formData.buy_datetime}
                        onChange={handleBuyDatetimeChange}
                    />
                </div>

                {/* Row 3: Transaction Numbers */}
                <div className="col-span-12 md:col-span-3">
                    <Input
                        label={t('investment.buyQty')}
                        type="number"
                        step="0.00000001"
                        placeholder="0.00"
                        value={formData.buy_quantity || ''}
                        onChange={handleBuyQuantityChange}
                        error={errors.buy_quantity}
                        required
                    />
                </div>
                <div className="col-span-12 md:col-span-3">
                    <Input
                        label={t('investment.buyPrice')}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.buy_price_per_unit || ''}
                        onChange={handleBuyPriceChange}
                        error={errors.buy_price_per_unit}
                        required
                    />
                </div>
                <div className="col-span-12 md:col-span-3">
                    <Select
                        label={t('investment.currency')}
                        options={currencyOptions}
                        value={formData.buy_currency}
                        onChange={handleBuyCurrencyChange}
                    />
                </div>
                <div className="col-span-12 md:col-span-3">
                    <Input
                        label={t('investment.fee')}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.buy_fee || ''}
                        onChange={handleBuyFeeChange}
                    />
                </div>

                {/* Row 4: Note */}
                <div className="col-span-12">
                    <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5">
                        {t('common.notes')}
                    </label>
                    <textarea
                        className="w-full px-4 py-2.5 bg-[#1C1B16] border border-[#2E2C24] rounded-lg text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:ring-1 focus:ring-[#F5C542]/50 focus:border-[#F5C542]/50 resize-none"
                        rows={3}
                        placeholder={t('investment.notesPlaceholder')}
                        value={formData.note}
                        onChange={handleNoteChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default memo(InvestmentDetails);
