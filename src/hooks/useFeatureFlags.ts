'use client';

import { useMemo } from 'react';
import { useSettingsStore } from '@/lib/store';
import { resolveFeatureFlags, type FeatureFlags } from '@/lib/feature-modes';

export function useFeatureFlags(): FeatureFlags {
    const activeMode = useSettingsStore((s) => s.activeMode);
    const personalFeatures = useSettingsStore((s) => s.personalFeatures);

    return useMemo(
        () => resolveFeatureFlags(activeMode, personalFeatures),
        [activeMode, personalFeatures]
    );
}
