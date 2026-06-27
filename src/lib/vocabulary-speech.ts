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

export type SpeakOptions = {
    onError?: (message: string) => void;
    onEnd?: () => void;
};

let voicesCache: SpeechSynthesisVoice[] = [];
let speechUnlocked = false;
let speechPrimed = false;
let voicesListenerAttached = false;
let speakGeneration = 0;
let keepAliveInterval: number | null = null;

function isBrowserSpeechSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function isChromiumBrowser() {
    if (typeof navigator === 'undefined') return false;
    return /Chrome|Chromium|Edg|OPR/.test(navigator.userAgent);
}

function cacheVoices() {
    if (!isBrowserSpeechSupported()) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        voicesCache = voices;
    }
}

function startKeepAlive() {
    if (!isChromiumBrowser()) return;

    stopKeepAlive();
    keepAliveInterval = window.setInterval(() => {
        const synth = window.speechSynthesis;
        if (!synth.speaking && !synth.pending) {
            stopKeepAlive();
            return;
        }
        synth.pause();
        synth.resume();
    }, 100);
}

function stopKeepAlive() {
    if (keepAliveInterval !== null) {
        window.clearInterval(keepAliveInterval);
        keepAliveInterval = null;
    }
}

function primeSpeechEngine() {
    if (!isBrowserSpeechSupported() || speechPrimed) return;

    speechPrimed = true;
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance('\u200B');
    utterance.volume = 0.01;
    utterance.rate = 10;
    utterance.onend = () => {
        synth.cancel();
    };
    synth.resume();
    synth.speak(utterance);
}

export function warmUpSpeechSynthesis() {
    if (!isBrowserSpeechSupported()) return;

    cacheVoices();
    window.speechSynthesis.getVoices();

    if (!voicesListenerAttached) {
        window.speechSynthesis.addEventListener('voiceschanged', cacheVoices);
        voicesListenerAttached = true;
    }

    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }
}

export function unlockSpeechSynthesis() {
    if (!isBrowserSpeechSupported()) return false;
    speechUnlocked = true;
    warmUpSpeechSynthesis();
    primeSpeechEngine();
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
    const live = window.speechSynthesis.getVoices();
    if (live.length > 0) {
        voicesCache = live;
    }
    return voicesCache;
}

function waitForVoices(timeoutMs = 2500): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
        cacheVoices();
        const existing = getAvailableVoices();
        if (existing.length > 0) {
            resolve(existing);
            return;
        }

        const synth = window.speechSynthesis;
        const finish = () => {
            synth.removeEventListener('voiceschanged', onVoicesChanged);
            resolve(getAvailableVoices());
        };

        const timeout = window.setTimeout(finish, timeoutMs);
        const onVoicesChanged = () => {
            cacheVoices();
            if (getAvailableVoices().length > 0) {
                window.clearTimeout(timeout);
                finish();
            }
        };

        synth.addEventListener('voiceschanged', onVoicesChanged);
        synth.getVoices();
    });
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
    const voices = getAvailableVoices();
    if (voices.length === 0) return undefined;

    const langPrefix = lang.split('-')[0].toLowerCase();

    return (
        voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase()) ||
        voices.find((voice) => voice.lang.toLowerCase().startsWith(`${langPrefix}-`)) ||
        voices.find((voice) => voice.lang.toLowerCase().startsWith(langPrefix)) ||
        voices.find((voice) => voice.default) ||
        voices.find((voice) =>
            FALLBACK_LANG_CHAIN.some((code) => voice.lang.toLowerCase().startsWith(code.toLowerCase()))
        ) ||
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
): { text: string; lang: string } {
    const targetLang = resolveSpeechLanguage(languageCode);
    const trimmedWord = word.trim();
    const trimmedPronunciation = pronunciation?.trim() || '';

    if (hasVoiceForLanguage(targetLang)) {
        return { text: trimmedWord, lang: targetLang };
    }

    if (trimmedPronunciation) {
        return { text: trimmedPronunciation, lang: 'en-US' };
    }

    return { text: trimmedWord, lang: targetLang };
}

function isIgnorableSpeechError(error?: string) {
    return error === 'interrupted' || error === 'canceled' || error === 'cancelled';
}

function doSpeak(text: string, lang: string, generation: number, options?: SpeakOptions) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const voice = pickVoice(lang);
    if (voice) {
        utterance.voice = voice;
    }

    utterance.onstart = () => {
        startKeepAlive();
    };

    utterance.onend = () => {
        stopKeepAlive();
        if (generation === speakGeneration) {
            options?.onEnd?.();
        }
    };

    utterance.onerror = (event) => {
        stopKeepAlive();
        if (generation !== speakGeneration) return;
        if (isIgnorableSpeechError(event.error)) return;
        console.warn('Vocabulary speech error:', event.error, text);
        options?.onError?.('อ่านเสียงไม่ได้ ลองคลิกปุ่มลำโพงอีกครั้ง');
    };

    synth.resume();
    synth.speak(utterance);

    if (isChromiumBrowser()) {
        window.setTimeout(() => {
            if (generation !== speakGeneration) return;
            if (!synth.speaking && !synth.pending) {
                synth.resume();
                synth.speak(utterance);
            }
        }, 150);
    }
}

function queueSpeak(text: string, lang: string, generation: number, options?: SpeakOptions) {
    if (generation !== speakGeneration) return;

    const synth = window.speechSynthesis;
    if (synth.speaking || synth.pending) {
        synth.cancel();
        queueMicrotask(() => doSpeak(text, lang, generation, options));
        return;
    }

    doSpeak(text, lang, generation, options);
}

export function speakVocabularyWord(
    word: string,
    languageCode?: string | null,
    pronunciation?: string | null,
    options?: SpeakOptions
): SpeakResult {
    if (!isBrowserSpeechSupported()) {
        return {
            ok: false,
            message: 'เบราว์เซอร์นี้ไม่รองรับการอ่านเสียง',
        };
    }

    if (!word.trim()) {
        return { ok: false, message: 'ไม่มีคำให้อ่าน' };
    }

    unlockSpeechSynthesis();

    const generation = ++speakGeneration;
    const { text, lang } = resolveSpeakContent(word, languageCode, pronunciation);

    if (getAvailableVoices().length === 0) {
        void waitForVoices().then(() => queueSpeak(text, lang, generation, options));
        return { ok: true };
    }

    queueSpeak(text, lang, generation, options);
    return { ok: true };
}

export function stopVocabularySpeech() {
    if (!isBrowserSpeechSupported()) return;
    speakGeneration += 1;
    stopKeepAlive();
    window.speechSynthesis.cancel();
}

export function buildVocabularyHoverTitle(options: {
    word: string;
    pronunciation?: string | null;
    meaning?: string | null;
}): string {
    const parts = ['คลิกไอคอนลำโพงเพื่อฟังเสียง', options.word];
    if (options.pronunciation?.trim()) parts.push(`คำอ่าน: ${options.pronunciation.trim()}`);
    if (options.meaning?.trim()) parts.push(`ความหมาย: ${options.meaning.trim()}`);
    return parts.join('\n');
}
