import React, { memo, useCallback } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { SellRecordWithId } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface SellHistoryListProps {
    sellHistory: SellRecordWithId[];
    errors: Record<string, string>;
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, field: keyof SellRecordWithId, value: string | number) => void;
}

const SellHistoryList: React.FC<SellHistoryListProps> = ({
    sellHistory,
    errors,
    onAdd,
    onRemove,
    onUpdate,
}) => {
    const currencyOptions = [
        { value: 'THB', label: 'THB' },
        { value: 'USD', label: 'USD' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Record sell transactions to calculate actual profit/loss.</p>
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={onAdd}
                    leftIcon={<Plus className="w-4 h-4" />}
                >
                    Add Sell Record
                </Button>
            </div>

            {sellHistory.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {sellHistory.map((sell, index) => (
                        <div
                            key={sell._id}
                            className="p-4 rounded-xl bg-card border border-border space-y-3 relative group"
                        >
                            <div className="absolute top-2 right-2">
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-12 gap-3">
                                <div className="col-span-12 sm:col-span-6 md:col-span-4">
                                    <Input
                                        label="Sell Date"
                                        type="date"
                                        value={sell.datetime}
                                        onChange={(e) => onUpdate(index, 'datetime', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-6 md:col-span-2">
                                    <Input
                                        label="Quantity"
                                        type="number"
                                        step="0.00000001"
                                        placeholder="0.00"
                                        value={sell.qty || ''}
                                        onChange={(e) => onUpdate(index, 'qty', parseFloat(e.target.value) || 0)}
                                        error={errors[`sell_history_${index}_qty`]}
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-6 md:col-span-2">
                                    <Input
                                        label="Sell Price"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={sell.price || ''}
                                        onChange={(e) => onUpdate(index, 'price', parseFloat(e.target.value) || 0)}
                                        error={errors[`sell_history_${index}_price`]}
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-6 md:col-span-2">
                                    <Input
                                        label="Fee"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={sell.fee || ''}
                                        onChange={(e) => onUpdate(index, 'fee', parseFloat(e.target.value) || 0)}
                                        error={errors[`sell_history_${index}_fee`]}
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-6 md:col-span-2">
                                    <Select
                                        label="Currency"
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
                <div className="flex flex-col items-center justify-center min-h-[320px] border-2 border-dashed border-border rounded-xl">
                    <p className="text-muted-foreground">No sell history.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Click button above to add record.</p>
                </div>
            )}
        </div>
    );
};

export default memo(SellHistoryList);
