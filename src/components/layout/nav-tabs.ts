export interface TabTheme {
    bg: string;
    fg: string;
    border: string;
    hover: string;
    activeText: string;
    /** Very light tint — active tab + page content area */
    surfaceTint: string;
}

export interface NavTab {
    id: string;
    label: string;
    ariaLabel: string;
    href: string;
    isActive: (pathname: string) => boolean;
    requiresInvestment?: boolean;
    requiresExpense?: boolean;
}

export const TAB_THEMES: Record<string, TabTheme> = {
    dashboard: {
        bg: '#563526',
        fg: '#FFFFFF',
        border: '#3d2419',
        hover: '#684030',
        activeText: '#563526',
        surfaceTint: '#FAF6F4',
    },
    investment: {
        bg: '#98AD57',
        fg: '#FFFFFF',
        border: '#7a8f44',
        hover: '#a8bc68',
        activeText: '#6b7f3a',
        surfaceTint: '#F7FAF2',
    },
    expense: {
        bg: '#AEC7E0',
        fg: '#563526',
        border: '#8fb0d0',
        hover: '#bdd4eb',
        activeText: '#4a7a9e',
        surfaceTint: '#F2F7FB',
    },
    journey: {
        bg: '#1D5D5E',
        fg: '#FFFFFF',
        border: '#123F40',
        hover: '#247072',
        activeText: '#1D5D5E',
        surfaceTint: '#EFF8F8',
    },
    'quick-notes': {
        bg: '#F0EAD8',
        fg: '#563526',
        border: '#d9d0bc',
        hover: '#f5f0e3',
        activeText: '#563526',
        surfaceTint: '#FBF9F4',
    },
};

export const NAV_TABS: NavTab[] = [
    {
        id: 'dashboard',
        label: 'Dash',
        ariaLabel: 'Dashboard',
        href: '/dashboard',
        isActive: (pathname) => pathname === '/dashboard',
    },
    {
        id: 'investment',
        label: 'Invest',
        ariaLabel: 'Investment',
        href: '/investments',
        isActive: (pathname) => pathname === '/investments' || pathname.startsWith('/investments/'),
        requiresInvestment: true,
    },
    {
        id: 'expense',
        label: 'Expense',
        ariaLabel: 'Expense',
        href: '/expenses',
        isActive: (pathname) => pathname === '/expenses' || pathname.startsWith('/expenses/'),
        requiresExpense: true,
    },
    {
        id: 'journey',
        label: 'Journey',
        ariaLabel: 'Journey',
        href: '/notes',
        isActive: (pathname) =>
            pathname === '/notes' ||
            pathname === '/notes/calendar' ||
            pathname.startsWith('/notes/calendar/'),
    },
    {
        id: 'quick-notes',
        label: 'Note',
        ariaLabel: 'Notes',
        href: '/notes/short-note',
        isActive: (pathname) =>
            pathname === '/notes/short-note' || pathname.startsWith('/notes/short-note/'),
    },
];

const DEFAULT_SURFACE = '#F5F7F8';

export function resolveActiveNavTabId(pathname: string): string | null {
    const tab = NAV_TABS.find((item) => item.isActive(pathname));
    return tab?.id ?? null;
}

export function getActiveNavTheme(pathname: string): TabTheme | null {
    const id = resolveActiveNavTabId(pathname);
    return id ? TAB_THEMES[id] : null;
}

export function getNavSurfaceTint(pathname: string): string {
    const id = resolveActiveNavTabId(pathname);
    if (id && TAB_THEMES[id]) return TAB_THEMES[id].surfaceTint;
    return DEFAULT_SURFACE;
}
