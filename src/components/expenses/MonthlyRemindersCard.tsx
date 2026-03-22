'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Expense } from '@/hooks';

interface MonthlyRemindersCardProps {
    pendingExpenses: Expense[];
    totalPending: number;
    formatDate: (dateString: string) => string;
    getMonthlyPendingAmount: (exp: Expense) => number;
    refreshAll: () => void;
}

export default function MonthlyRemindersCard({
    pendingExpenses,
    totalPending,
    formatDate,
    getMonthlyPendingAmount,
    refreshAll,
}: MonthlyRemindersCardProps) {
    const [showAll, setShowAll] = useState(false);

    if (pendingExpenses.length === 0) return null;

    const visible = showAll ? pendingExpenses : pendingExpenses.slice(0, 4);

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
                    <div className="space-y-0">
                        {visible.map((exp, idx) => {
                            let progressText = "";
                            if (exp.payment_type === 'INSTALLMENT' && exp.expense_installments) {
                                const total = exp.expense_installments.length;
                                const paid = exp.expense_installments.filter((i: any) => i.status === 'PAID').length;
                                progressText = ` (${paid}/${total})`;
                            }

                            return (
                                <div
                                    key={exp.id}
                                    className={`flex items-center justify-between py-3.5 ${idx < visible.length - 1 ? 'border-b border-white/10' : ''}`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#f59e0b]" />
                                        <span className="text-sm font-bold text-white truncate">
                                            {exp.item_name}{progressText}
                                        </span>
                                        <span className="text-[11px] shrink-0 tracking-wide text-[#f59e0b] font-bold">
                                            DUE {formatDate(exp.transaction_date)}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-white shrink-0 ml-4">
                                        ฿{getMonthlyPendingAmount(exp).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {pendingExpenses.length > 4 && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="mt-4 w-full py-3 rounded-full border border-white/20 text-[11px] font-bold tracking-widest text-white/70 uppercase hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                        >
                            {showAll ? 'Show Less' : 'View More Reminders'}
                            <svg className={`w-3.5 h-3.5 transition-transform ${showAll ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
