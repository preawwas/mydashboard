import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function getCurrentLocalDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
}

export function formatCurrency(amount: number, currency: string = 'THB'): string {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatNumber(num: number, decimals: number = 2): string {
    return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
    return new Intl.DateTimeFormat('th-TH', {
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
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'CLOSED':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

export function getCategoryColor(category: string): string {
    switch (category) {
        case 'GOLD':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'CRYPTO':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
        case 'STOCK':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

export function getStrategyColor(strategy: string): string {
    switch (strategy) {
        case 'DCA':
            return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
        case 'LONG_TERM':
            return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
        case 'TRADE':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}
