'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

interface LoadingContextType {
    isLoading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
    isLoading: false,
    startLoading: () => { },
    stopLoading: () => { },
});

export const useLoading = () => useContext(LoadingContext);

function RouteChangeListener({ stopLoading }: { stopLoading: () => void }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        stopLoading();
    }, [pathname, searchParams, stopLoading]);

    return null;
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    // Track when loading started to ensure a minimum display time
    const loadingStartTimeRef = React.useRef<number>(0);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const startLoading = React.useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        loadingStartTimeRef.current = Date.now();
        setIsLoading(true);
    }, []);

    const stopLoading = React.useCallback(() => {
        const MIN_LOADING_TIME = 1500; // Increased to 1500ms (1.5s) minimum display time
        const timeElapsed = Date.now() - loadingStartTimeRef.current;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (isLoading && timeElapsed < MIN_LOADING_TIME) {
            // Wait for the remaining time before hiding
            timeoutRef.current = setTimeout(() => {
                setIsLoading(false);
            }, MIN_LOADING_TIME - timeElapsed);
        } else {
            // Hide immediately if not currently loading or minimum time has passed
            setIsLoading(false);
        }
    }, [isLoading]);

    // Clean up timeouts on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
            {children}
            <React.Suspense fallback={null}>
                <RouteChangeListener stopLoading={stopLoading} />
            </React.Suspense>
            {isLoading && <LoadingOverlay isVisible={true} isLoading={true} />}
        </LoadingContext.Provider>
    );
}
