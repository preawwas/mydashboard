import React from 'react';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import LoadingTestClient from './LoadingTestClient';

export default function LoadingTestPage() {
    return (
        <div className="min-h-screen bg-neutral-900 p-8 flex flex-col items-center justify-center gap-8 relative overflow-hidden">
            <div className="z-10 bg-white/10 p-8 rounded-2xl backdrop-blur-md shadow-xl border border-white/20 text-center text-white">
                <h1 className="text-3xl font-bold mb-4 font-sans tracking-tight">Loading Screen Test</h1>
                <p className="text-white/70 mb-8 max-w-md mx-auto leading-relaxed">
                    This page demonstrates the custom "fluffy-ty" loading overlay.
                </p>
                <LoadingTestClient />
            </div>
        </div>
    );
}
