'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getFirstAvailableRoute, isRouteAllowed } from '@/lib/feature-modes';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export function useFeatureModeGuard() {
    const pathname = usePathname();
    const router = useRouter();
    const featureFlags = useFeatureFlags();

    useEffect(() => {
        if (!isRouteAllowed(pathname, featureFlags)) {
            router.replace(getFirstAvailableRoute(featureFlags));
        }
    }, [pathname, featureFlags, router]);
}
