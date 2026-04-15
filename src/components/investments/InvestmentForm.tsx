'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Button, Modal } from '@/components/ui';
import { InvestmentFormData, SellRecord, SellRecordWithId } from '@/types';
import { getCurrentLocalDate } from '@/lib/utils';
import InvestmentDetails from './InvestmentDetails';
import SellHistoryList from './SellHistoryList';
import InvestmentCalculator from './InvestmentCalculator';

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
    const [activeTab, setActiveTab] = useState<'details' | 'sell_history' | 'calculator'>('details');
    const [calcKey, setCalcKey] = useState(0);
    const idCounterRef = useRef(0);

    // Generate unique ID for each sell record
    const generateId = useCallback(() => {
        idCounterRef.current += 1;
        return `sell_${Date.now()}_${idCounterRef.current}`;
    }, []);

    const getDefaultFormData = useCallback((): InvestmentFormData & { sell_history: SellRecordWithId[] } => ({
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
        buy_datetime: (initialData?.buy_datetime || getCurrentLocalDate()).slice(0, 10),
        sell_history: (initialData?.sell_history || []).map((s, i) => ({ ...s, _id: `init_${i}`, datetime: s.datetime.slice(0, 10) })),
        note: initialData?.note || '',
    }), [initialData]);

    const [formData, setFormData] = useState(getDefaultFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Reset form when modal opens with new data
    useEffect(() => {
        if (isOpen) {
            setFormData(getDefaultFormData());
            setErrors({});
            setActiveTab('details');
            setCalcKey(k => k + 1);
            idCounterRef.current = 0;
        }
    }, [isOpen, getDefaultFormData]);

    // Automatically set status to CLOSED if there is sell history
    useEffect(() => {
        if (formData.sell_history.length > 0 && formData.status !== 'CLOSED') {
            setFormData(prev => ({ ...prev, status: 'CLOSED' }));
        }
    }, [formData.sell_history.length, formData.status]);


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

        if (!formData.asset_code) newErrors.asset_code = 'Asset code is required';
        if (!formData.asset_name) newErrors.asset_name = 'Asset name is required';
        if (formData.buy_quantity <= 0) newErrors.buy_quantity = 'Quantity is required';
        if (formData.buy_price_per_unit <= 0) newErrors.buy_price_per_unit = 'Price is required';

        // Validate Sell History
        formData.sell_history.forEach((sell, index) => {
            if (sell.qty <= 0) {
                newErrors[`sell_history_${index}_qty`] = 'Quantity is required';
            }
            if (sell.price <= 0) {
                newErrors[`sell_history_${index}_price`] = 'Price is required';
            }
            if (sell.fee < 0) {
                newErrors[`sell_history_${index}_fee`] = 'Fee is required';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || !validateForm()) {
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
        const newId = generateId();
        setFormData(prev => ({
            ...prev,
            sell_history: [
                ...prev.sell_history,
                {
                    _id: newId,
                    datetime: getCurrentLocalDate(),
                    qty: 0,
                    price: 0,
                    currency: 'THB',
                    fee: 0,
                },
            ],
        }));
    }, [generateId]);

    const updateSellRecord = useCallback((index: number, field: keyof SellRecordWithId, value: string | number) => {
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
            sell_history: prev.sell_history.filter((_, i): _ is SellRecordWithId => i !== index)
        }));

        // Clear errors associated with the removed index
        setErrors(prev => {
            const newErrors = { ...prev };
            // We need to clear errors for the specific index being removed
            // Note: Since we are removing by index, subsequent indices will shift.
            // A more robust approach if we were using IDs for validation keys would be better,
            // but for now, we simply clear the specific keys for this index.
            // CAUTION: If we remove index 0, index 1 becomes index 0. Re-validating on submit handles new structure,
            // but clearing old specific errors prevents ghost errors if we re-add immediately.
            delete newErrors[`sell_history_${index}_qty`];
            delete newErrors[`sell_history_${index}_price`];
            delete newErrors[`sell_history_${index}_fee`];
            return newErrors;
        });
    }, []);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'add' ? 'ADD NEW INVESTMENT' : 'EDIT INVESTMENT'}
            size="xl"
            className="max-w-[950px]"
        >
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Tabs */}
                <div className="flex border-b border-border -mt-2 overflow-x-auto scrollbar-hide -webkit-overflow-scrolling-touch" role="tablist">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'details'}
                        aria-controls="details-panel"
                        onClick={() => setActiveTab('details')}
                        className={`px-4 sm:px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'details'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Investment Details
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'sell_history'}
                        aria-controls="sell-history-panel"
                        onClick={() => setActiveTab('sell_history')}
                        className={`px-4 sm:px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'sell_history'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Sell History
                        {formData.sell_history.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-bold">
                                {formData.sell_history.length}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'calculator'}
                        aria-controls="calculator-panel"
                        onClick={() => setActiveTab('calculator')}
                        className={`px-4 sm:px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'calculator'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Calculator
                    </button>
                </div>

                {/* Details Tab */}
                <div 
                    id="details-panel"
                    role="tabpanel"
                    aria-labelledby="details-tab"
                    className={`${activeTab === 'details' ? 'block' : 'hidden'} space-y-4 min-h-[300px] sm:min-h-[380px]`}
                >
                    <InvestmentDetails
                        formData={formData}
                        errors={errors}
                        onChange={handleChange}
                        clearError={clearError}
                    />
                </div>

                {/* Sell History Tab */}
                <div 
                    id="sell-history-panel"
                    role="tabpanel"
                    aria-labelledby="sell-history-tab"
                    className={`${activeTab === 'sell_history' ? 'block' : 'hidden'} space-y-4 h-[300px] sm:h-[380px] overflow-y-auto custom-scrollbar`}
                >
                    <SellHistoryList
                        sellHistory={formData.sell_history}
                        errors={errors}
                        onAdd={addSellRecord}
                        onRemove={removeSellRecord}
                        onUpdate={updateSellRecord}
                    />
                </div>

                {/* Calculator Tab */}
                <div 
                    id="calculator-panel"
                    role="tabpanel"
                    aria-labelledby="calculator-tab"
                    className={`${activeTab === 'calculator' ? 'block' : 'hidden'} space-y-4 h-[300px] sm:h-[380px] overflow-y-auto custom-scrollbar`}
                >
                    <InvestmentCalculator key={calcKey} />
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-border flex-shrink-0">
                    <Button type="button" variant="secondary" onClick={onClose} className="px-4 sm:px-6 w-full md:w-auto">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading} className="px-4 sm:px-6 w-full md:w-auto">
                        Save
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default InvestmentForm;
