'use client';

import React from 'react';
import { useToastStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3" role="status" aria-live="polite">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-right-full duration-300 min-w-[300px]",
                        toast.type === 'success' && "bg-success border-success/20 text-white",
                        toast.type === 'error' && "bg-error border-error/20 text-white",
                        toast.type === 'info' && "bg-blue-500 border-blue-600 text-white",
                        toast.type === 'warning' && "bg-warning border-warning/20 text-white"
                    )}
                >
                    <div className="shrink-0 text-white" aria-hidden="true">
                        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                        {toast.type === 'error' && <XCircle className="w-5 h-5" />}
                        {toast.type === 'info' && <Info className="w-5 h-5" />}
                        {toast.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                    </div>
                    <p className="text-sm font-bold flex-1">{toast.message}</p>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Toast;
