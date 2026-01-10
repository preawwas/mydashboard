'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button, Modal } from '@/components/ui';
import { InvestmentFormData, SellRecord } from '@/types';
import { getCurrentLocalDateTime } from '@/lib/utils';
import InvestmentDetails from './InvestmentDetails';
import SellHistoryList from './SellHistoryList';

interface InvestmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: InvestmentFormData) => Promise<void>;
    initialData?: Partial<InvestmentFormData>;
    mode: 'add' | 'edit';
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode,
}) => {
    const [activeTab, setActiveTab] = useState<'details' | 'sell_history'>('details');
    // Initialize state only once
    const [formData, setFormData] = useState<InvestmentFormData>(() => ({
        asset_category: initialData?.asset_category || 'GOLD',
        asset_code: initialData?.asset_code || '',
        asset_name: initialData?.asset_name || '',
        market: initialData?.market || 'GOLDNOW',
        strategy_type: initialData?.strategy_type || 'DCA',
        status: initialData?.status || 'OPEN',
        buy_quantity: initialData?.buy_quantity || 0,
        buy_price_per_unit: initialData?.buy_price_per_unit || 0,
        buy_currency: initialData?.buy_currency || 'THB',
        buy_fee: initialData?.buy_fee || 0,
        buy_datetime: initialData?.buy_datetime || getCurrentLocalDateTime(),
        sell_history: initialData?.sell_history || [],
        note: initialData?.note || '',
    }));

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const clearError = useCallback((field: string) => {
        setErrors(prev => {
            if (!prev[field]) return prev;
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const handleChange = useCallback((field: keyof InvestmentFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.asset_code) newErrors.asset_code = 'กรุณากรอกรหัสสินทรัพย์';
        if (!formData.asset_name) newErrors.asset_name = 'กรุณากรอกชื่อสินทรัพย์';
        if (formData.buy_quantity <= 0) newErrors.buy_quantity = 'กรุณากรอกจำนวน';
        if (formData.buy_price_per_unit <= 0) newErrors.buy_price_per_unit = 'กรุณากรอกราคา';

        // Validate Sell History
        formData.sell_history.forEach((sell, index) => {
            if (sell.qty <= 0) {
                newErrors[`sell_history_${index}_qty`] = 'กรุณากรอกจำนวน';
            }
            if (sell.price <= 0) {
                newErrors[`sell_history_${index}_price`] = 'กรุณากรอกราคา';
            }
            if (sell.fee < 0) {
                newErrors[`sell_history_${index}_fee`] = 'กรุณากรอกค่าธรรมเนียม';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addSellRecord = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            sell_history: [
                ...prev.sell_history,
                {
                    datetime: getCurrentLocalDateTime(),
                    qty: 0,
                    price: 0,
                    currency: 'THB',
                    fee: 0,
                },
            ],
        }));
    }, []);

    const updateSellRecord = useCallback((index: number, field: keyof SellRecord, value: string | number) => {
        setFormData(prev => {
            const newHistory = [...prev.sell_history];
            newHistory[index] = { ...newHistory[index], [field]: value };
            return { ...prev, sell_history: newHistory };
        });

        // Clear error for this specific field if it exists
        if (field === 'qty' || field === 'price' || field === 'fee') {
            clearError(`sell_history_${index}_${field}`);
        }
    }, [clearError]);

    const removeSellRecord = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            sell_history: prev.sell_history.filter((_, i) => i !== index)
        }));
    }, []);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'add' ? 'เพิ่มการลงทุนใหม่' : 'แก้ไขการลงทุน'}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Tabs */}
                <div className="flex border-b border-[#2E2C24] -mt-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('details')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'details'
                            ? 'border-[#F5C542] text-[#F5C542]'
                            : 'border-transparent text-[#A1A1AA] hover:text-[#FAFAFA]'
                            }`}
                    >
                        รายละเอียดการลงทุน
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('sell_history')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'sell_history'
                            ? 'border-[#F5C542] text-[#F5C542]'
                            : 'border-transparent text-[#A1A1AA] hover:text-[#FAFAFA]'
                            }`}
                    >
                        ประวัติการขาย
                        {formData.sell_history.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-[#2E2C24] text-[#F5C542]">
                                {formData.sell_history.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Details Tab */}
                <div className={`${activeTab === 'details' ? 'block' : 'hidden'} space-y-4`}>
                    <InvestmentDetails
                        formData={formData}
                        errors={errors}
                        onChange={handleChange}
                        clearError={clearError}
                    />
                </div>

                {/* Sell History Tab */}
                <div className={`${activeTab === 'sell_history' ? 'block' : 'hidden'} space-y-4`}>
                    <SellHistoryList
                        sellHistory={formData.sell_history}
                        errors={errors}
                        onAdd={addSellRecord}
                        onRemove={removeSellRecord}
                        onUpdate={updateSellRecord}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[#2E2C24]">
                    <Button type="button" variant="secondary" onClick={onClose} className="bg-[#2E2C24] text-[#FAFAFA] hover:bg-[#3E3C32] hover:text-[#FAFAFA] border border-transparent transition-all">
                        ยกเลิก
                    </Button>
                    <Button type="submit" isLoading={isLoading} className="bg-gradient-to-r from-[#F5C542] to-[#FFD54F] text-[#15140F] hover:opacity-90 border-none font-bold focus:ring-2 focus:ring-[#F5C542] focus:ring-offset-2 focus:ring-offset-[#1C1B16]">
                        {mode === 'add' ? 'บันทึก' : 'บันทึก'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default InvestmentForm;
