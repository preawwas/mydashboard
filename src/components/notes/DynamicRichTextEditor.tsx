'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui';

// Lazy load the heavy Tiptap editor
// ssr: false is required because Tiptap relies on browser APIs (document, window)
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
    ssr: false,
    loading: () => (
        <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
            <div className="h-[45px] border-b border-border/50 bg-muted/20 flex items-center px-4">
                <Skeleton width="60%" height={20} />
            </div>
            <div className="p-4 space-y-4">
                <Skeleton height={200} />
                <Skeleton width="40%" height={20} />
            </div>
        </div>
    ),
});

interface DynamicRichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export default function DynamicRichTextEditor(props: DynamicRichTextEditorProps) {
    return <RichTextEditor {...props} />;
}
