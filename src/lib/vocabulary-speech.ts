const SPEECH_LANG_MAP: Record<string, string> = {
    en: 'en-US',
    th: 'th-TH',
    ja: 'ja-JP',
    ko: 'ko-KR',
    zh: 'zh-CN',
    fr: 'fr-FR',
    de: 'de-DE',
};

const FALLBACK_LANG_CHAIN = ['en-US', 'en-GB', 'en'];

export type SpeakResult = {
    ok: boolean;
    message?: string;
};

let voicesCache: SpeechSynthesisVoice[] = [];
let speechUnlocked = false;
let voicesListenerAttached = false;

function isBrowserSpeechSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function cacheVoices() {
    if (!isBrowserSpeechSupported()) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        voicesCache = voices;
    }
}

export function warmUpSpeechSynthesis() {
    if (!isBrowserSpeechSupported()) return;

    cacheVoices();

    if (!voicesListenerAttached) {
        window.speechSynthesis.addEventListener('voiceschanged', cacheVoices);
        voicesListenerAttached = true;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
}

export function unlockSpeechSynthesis() {
    if (!isBrowserSpeechSupported()) return false;
    speechUnlocked = true;
    warmUpSpeechSynthesis();
    return true;
}

export function isSpeechUnlocked() {
    return speechUnlocked;
}

export function isSpeechSupported() {
    return isBrowserSpeechSupported();
}

export function resolveSpeechLanguage(languageCode?: string | null): string {
    if (!languageCode) return 'en-US';
    const normalized = languageCode.toLowerCase();
    return SPEECH_LANG_MAP[normalized] || normalized;
}

function getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!isBrowserSpeechSupported()) return [];
    return voicesCache.length > 0 ? voicesCache : window.speechSynthesis.getVoices();
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
    const voices = getAvailableVoices();
    const langPrefix = lang.split('-')[0].toLowerCase();

    return (
        voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase()) ||
        voices.find((voice) => voice.lang.toLowerCase().startsWith(`${langPrefix}-`)) ||
        voices.find((voice) => voice.lang.toLowerCase().startsWith(langPrefix)) ||
        voices.find((voice) => voice.default) ||
        voices.find((voice) => FALLBACK_LANG_CHAIN.some((code) => voice.lang.toLowerCase().startsWith(code.toLowerCase()))) ||
        voices[0]
    );
}

function hasVoiceForLanguage(lang: string): boolean {
    const voices = getAvailableVoices();
    const langPrefix = lang.split('-')[0].toLowerCase();
    return voices.some(
        (voice) =>
            voice.lang.toLowerCase() === lang.toLowerCase() ||
            voice.lang.toLowerCase().startsWith(`${langPrefix}-`) ||
            voice.lang.toLowerCase().startsWith(langPrefix)
    );
}

function resolveSpeakContent(
    word: string,
    languageCode?: string | null,
    pronunciation?: string | null
): { text: string; lang: string; usedPronunciationFallback: boolean } {
    const targetLang = resolveSpeechLanguage(languageCode);
    const trimmedWord = word.trim();
    const trimmedPronunciation = pronunciation?.trim() || '';

    if (hasVoiceForLanguage(targetLang)) {
        return { text: trimmedWord, lang: targetLang, usedPronunciationFallback: false };
    }

    if (trimmedPronunciation) {
        return {
            text: trimmedPronunciation,
            lang: 'en-US',
            usedPronunciationFallback: true,
        };
    }

    return { text: trimmedWord, lang: targetLang, usedPronunciationFallback: false };
}

export function speakVocabularyWord(
    word: string,
    languageCode?: string | null,
    pronunciation?: string | null
): Promise<SpeakResult> {
    return new Promise((resolve) => {
        if (!isBrowserSpeechSupported()) {
            resolve({
                ok: false,
                message: 'เบราว์เซอร์นี้ไม่รองรับการอ่านเสียง ลองใช้ Chrome หรือ Edge',
            });
            return;
        }

        if (!word.trim()) {
            resolve({ ok: false, message: 'ไม่มีคำให้อ่าน' });
            return;
        }

        if (!speechUnlocked) {
            unlockSpeechSynthesis();
        }

        cacheVoices();

        const { text, lang, usedPronunciationFallback } = resolveSpeakContent(
            word,
            languageCode,
            pronunciation
        );
        const voice = pickVoice(lang);

        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.92;
        if (voice) utterance.voice = voice;

        let settled = false;
        const finish = (result: SpeakResult) => {
            if (settled) return;
            settled = true;
            resolve(result);
        };

        utterance.onstart = () => finish({ ok: true });
        utterance.onerror = () => {
            finish({
                ok: false,
                message: usedPronunciationFallback
                    ? 'อ่านเสียงไม่ได้ ลองกรอกคำอ่านเป็นตัวอักษรโรมันหรือใช้คำภาษาอังกฤษทดสอบ'
                    : 'อ่านเสียงไม่ได้ ลองคลิกปุ่มลำโพงอีกครั้ง หรือใช้ Chrome',
            });
        };

        window.setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 50);

        window.setTimeout(() => {
            if (!settled && !window.speechSynthesis.speaking) {
                finish({
                    ok: false,
                    message: 'ยังไม่มีเสียงสำหรับภาษานี้ ลองคลิกคำภาษาอังกฤษ หรือกรอกคำอ่าน (Pronunciation)',
                });
            }
        }, 1200);
    });
}

export function stopVocabularySpeech() {
    if (!isBrowserSpeechSupported()) return;
    window.speechSynthesis.cancel();
}

export function buildVocabularyHoverTitle(options: {
    word: string;
    pronunciation?: string | null;
    meaning?: string | null;
}): string {
    const parts = ['คลิกไอคอนลำโพงหรือคำศัพท์เพื่อฟังเสียง', options.word];
    if (options.pronunciation?.trim()) parts.push(`คำอ่าน: ${options.pronunciation.trim()}`);
    if (options.meaning?.trim()) parts.push(`ความหมาย: ${options.meaning.trim()}`);
    return parts.join('\n');
}
