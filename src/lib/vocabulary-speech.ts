const SPEECH_LANG_MAP: Record<string, string> = {
    en: 'en-US',
    th: 'th-TH',
    ja: 'ja-JP',
    ko: 'ko-KR',
    zh: 'zh-CN',
    fr: 'fr-FR',
    de: 'de-DE',
};

export function resolveSpeechLanguage(languageCode?: string | null): string {
    if (!languageCode) return 'en-US';
    const normalized = languageCode.toLowerCase();
    return SPEECH_LANG_MAP[normalized] || normalized;
}

export function speakVocabularyWord(word: string, languageCode?: string | null) {
    if (typeof window === 'undefined' || !word.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word.trim());
    utterance.lang = resolveSpeechLanguage(languageCode);
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
}

export function stopVocabularySpeech() {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
}

export function buildVocabularyHoverTitle(options: {
    word: string;
    pronunciation?: string | null;
    meaning?: string | null;
}): string {
    const parts = [`Hover to listen: ${options.word}`];
    if (options.pronunciation?.trim()) parts.push(`Pronunciation: ${options.pronunciation.trim()}`);
    if (options.meaning?.trim()) parts.push(`Meaning: ${options.meaning.trim()}`);
    return parts.join('\n');
}
