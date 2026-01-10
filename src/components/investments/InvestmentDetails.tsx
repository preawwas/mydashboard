import React, { memo } from 'react';
import { Input, Select } from '@/components/ui';
import { InvestmentFormData } from '@/types';
import { assetCategoryOptions, marketOptions, strategyOptions, statusOptions, currencyOptions } from '@/components/investments/options';

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
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4">
                {/* Row 1: Identity & Classification */}
                <div className="col-span-12 md:col-span-3">
                    <Input
                        label="รหัสสินทรัพย์"
                        placeholder="BTC"
                        value={formData.asset_code}
                        onChange={(e) => {
                            onChange('asset_code', e.target.value.toUpperCase());
                            clearError('asset_code');
                        }}
                        error={errors.asset_code}
                        required
                    />
                </div>
                <div className="col-span-12 md:col-span-6">
                    <Input
                        label="ชื่อสินทรัพย์"
                        placeholder="Bitcoin"
                        value={formData.asset_name}
                        onChange={(e) => {
                            onChange('asset_name', e.target.value);
                            clearError('asset_name');
                        }}
                        error={errors.asset_name}
                        required
                    />
                </div>
                <div className="col-span-12 md:col-span-3">
                    <Select
                        label="ประเภท"
                        options={assetCategoryOptions}
                        value={formData.asset_category}
                        onChange={(value) => onChange('asset_category', value)}
                    />
                </div>

                {/* Row 2: Market & Strategy Setup */}
                <div className="col-span-12 md:col-span-3">
                    <Select
                        label="ตลาด"
                        options={marketOptions}
                        value={formData.market}
                        onChange={(value) => onChange('market', value)}
                    />
                </div>
                <div className="col-span-12 md:col-span-3">
                    <Select
                        label="กลยุทธ์"
                        options={strategyOptions}
                        value={formData.strategy_type}
                        onChange={(value) => onChange('strategy_type', value)}
                    />
                </div>
                <div className="col-span-12 md:col-span-3">
                    <Select
                        label="สถานะ"
                        options={statusOptions}
                        value={formData.status}
                        onChange={(value) => onChange('status', value)}
                    />
                </div>
                <div className="col-span-12 md:col-span-3">
                    <Input
                        label="วันที่ซื้อ"
                        type="datetime-local"
                        value={formData.buy_datetime}
                        onChange={(e) => onChange('buy_datetime', e.target.value)}
                    />
                </div>

                {/* Row 3: Transaction Numbers */}
                <div className="col-span-12 md:col-span-3">
                    <Input
                        label="จำนวนที่ซื้อ"
                        type="number"
                        step="0.00000001"
                        placeholder="0.00"
                        value={formData.buy_quantity || ''}
                        onChange={(e) => {
                            onChange('buy_quantity', parseFloat(e.target.value) || 0);
                            clearError('buy_quantity');
                        }}
                        error={errors.buy_quantity}
                        required
                    />
                </div>
                <div className="col-span-12 md:col-span-3">
                    <Input
                        label="ราคาต่อหน่วย"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.buy_price_per_unit || ''}
                        onChange={(e) => {
                            onChange('buy_price_per_unit', parseFloat(e.target.value) || 0);
                            clearError('buy_price_per_unit');
                        }}
                        error={errors.buy_price_per_unit}
                        required
                    />
                </div>
                <div className="col-span-12 md:col-span-3">
                    <Select
                        label="สกุลเงิน"
                        options={currencyOptions}
                        value={formData.buy_currency}
                        onChange={(value) => onChange('buy_currency', value)}
                    />
                </div>
                <div className="col-span-12 md:col-span-3">
                    <Input
                        label="ค่าธรรมเนียม"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.buy_fee || ''}
                        onChange={(e) => onChange('buy_fee', parseFloat(e.target.value) || 0)}
                    />
                </div>

                {/* Row 4: Note */}
                <div className="col-span-12">
                    <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5">
                        หมายเหตุ
                    </label>
                    <textarea
                        className="w-full px-4 py-2.5 bg-[#1C1B16] border border-[#2E2C24] rounded-lg text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:ring-1 focus:ring-[#F5C542]/50 focus:border-[#F5C542]/50 resize-none"
                        rows={2}
                        placeholder="บันทึกเพิ่มเติม..."
                        value={formData.note}
                        onChange={(e) => onChange('note', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default memo(InvestmentDetails);
