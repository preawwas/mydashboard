'use client';

import React, { useState } from 'react';
import { Button, Input, Select, Modal } from '@/components/ui';
import { InvestmentFormData, SellRecord } from '@/types';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface InvestmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: InvestmentFormData) => Promise<void>;
    initialData?: Partial<InvestmentFormData>;
    mode: 'add' | 'edit';
}

const assetCategoryOptions = [
    { value: 'GOLD', label: 'ทองคำ (Gold)' },
    { value: 'CRYPTO', label: 'คริปโต (Crypto)' },
    { value: 'STOCK', label: 'หุ้น (Stock)' },
];

const strategyOptions = [
    { value: 'DCA', label: 'DCA (Dollar Cost Averaging)' },
    { value: 'LONG_TERM', label: 'Long Term (ระยะยาว)' },
    { value: 'TRADE', label: 'Trade (เก็งกำไร)' },
];

const statusOptions = [
    { value: 'OPEN', label: 'เปิดอยู่ (Open)' },
    { value: 'CLOSED', label: 'ปิดแล้ว (Closed)' },
];

const currencyOptions = [
    { value: 'THB', label: 'THB (บาท)' },
    { value: 'USD', label: 'USD (ดอลลาร์)' },
];

const marketOptions = [
    { value: 'BINANCE', label: 'Binance' },
    { value: 'SET', label: 'SET (ตลาดหลักทรัพย์)' },
    { value: 'NASDAQ', label: 'NASDAQ' },
    { value: 'THAI_GOLD', label: 'ร้านทองไทย' },
    { value: 'OTHER', label: 'อื่นๆ' },
];

const InvestmentForm: React.FC<InvestmentFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode,
}) => {
    const [formData, setFormData] = useState<InvestmentFormData>({
        asset_category: initialData?.asset_category || 'CRYPTO',
        asset_code: initialData?.asset_code || '',
        asset_name: initialData?.asset_name || '',
        market: initialData?.market || 'BINANCE',
        strategy_type: initialData?.strategy_type || 'DCA',
        status: initialData?.status || 'OPEN',
        buy_quantity: initialData?.buy_quantity || 0,
        buy_price_per_unit: initialData?.buy_price_per_unit || 0,
        buy_currency: initialData?.buy_currency || 'THB',
        buy_fee: initialData?.buy_fee || 0,
        buy_datetime: initialData?.buy_datetime || new Date().toISOString().slice(0, 16),
        sell_history: initialData?.sell_history || [],
        note: initialData?.note || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.asset_code) newErrors.asset_code = 'กรุณากรอกรหัสสินทรัพย์';
        if (!formData.asset_name) newErrors.asset_name = 'กรุณากรอกชื่อสินทรัพย์';
        if (formData.buy_quantity <= 0) newErrors.buy_quantity = 'จำนวนต้องมากกว่า 0';
        if (formData.buy_price_per_unit <= 0) newErrors.buy_price_per_unit = 'ราคาต้องมากกว่า 0';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitting...', formData); // Debug log

        if (!validateForm()) {
            console.log('Validation failed', errors); // Debug log
            alert('กรุณากรอกข้อมูลให้ครบถ้วน (ตรวจสอบช่องสีแดงด้านบน)');
            return;
        }

        setIsLoading(true);
        try {
            console.log('Calling onSubmit...'); // Debug log
            await onSubmit(formData);
            // onClose() is handled by the parent component upon success
        } catch (error) {
            console.error('Form submission error:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setIsLoading(false);
        }
    };

    const addSellRecord = () => {
        setFormData({
            ...formData,
            sell_history: [
                ...formData.sell_history,
                {
                    datetime: new Date().toISOString().slice(0, 16),
                    qty: 0,
                    price: 0,
                    currency: 'THB',
                    fee: 0,
                },
            ],
        });
    };

    const updateSellRecord = (index: number, field: keyof SellRecord, value: string | number) => {
        const newHistory = [...formData.sell_history];
        newHistory[index] = { ...newHistory[index], [field]: value };
        setFormData({ ...formData, sell_history: newHistory });
    };

    const removeSellRecord = (index: number) => {
        const newHistory = formData.sell_history.filter((_, i) => i !== index);
        setFormData({ ...formData, sell_history: newHistory });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'add' ? 'เพิ่มการลงทุนใหม่' : 'แก้ไขการลงทุน'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Asset Information */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 border-b pb-2">ข้อมูลสินทรัพย์</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="ประเภทสินทรัพย์"
                            options={assetCategoryOptions}
                            value={formData.asset_category}
                            onChange={(value) => setFormData({ ...formData, asset_category: value as InvestmentFormData['asset_category'] })}
                        />
                        <Select
                            label="ตลาด"
                            options={marketOptions}
                            value={formData.market}
                            onChange={(value) => setFormData({ ...formData, market: value })}
                        />
                        <Input
                            label="รหัสสินทรัพย์"
                            placeholder="e.g., BTC, GOLD96, AAPL"
                            value={formData.asset_code}
                            onChange={(e) => setFormData({ ...formData, asset_code: e.target.value.toUpperCase() })}
                            error={errors.asset_code}
                        />
                        <Input
                            label="ชื่อสินทรัพย์"
                            placeholder="e.g., Bitcoin, ทองคำแท่ง 96.5%"
                            value={formData.asset_name}
                            onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                            error={errors.asset_name}
                        />
                    </div>
                </div>

                {/* Strategy */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 border-b pb-2">กลยุทธ์และสถานะ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="กลยุทธ์"
                            options={strategyOptions}
                            value={formData.strategy_type}
                            onChange={(value) => setFormData({ ...formData, strategy_type: value as InvestmentFormData['strategy_type'] })}
                        />
                        <Select
                            label="สถานะ"
                            options={statusOptions}
                            value={formData.status}
                            onChange={(value) => setFormData({ ...formData, status: value as InvestmentFormData['status'] })}
                        />
                    </div>
                </div>

                {/* Buy Details */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 border-b pb-2">รายละเอียดการซื้อ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="จำนวน"
                            type="number"
                            step="0.00000001"
                            placeholder="0.00"
                            value={formData.buy_quantity || ''}
                            onChange={(e) => setFormData({ ...formData, buy_quantity: parseFloat(e.target.value) || 0 })}
                            error={errors.buy_quantity}
                        />
                        <Input
                            label="ราคาต่อหน่วย"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.buy_price_per_unit || ''}
                            onChange={(e) => setFormData({ ...formData, buy_price_per_unit: parseFloat(e.target.value) || 0 })}
                            error={errors.buy_price_per_unit}
                        />
                        <Select
                            label="สกุลเงิน"
                            options={currencyOptions}
                            value={formData.buy_currency}
                            onChange={(value) => setFormData({ ...formData, buy_currency: value })}
                        />
                        <Input
                            label="ค่าธรรมเนียม"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.buy_fee || ''}
                            onChange={(e) => setFormData({ ...formData, buy_fee: parseFloat(e.target.value) || 0 })}
                        />
                        <Input
                            label="วันที่ซื้อ"
                            type="datetime-local"
                            value={formData.buy_datetime}
                            onChange={(e) => setFormData({ ...formData, buy_datetime: e.target.value })}
                            leftIcon={<Calendar className="w-4 h-4" />}
                        />
                    </div>
                </div>

                {/* Sell History */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-medium text-gray-900">ประวัติการขาย</h4>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addSellRecord}
                            leftIcon={<Plus className="w-4 h-4" />}
                        >
                            เพิ่มรายการ
                        </Button>
                    </div>

                    {formData.sell_history.length > 0 ? (
                        <div className="space-y-4">
                            {formData.sell_history.map((sell, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">รายการที่ {index + 1}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeSellRecord(index)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        <Input
                                            label="วันที่"
                                            type="datetime-local"
                                            value={sell.datetime}
                                            onChange={(e) => updateSellRecord(index, 'datetime', e.target.value)}
                                        />
                                        <Input
                                            label="จำนวน"
                                            type="number"
                                            step="0.00000001"
                                            value={sell.qty || ''}
                                            onChange={(e) => updateSellRecord(index, 'qty', parseFloat(e.target.value) || 0)}
                                        />
                                        <Input
                                            label="ราคา"
                                            type="number"
                                            step="0.01"
                                            value={sell.price || ''}
                                            onChange={(e) => updateSellRecord(index, 'price', parseFloat(e.target.value) || 0)}
                                        />
                                        <Select
                                            label="สกุลเงิน"
                                            options={currencyOptions}
                                            value={sell.currency}
                                            onChange={(value) => updateSellRecord(index, 'currency', value)}
                                        />
                                        <Input
                                            label="ค่าธรรมเนียม"
                                            type="number"
                                            step="0.01"
                                            value={sell.fee || ''}
                                            onChange={(e) => updateSellRecord(index, 'fee', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีประวัติการขาย</p>
                    )}
                </div>

                {/* Note */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 border-b pb-2">หมายเหตุ</h4>
                    <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="บันทึกเพิ่มเติม..."
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        ยกเลิก
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        {mode === 'add' ? 'เพิ่มการลงทุน' : 'บันทึกการแก้ไข'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default InvestmentForm;
