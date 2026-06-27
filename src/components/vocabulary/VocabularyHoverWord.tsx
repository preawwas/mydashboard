'use client';

import React, { useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    buildVocabularyHoverTitle,
    isSpeechUnlocked,
    speakVocabularyWord,
    unlockSpeechSynthesis,
} from '@/lib/vocabulary-speech';
import { VOCABULARY_THEME as T } from '@/lib/vocabulary-theme';
import { useToastStore } from '@/lib/store';

interface VocabularyHoverWordProps {
    word: string;
    languageCode?: string | null;
    pronunciation?: string | null;
    meaning?: string | null;
    showLanguageTag?: boolean;
    className?: string;
}

export default function VocabularyHoverWord({
    word,
    languageCode,
    pronunciation,
    meaning,
    showLanguageTag = true,
    className,
}: VocabularyHoverWordProps) {
    const { addToast } = useToastStore();
    const hoverTimerRef = useRef<number | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    if (!word) {
        return <span className={className}>-</span>;
    }

    const clearHoverTimer = () => {
        if (hoverTimerRef.current !== null) {
            window.clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
    };

    const playWord = async () => {
        unlockSpeechSynthesis();
        setIsSpeaking(true);

        const result = await speakVocabularyWord(word, languageCode, pronunciation);
        setIsSpeaking(false);

        if (!result.ok && result.message) {
            addToast(result.message, 'warning');
        }
    };

    const handleMouseEnter = () => {
        if (!isSpeechUnlocked()) return;

        clearHoverTimer();
        hoverTimerRef.current = window.setTimeout(() => {
            void playWord();
        }, 220);
    };

    const handleMouseLeave = () => {
        clearHoverTimer();
    };

    const handleWordClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        void playWord();
    };

    const handleSpeakerClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        void playWord();
    };

    const tooltip = buildVocabularyHoverTitle({ word, pronunciation, meaning });

    return (
        <span className={cn('inline-flex items-center gap-1.5', className)}>
            <button
                type="button"
                className={cn(
                    'inline-flex items-center font-semibold cursor-pointer rounded-md px-1 -mx-1',
                    'underline decoration-dotted underline-offset-4 transition-colors',
                    'hover:bg-[#EAF4F4]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7F]/40'
                )}
                style={{ textDecorationColor: `${T.favorite}88` }}
                title={tooltip}
                aria-label={`ฟังเสียงคำว่า ${word}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleWordClick}
            >
                {word}
                {showLanguageTag && languageCode ? (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                        [{languageCode}]
                    </span>
                ) : null}
            </button>

            <button
                type="button"
                onClick={handleSpeakerClick}
                className={cn(
                    'rounded-md p-1 transition-colors hover:bg-[#EAF4F4]',
                    isSpeaking && 'animate-pulse'
                )}
                style={{ color: T.favorite }}
                aria-label={`ฟังเสียงคำว่า ${word}`}
                title="ฟังเสียง"
            >
                <Volume2 className="h-4 w-4" />
            </button>
        </span>
    );
}
