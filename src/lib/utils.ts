import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getCurrentLocalDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
}

export function getCurrentLocalDate() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
}

export function formatCurrency(amount: number, currency: string = 'THB'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatNumber(num: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

export function formatQuantity(num: number): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    }).format(num);
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
    return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

export function calculateProfitLoss(
    buyQty: number,
    buyPrice: number,
    buyFee: number,
    sellHistory: { qty: number; price: number; fee: number }[]
): { profitLoss: number; percentage: number; remainingQty: number } {
    const totalBuyCost = buyQty * buyPrice + buyFee;

    let totalSellValue = 0;
    let totalSellQty = 0;
    let totalSellFee = 0;

    for (const sell of sellHistory) {
        totalSellValue += sell.qty * sell.price;
        totalSellQty += sell.qty;
        totalSellFee += sell.fee;
    }

    const remainingQty = buyQty - totalSellQty;
    const soldCostBasis = (totalSellQty / buyQty) * totalBuyCost;
    const profitLoss = totalSellValue - soldCostBasis - totalSellFee;
    const percentage = soldCostBasis > 0 ? (profitLoss / soldCostBasis) * 100 : 0;

    return { profitLoss, percentage, remainingQty };
}

export function getStatusColor(status: string): string {
    switch (status) {
        case 'OPEN':
            return 'bg-teal-100 text-teal-700';
        case 'CLOSED':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

export function getCategoryColor(category: string): string {
    switch (category) {
        case 'GOLD':
            return 'bg-yellow-100 text-yellow-800';
        case 'CRYPTO':
            return 'bg-purple-100 text-purple-800';
        case 'STOCK':
            return 'bg-blue-100 text-blue-800';
        case 'FUND':
            return 'bg-teal-100 text-teal-700';
        case 'USD':
            return 'bg-pink-100 text-pink-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

export function getStrategyColor(strategy: string): string {
    switch (strategy) {
        case 'DCA':
            return 'bg-teal-100 text-teal-800';
        case 'LONG_TERM':
            return 'bg-indigo-100 text-indigo-800';
        case 'TRADE':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}
export function getMonthlyPendingAmount(exp: any): number {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (exp.payment_type === 'FULL') {
        const d = new Date(exp.transaction_date);
        const isPending = exp.status === 'PENDING' && (
            (d.getFullYear() < currentYear) ||
            (d.getFullYear() === currentYear && d.getMonth() <= currentMonth)
        );
        return isPending ? exp.amount_total : 0;
    }

    if (exp.payment_type === 'INSTALLMENT') {
        return exp.expense_installments
            ?.filter((i: any) => {
                const due = new Date(i.due_date);
                return i.status === 'PENDING' && (
                    (due.getFullYear() < currentYear) ||
                    (due.getFullYear() === currentYear && due.getMonth() <= currentMonth)
                );
            })
            .reduce((s: number, i: any) => s + i.amount, 0) || 0;
    }

    return 0;
}

