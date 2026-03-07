'use client';

import React from 'react';
import { Type, CheckSquare, Table, Mic, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteToolbarProps {
    className?: string;
    onAction?: (action: string) => void;
}

const NoteToolbar: React.FC<NoteToolbarProps> = ({ className, onAction }) => {
    return (
        <div className={cn("flex items-center gap-4 py-2 px-1 border-t border-border/30", className)}>
            <button
                onClick={() => onAction?.('text')}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors group"
                title="Text Style"
            >
                <span className="text-xl font-medium">Aa</span>
            </button>

            <button
                onClick={() => onAction?.('checklist')}
                className="p-1 px-4 text-muted-foreground hover:text-foreground transition-colors group border-l border-border/50"
                title="Checklist"
            >
                <CheckSquare className="w-5 h-5" />
            </button>

            <button
                onClick={() => onAction?.('table')}
                className="p-1 px-4 text-muted-foreground hover:text-foreground transition-colors group border-l border-border/50"
                title="Insert Table"
            >
                <Table className="w-5 h-5" />
            </button>

            <button
                onClick={() => onAction?.('voice')}
                className="p-1 px-4 text-muted-foreground hover:text-foreground transition-colors group border-l border-border/50"
                title="Voice Memo"
            >
                <Mic className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1 pl-4 border-l border-border/50">
                <button
                    onClick={() => onAction?.('image')}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors group"
                    title="Upload Image"
                >
                    <ImageIcon className="w-5 h-5" />
                </button>
                <ChevronDown className="w-3 h-3 text-muted-foreground/50" />
            </div>
        </div>
    );
};

export default NoteToolbar;
