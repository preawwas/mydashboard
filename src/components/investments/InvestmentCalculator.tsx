'use client';

import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui';

// ─── Chevron Icon ───
function ChevronIcon({ open }: { open: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

// ─── Copy Button ───
function CopyButton({ value }: { value: string | null }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [value]);

    return (
        <button
            type="button"
            disabled={!value}
            onClick={handleCopy}
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Copy value"
        >
            {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
            )}
        </button>
    );
}

// ─── Collapsible Section ───
function CollapsibleSection({
    title,
    defaultOpen = true,
    headerRight,
    children,
}: {
    title: string;
    defaultOpen?: boolean;
    headerRight?: React.ReactNode;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border text-left hover:bg-muted/50 transition-colors"
            >
                <h3 className="flex-1 text-sm font-semibold text-foreground">{title}</h3>
                {headerRight && (
                    <span onClick={(e) => e.stopPropagation()}>
                        {headerRight}
                    </span>
                )}
                <ChevronIcon open={open} />
            </button>
            <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-4 space-y-3">{children}</div>
            </div>
        </div>
    );
}

// ─── Quantity Calculator ───
function QuantityCalculator() {
    const [capital, setCapital] = useState('');
    const [price, setPrice] = useState('');

    const quantity =
        capital && price && Number(price) > 0
            ? (Number(capital) / Number(price)).toString()
            : null;

    return (
        <CollapsibleSection
            title="Quantity Calculator"
        >
            <div className="grid grid-cols-2 gap-3">
                <Input
                    label="Capital"
                    type="number"
                    placeholder="3000"
                    value={capital}
                    onChange={(e) => setCapital(e.target.value)}
                    min={0}
                />
                <Input
                    label="Buy Price"
                    type="number"
                    placeholder="75500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min={0}
                />
            </div>

            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/40 border border-border">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Quantity =</span>
                <span className={`flex-1 text-sm font-mono font-bold truncate ${quantity ? 'text-primary' : 'text-muted-foreground/40'}`}>
                    {quantity ?? '—'}
                </span>
                <CopyButton value={quantity} />
            </div>
        </CollapsibleSection>
    );
}

// ─── Weighted Average Calculator ───
interface AvgRow {
    id: number;
    capital: string;
    price: string;
}

function WeightedAverageCalculator() {
    const [rows, setRows] = useState<AvgRow[]>([
        { id: 1, capital: '', price: '' },
        { id: 2, capital: '', price: '' },
    ]);
    const nextId = React.useRef(3);

    const addRow = useCallback(() => {
        setRows((prev) => [...prev, { id: nextId.current++, capital: '', price: '' }]);
    }, []);

    const removeRow = useCallback((id: number) => {
        setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
    }, []);

    const updateRow = useCallback((id: number, field: 'capital' | 'price', value: string) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    }, []);

    // Capital-weighted average: Σ(capital × price) / Σ(capital)
    const result = React.useMemo(() => {
        const validRows = rows.filter((r) => r.capital && r.price && Number(r.price) > 0 && Number(r.capital) > 0);
        if (validRows.length === 0) return null;

        const totalCapital = validRows.reduce((sum, r) => sum + Number(r.capital), 0);
        const weightedSum = validRows.reduce((sum, r) => sum + Number(r.capital) * Number(r.price), 0);
        const avgPrice = weightedSum / totalCapital;

        return { avgPrice, totalCapital, count: validRows.length };
    }, [rows]);

    const avgStr = result ? result.avgPrice.toString() : null;

    const addButton = (
        <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add
        </button>
    );

    return (
        <CollapsibleSection
            title="Average Price"
            headerRight={addButton}
        >
            {/* Header labels */}
            <div className="flex items-center gap-3 px-1">
                <span className="w-5 shrink-0" />
                <span className="flex-1 text-xs font-medium text-muted-foreground">Capital</span>
                <span className="flex-1 text-xs font-medium text-muted-foreground">Buy Price</span>
                <span className="w-7 shrink-0" />
            </div>

            <div className="space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                {rows.map((row, idx) => (
                    <div key={row.id} className="flex items-center gap-3 group">
                        <span className="text-xs text-muted-foreground w-5 shrink-0 text-right tabular-nums">{idx + 1}</span>
                        <div className="flex-1">
                            <Input
                                type="number"
                                placeholder="3000"
                                value={row.capital}
                                onChange={(e) => updateRow(row.id, 'capital', e.target.value)}
                                min={0}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                type="number"
                                placeholder="20000"
                                value={row.price}
                                onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                                min={0}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="w-7 shrink-0 flex justify-center opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                            aria-label="Remove row"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* Result */}
            <div className="space-y-1.5 px-3 py-2.5 rounded-lg bg-muted/40 border border-border">
                {result && (
                    <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Total Capital: <strong className="text-foreground">{result.totalCapital.toLocaleString()}</strong></span>
                        <span>Entries: <strong className="text-foreground">{result.count}</strong></span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Avg Price =</span>
                    <span className={`flex-1 text-sm font-mono font-bold truncate ${avgStr ? 'text-primary' : 'text-muted-foreground/40'}`}>
                        {avgStr ?? '—'}
                    </span>
                    <CopyButton value={avgStr} />
                </div>
            </div>
        </CollapsibleSection>
    );
}

// ─── Main Calculator Tab ───
const InvestmentCalculator: React.FC = () => {
    return (
        <div className="space-y-4">
            <QuantityCalculator />
            <WeightedAverageCalculator />
        </div>
    );
};

export default InvestmentCalculator;
