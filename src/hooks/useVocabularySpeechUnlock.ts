'use client';

import { useEffect } from 'react';
import { unlockSpeechSynthesis, warmUpSpeechSynthesis } from '@/lib/vocabulary-speech';

export function useVocabularySpeechUnlock() {
    useEffect(() => {
        warmUpSpeechSynthesis();

        const unlock = () => {
            unlockSpeechSynthesis();
        };

        window.addEventListener('pointerdown', unlock, { once: true });
        return () => window.removeEventListener('pointerdown', unlock);
    }, []);
}
