'use client';
import React, { useState } from 'react';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

export default function LoadingTestClient() {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsLoading(!isLoading)}
                className="bg-white/20 hover:bg-white/30 transition-colors px-6 py-3 rounded-full font-medium shadow-lg backdrop-blur-sm"
            >
                Toggle Loading Animation: {isLoading ? 'ON' : 'OFF'}
            </button>

            {/* The overlay is always visible for testing, but we toggle the loading state */}
            <LoadingOverlay text="fluffy-ty" isVisible={true} isLoading={isLoading} />
        </>
    );
}
