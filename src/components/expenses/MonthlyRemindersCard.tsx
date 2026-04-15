'use client';

import React from 'react';
import { Bell, Edit } from 'lucide-react';
import { Expense } from '@/hooks';

interface MonthlyRemindersCardProps {
    pendingExpenses: Expense[];
    totalPending: number;
    formatDate: (dateString: string) => string;
    getMonthlyPendingAmount: (exp: Expense) => number;
    refreshAll: () => void;
    onEdit: (id: string) => void;
}

export default function MonthlyRemindersCard({
    pendingExpenses,
    totalPending,
    formatDate,
    getMonthlyPendingAmount,
    refreshAll,
    onEdit,
}: MonthlyRemindersCardProps) {
    if (pendingExpenses.length === 0) return null;

    return (
        <div className="bg-[#0D3B38] rounded-[16px] md:rounded-[24px] p-4 sm:p-6 md:p-8 text-white overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
                {/* Left Column */}
                <div className="lg:w-[280px] flex flex-col sm:flex-row lg:flex-col justify-between shrink-0 gap-4 sm:gap-6 lg:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <button
                            onClick={() => refreshAll()}
                            className="p-2.5 sm:p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all active:scale-95 shrink-0"
                            title="Refresh reminders"
                        >
                            <Bell className="w-5 h-5 text-white" />
                        </button>
                        <div className="min-w-0">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white uppercase tracking-tight leading-tight mb-1">
                                Monthly<br className="hidden md:inline" />Reminders
                            </h2>
                            <p className="text-sm text-white/60">
                                You have {pendingExpenses.length} pending items this month.
                            </p>
                        </div>
                    </div>
                    <div className="mt-1 sm:mt-0 lg:mt-6">
                        <div className="w-full h-[1px] bg-white/20 mb-3 md:mb-4" />
                        <p className="text-[22px] md:text-[28px] sm:text-[32px] font-extrabold text-white leading-none tracking-tight">
                            ฿{totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] font-bold tracking-widest text-white/50 uppercase mt-2">
                            Total Pending Amount
                        </p>
                    </div>
                </div>

                {/* Right Column - Reminder List */}
                <div className="flex-1 flex flex-col justify-between lg:border-l lg:border-white/10 lg:pl-8">
                    <div className="space-y-0 max-h-[240px] sm:max-h-[260px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                        {pendingExpenses.map((exp, idx) => {
                            let installmentProgress = "";
                            let displayDueDate = exp.transaction_date;
                            
                            if (exp.payment_type === 'INSTALLMENT' && exp.expense_installments) {
                                const total = exp.expense_installments.length;
                                const paid = exp.expense_installments.filter((i: any) => i.status === 'PAID').length;
                                const remaining = total - paid;
                                installmentProgress = `(${remaining}/${total})`;
                                
                                // Find the next pending installment's due_date
                                const nextPending = [...exp.expense_installments]
                                    .sort((a: any, b: any) => (a.period_number || 0) - (b.period_number || 0))
                                    .find((i: any) => i.status === 'PENDING');
                                if (nextPending?.due_date) {
                                    displayDueDate = nextPending.due_date;
                                }
                            }

                            return (
                                <div
                                    key={exp.id}
                                    className={`grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-3 py-3.5 ${idx < pendingExpenses.length - 1 ? 'border-b border-white/10' : ''}`}
                                >
                                    <div className="flex items-start gap-3 min-w-0 sm:flex-1">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#f59e0b] mt-1" />
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-white break-words">
                                                {exp.item_name}
                                            </div>
                                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                {installmentProgress && (
                                                    <span className="text-[11px] tracking-wide text-white/70 font-bold">
                                                        {installmentProgress}
                                                    </span>
                                                )}
                                                <span className="text-[11px] tracking-wide text-[#f59e0b] font-bold">
                                                    DUE {formatDate(displayDueDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(exp.id); }}
                                        className="p-2 sm:p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0 justify-self-end self-start sm:self-auto"
                                        title="Edit expense"
                                    >
                                        <Edit className="w-4 h-4 sm:w-4 sm:h-4" />
                                    </button>

                                    <div className="col-start-1 sm:hidden" />
                                    <div className="justify-self-end self-end sm:hidden">
                                        <span className="text-sm font-bold text-white tabular-nums text-right">
                                            ฿{getMonthlyPendingAmount(exp).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    <div className="hidden sm:flex items-center gap-3 sm:ml-4 shrink-0">
                                        <span className="text-sm font-bold text-white tabular-nums text-right min-w-[124px]">
                                            ฿{getMonthlyPendingAmount(exp).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
