export type AppFeatureMode = 'all' | 'personal';

export type FeatureKey = 'dashboard' | 'investment' | 'expense' | 'journey' | 'quickNotes';

export interface FeatureFlags {
    dashboard: boolean;
    investment: boolean;
    expense: boolean;
    journey: boolean;
    quickNotes: boolean;
}

export const ALL_FEATURES: FeatureFlags = {
    dashboard: true,
    investment: true,
    expense: true,
    journey: true,
    quickNotes: true,
};

export const DEFAULT_PERSONAL_FEATURES: FeatureFlags = {
    dashboard: true,
    investment: false,
    expense: false,
    journey: true,
    quickNotes: true,
};

export const APP_MODE_LABELS: Record<AppFeatureMode, { title: string; description: string }> = {
    all: {
        title: 'All',
        description: 'Show every feature and menu tab',
    },
    personal: {
        title: 'Personal',
        description: 'Show only the features you choose below',
    },
};

export const FEATURE_CONFIG: {
    key: FeatureKey;
    label: string;
    description: string;
    href: string;
}[] = [
    { key: 'dashboard', label: 'Dashboard', description: 'Overview and summary dashboard', href: '/dashboard' },
    { key: 'investment', label: 'Investment', description: 'Track and manage your investments', href: '/investments' },
    { key: 'expense', label: 'Expense', description: 'Track and manage your daily spending', href: '/expenses' },
    { key: 'journey', label: 'Journey', description: 'Kanban board and calendar for notes', href: '/notes' },
    { key: 'quickNotes', label: 'Quick Notes', description: 'Short notes and floating quick note button', href: '/notes/short-note' },
];

export function resolveFeatureFlags(
    activeMode: AppFeatureMode,
    personalFeatures: FeatureFlags
): FeatureFlags {
    if (activeMode === 'all') return ALL_FEATURES;
    return personalFeatures;
}

export function getFirstAvailableRoute(flags: FeatureFlags): string {
    for (const feature of FEATURE_CONFIG) {
        if (flags[feature.key]) return feature.href;
    }
    return '/settings';
}

export function isRouteAllowed(pathname: string, flags: FeatureFlags): boolean {
    if (pathname === '/settings' || pathname.startsWith('/settings/')) return true;
    if (pathname === '/forpreaw') return true;

    if (flags.dashboard && pathname === '/dashboard') return true;
    if (flags.investment && (pathname === '/investments' || pathname.startsWith('/investments/'))) return true;
    if (flags.expense && (pathname === '/expenses' || pathname.startsWith('/expenses/'))) return true;
    if (flags.journey && (
        pathname === '/notes' ||
        pathname === '/notes/calendar' ||
        pathname.startsWith('/notes/calendar/') ||
        pathname === '/calendar'
    )) return true;
    if (flags.quickNotes && (pathname === '/notes/short-note' || pathname.startsWith('/notes/short-note/'))) return true;

    return false;
}
