'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import {
    buildVocabularyHoverTitle,
    speakVocabularyWord,
    stopVocabularySpeech,
} from '@/lib/vocabulary-speech';
import { VOCABULARY_THEME as T } from '@/lib/vocabulary-theme';

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
    const hoverTimerRef = useRef<number | null>(null);

    if (!word) {
        return <span className={className}>-</span>;
    }

    const handleMouseEnter = () => {
        hoverTimerRef.current = window.setTimeout(() => {
            speakVocabularyWord(word, languageCode);
        }, 250);
    };

    const handleMouseLeave = () => {
        if (hoverTimerRef.current !== null) {
            window.clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        stopVocabularySpeech();
    };

    return (
        <span
            className={cn(
                'inline-flex items-center font-semibold cursor-help',
                'underline decoration-dotted underline-offset-4',
                className
            )}
            style={{ textDecorationColor: `${T.favorite}88` }}
            title={buildVocabularyHoverTitle({ word, pronunciation, meaning })}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
            tabIndex={0}
            role="button"
            aria-label={`Listen to ${word}`}
        >
            {word}
            {showLanguageTag && languageCode ? (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                    [{languageCode}]
                </span>
            ) : null}
        </span>
    );
}
