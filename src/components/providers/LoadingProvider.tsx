'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { PasswordModal } from '@/components/ui/PasswordModal';

interface LoadingContextType {
    isLoading: boolean;
    isAuthorized: boolean;
    setIsAuthorized: (val: boolean) => void;
    startLoading: () => void;
    stopLoading: () => void;
    handleAuthClick: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
    isLoading: false,
    isAuthorized: false,
    setIsAuthorized: () => { },
    startLoading: () => { },
    stopLoading: () => { },
    handleAuthClick: () => { },
});

export const useLoading = () => useContext(LoadingContext);

function RouteChangeListener({ stopLoading, pathname }: { stopLoading: () => void; pathname: string }) {
    const searchParams = useSearchParams();

    useEffect(() => {
        stopLoading();
    }, [pathname, searchParams, stopLoading]);

    return null;
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [authClickCount, setAuthClickCount] = useState(0);

    // Initialize authorization from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('isAuthorized');
        if (saved === 'true') {
            setIsAuthorized(true);
        }
    }, []);

    // Sync isAuthorized to localStorage
    useEffect(() => {
        if (isAuthorized) {
            localStorage.setItem('isAuthorized', 'true');
        }
    }, [isAuthorized]);

    // Show modal automatically on protected route if not authorized
    useEffect(() => {
        const isPreawRoute = pathname?.replace(/\/$/, '') === '/forpreaw';
        if (isPreawRoute && !isAuthorized) {
            setShowPasswordModal(true);
        }
    }, [pathname, isAuthorized]);

    // Track when loading started to ensure a minimum display time
    const loadingStartTimeRef = React.useRef<number>(0);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLoadingRef = React.useRef(false);

    // Keep ref in sync with state
    React.useEffect(() => {
        isLoadingRef.current = isLoading;
    }, [isLoading]);

    const startLoading = React.useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        loadingStartTimeRef.current = Date.now();
        setIsLoading(true);
    }, []);

    const stopLoading = React.useCallback(() => {
        const MIN_LOADING_TIME = 500;
        const timeElapsed = Date.now() - loadingStartTimeRef.current;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (isLoadingRef.current && timeElapsed < MIN_LOADING_TIME) {
            // Wait for the remaining time before hiding
            timeoutRef.current = setTimeout(() => {
                setIsLoading(false);
            }, MIN_LOADING_TIME - timeElapsed);
        } else {
            // Hide immediately if not currently loading or minimum time has passed
            setIsLoading(false);
        }
    }, []);

    const handleAuthClick = React.useCallback(() => {
        setAuthClickCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 5) {
                setShowPasswordModal(true);
                return 0;
            }
            return newCount;
        });
    }, []);

    const onPasswordSubmit = (password: string) => {
        if (password.toLowerCase() === 'pwsn') {
            setIsAuthorized(true);
            setShowPasswordModal(false);
            if (pathname !== '/forpreaw') {
                router.push('/forpreaw');
            }
        }
    };

    // Clean up timeouts on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const isPreawRoute = pathname?.replace(/\/$/, '') === '/forpreaw';
    const shouldShowOverlay = isLoading || (isPreawRoute && !isAuthorized);

    return (
        <LoadingContext.Provider value={{ isLoading, isAuthorized, setIsAuthorized, startLoading, stopLoading, handleAuthClick }}>
            {children}
            <React.Suspense fallback={null}>
                <RouteChangeListener stopLoading={stopLoading} pathname={pathname} />
            </React.Suspense>
            {shouldShowOverlay && (
                <LoadingOverlay 
                    isVisible={true} 
                    isLoading={isLoading} 
                />
            )}
            <PasswordModal 
                isOpen={showPasswordModal}
                onClose={() => {
                    setShowPasswordModal(false);
                    if (isPreawRoute) {
                        router.push('/dashboard');
                    }
                }}
                onSubmit={onPasswordSubmit}
            />
        </LoadingContext.Provider>
    );
}
