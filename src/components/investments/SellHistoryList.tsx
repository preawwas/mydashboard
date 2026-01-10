import React, { memo } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { SellRecord } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { currencyOptions } from '@/components/investments/options';

interface SellHistoryListProps {
    sellHistory: SellRecord[];
    errors: Record<string, string>;
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, field: keyof SellRecord, value: string | number) => void;
}

const SellHistoryList: React.FC<SellHistoryListProps> = ({
    sellHistory,
    errors,
    onAdd,
    onRemove,
    onUpdate,
}) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[#A1A1AA]">บันทึกการขายสินทรัพย์เพื่อคำนวณกำไร/ขาดทุนจริง</p>
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={onAdd}
                    leftIcon={<Plus className="w-4 h-4" />}
                >
                    เพิ่มรายการขาย
                </Button>
            </div>

            {sellHistory.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {sellHistory.map((sell, index) => (
                        <div
                            key={index}
                            className="p-4 rounded-xl bg-[#1C1B16] border border-[#2E2C24] space-y-3 relative group"
                        >
                            <div className="absolute top-2 right-2">
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className="p-1.5 text-[#A1A1AA] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-12 gap-3">
                                <div className="col-span-12 md:col-span-4">
                                    <Input
                                        label="วันที่ขาย"
                                        type="datetime-local"
                                        value={sell.datetime}
                                        onChange={(e) => onUpdate(index, 'datetime', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <Input
                                        label="จำนวน"
                                        type="number"
                                        step="0.00000001"
                                        placeholder="0.00"
                                        value={sell.qty || ''}
                                        onChange={(e) => onUpdate(index, 'qty', parseFloat(e.target.value) || 0)}
                                        error={errors[`sell_history_${index}_qty`]}
                                        required
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <Input
                                        label="ราคาขาย"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={sell.price || ''}
                                        onChange={(e) => onUpdate(index, 'price', parseFloat(e.target.value) || 0)}
                                        error={errors[`sell_history_${index}_price`]}
                                        required
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <Input
                                        label="ค่าธรรมเนียม"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={sell.fee || ''}
                                        onChange={(e) => onUpdate(index, 'fee', parseFloat(e.target.value) || 0)}
                                        error={errors[`sell_history_${index}_fee`]}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-2">
                                    <Select
                                        label="สกุลเงิน"
                                        options={currencyOptions}
                                        value={sell.currency}
                                        onChange={(value) => onUpdate(index, 'currency', value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#2E2C24] rounded-xl">
                    <p className="text-[#A1A1AA]">ยังไม่มีประวัติการขาย</p>
                    <p className="text-xs text-[#71717A] mt-1">กดปุ่ม "เพิ่มรายการขาย" ด้านบนเพื่อเริ่มบันทึก</p>
                </div>
            )}
        </div>
    );
};

export default memo(SellHistoryList);
