'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { NAV_TABS, TAB_THEMES, getNavSurfaceTint } from './nav-tabs';

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const featureFlags = useFeatureFlags();
    const navSurfaceTint = getNavSurfaceTint(pathname);

    const visibleTabs = NAV_TABS.filter((tab) => {
        if (tab.requiresDashboard && !featureFlags.dashboard) return false;
        if (tab.requiresInvestment && !featureFlags.investment) return false;
        if (tab.requiresExpense && !featureFlags.expense) return false;
        if (tab.requiresJourney && !featureFlags.journey) return false;
        if (tab.requiresQuickNotes && !featureFlags.quickNotes) return false;
        if (tab.requiresVocabulary && !featureFlags.vocabulary) return false;
        return true;
    });

    return (
        <nav
            aria-label="Main navigation"
            className="fixed top-14 md:top-16 left-0 right-0 z-30 bg-background transition-colors duration-300"
        >
            <div className="mx-auto max-w-[1600px] px-3 sm:px-6 pt-2.5">
                <div className="flex items-end pl-0.5">
                    {visibleTabs.map((tab, index) => {
                        const active = tab.isActive(pathname);
                        const theme = TAB_THEMES[tab.id];

                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                aria-label={tab.ariaLabel}
                                aria-current={active ? 'page' : undefined}
                                title={tab.ariaLabel}
                                style={{
                                    zIndex: active ? 50 : 5 + index,
                                    ...(active
                                        ? {
                                            backgroundColor: navSurfaceTint,
                                            color: theme.activeText,
                                            borderColor: navSurfaceTint,
                                        }
                                        : {
                                            backgroundColor: theme.bg,
                                            color: theme.fg,
                                            borderColor: theme.bg,
                                        }),
                                }}
                                onMouseEnter={(e) => {
                                    if (!active) e.currentTarget.style.backgroundColor = theme.hover;
                                }}
                                onMouseLeave={(e) => {
                                    if (!active) e.currentTarget.style.backgroundColor = theme.bg;
                                }}
                                className={cn(
                                    'relative flex flex-1 min-w-0 basis-0 items-center justify-center border border-b-0',
                                    'text-[10px] sm:text-[11px] font-black uppercase tracking-widest',
                                    'transition-colors duration-200 ease-out select-none rounded-t-2xl',
                                    index > 0 && '-ml-4 sm:-ml-5 md:-ml-6',
                                    active
                                        ? cn(
                                            'h-10 sm:h-11 md:h-12',
                                            'shadow-[0_-6px_16px_rgba(0,0,0,0.04)]',
                                            'pb-px mb-[-1px]'
                                        )
                                        : cn(
                                            'h-8 sm:h-9 md:h-10',
                                            'shadow-[3px_0_10px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06)]'
                                        )
                                )}
                            >
                                <span className="relative z-10 truncate px-1.5 sm:px-2">{tab.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div
                className="transition-colors duration-300"
                style={{ backgroundColor: navSurfaceTint }}
                aria-hidden="true"
            />
        </nav>
    );
};

export default Sidebar;
