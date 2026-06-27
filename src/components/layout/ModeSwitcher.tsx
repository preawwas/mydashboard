'use client';

import React from 'react';
import { LayoutGrid, User } from 'lucide-react';
import { useSettingsStore } from '@/lib/store';
import { APP_MODE_LABELS, type AppFeatureMode } from '@/lib/feature-modes';
import { cn } from '@/lib/utils';

const MODES: AppFeatureMode[] = ['all', 'personal'];

const ModeSwitcher: React.FC = () => {
    const activeMode = useSettingsStore((s) => s.activeMode);
    const setActiveMode = useSettingsStore((s) => s.setActiveMode);

    return (
        <div
            className="flex items-center rounded-full border border-border/60 bg-muted/30 p-0.5"
            role="group"
            aria-label="Feature mode"
        >
            {MODES.map((mode) => {
                const isActive = activeMode === mode;
                const Icon = mode === 'all' ? LayoutGrid : User;
                return (
                    <button
                        key={mode}
                        type="button"
                        onClick={() => setActiveMode(mode)}
                        title={APP_MODE_LABELS[mode].description}
                        aria-label={`${APP_MODE_LABELS[mode].title} mode`}
                        aria-pressed={isActive}
                        className={cn(
                            'flex items-center gap-1 rounded-full px-2 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all sm:px-2.5',
                            isActive
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
                        )}
                    >
                        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="hidden sm:inline">{APP_MODE_LABELS[mode].title}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default ModeSwitcher;
