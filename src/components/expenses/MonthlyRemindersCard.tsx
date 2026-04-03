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
        <div className="bg-[#0D3B38] rounded-[24px] p-6 sm:p-8 text-white overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column */}
                <div className="lg:w-[280px] flex flex-col justify-between shrink-0">
                    <div>
                        <button
                            onClick={() => refreshAll()}
                            className="p-3 bg-white/10 rounded-xl mb-5 hover:bg-white/20 transition-all active:scale-95"
                            title="Refresh reminders"
                        >
                            <Bell className="w-5 h-5 text-white" />
                        </button>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-tight leading-tight mb-2">
                            Monthly<br />Reminders
                        </h2>
                        <p className="text-sm text-white/60">
                            You have {pendingExpenses.length} pending items this month.
                        </p>
                    </div>
                    <div className="mt-6">
                        <div className="w-full h-[1px] bg-white/20 mb-4" />
                        <p className="text-[28px] sm:text-[32px] font-extrabold text-white leading-none tracking-tight">
                            ฿{totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] font-bold tracking-widest text-white/50 uppercase mt-2">
                            Total Pending Amount
                        </p>
                    </div>
                </div>

                {/* Right Column - Reminder List */}
                <div className="flex-1 flex flex-col justify-between lg:border-l lg:border-white/10 lg:pl-8">
                    <div className="space-y-0 max-h-[220px] sm:max-h-[260px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
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
                                    className={`flex items-center justify-between py-3.5 ${idx < pendingExpenses.length - 1 ? 'border-b border-white/10' : ''}`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#f59e0b]" />
                                        <span className="text-sm font-bold text-white truncate">
                                            {exp.item_name}
                                        </span>
                                        {installmentProgress && (
                                            <span className="text-[11px] shrink-0 tracking-wide text-white/70 font-bold">
                                                {installmentProgress}
                                            </span>
                                        )}
                                        <span className="text-[11px] shrink-0 tracking-wide text-[#f59e0b] font-bold">
                                            DUE {formatDate(displayDueDate)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4 shrink-0">
                                        <span className="text-sm font-bold text-white">
                                            ฿{getMonthlyPendingAmount(exp).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEdit(exp.id); }}
                                            className="p-1 sm:p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
                                            title="Edit expense"
                                        >
                                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>
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
