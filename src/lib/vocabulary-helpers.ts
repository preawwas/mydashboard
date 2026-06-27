import { format, differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';

export const VOCABULARY_LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English (en)' },
    { value: 'th', label: 'Thai (th)' },
    { value: 'ja', label: 'Japanese (ja)' },
    { value: 'ko', label: 'Korean (ko)' },
    { value: 'zh', label: 'Chinese (zh)' },
    { value: 'fr', label: 'French (fr)' },
    { value: 'de', label: 'German (de)' },
] as const;

export const VOCABULARY_CSV_HEADERS = [
    'category',
    'language_code',
    'word',
    'pronunciation',
    'meaning',
    'remarks',
] as const;

export type VocabularyCsvRow = {
    category: string;
    language_code: string;
    word: string;
    pronunciation: string;
    meaning: string;
    remarks: string;
};

export function formatNextReviewLabel(
    reviewCount: number,
    nextReviewDate: string | null
): string {
    if (reviewCount >= 5) return 'ทบทวนสำเร็จแล้ว';
    if (!nextReviewDate) return 'รอทบทวน';

    const today = startOfDay(new Date());
    const target = startOfDay(parseISO(nextReviewDate));
    const diff = differenceInCalendarDays(target, today);

    if (diff <= 0) return 'วันนี้';
    if (diff === 1) return 'พรุ่งนี้';
    return `อีก ${diff} วัน`;
}

export function buildVocabularyCsvTemplate(): string {
    const header = VOCABULARY_CSV_HEADERS.join(',');
    const sample = [
        'General',
        'en',
        'serendipity',
        'seh-ren-DIP-i-tee',
        'happy accident / pleasant surprise',
        'Example: Finding this cafe was pure serendipity.',
    ]
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(',');

    return `${header}\n${sample}\n`;
}

export function downloadCsvTemplate(filename = 'vocabulary-template.csv') {
    const content = buildVocabularyCsvTemplate();
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function parseCsvLine(line: string): string[] {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"' && inQuotes && next === '"') {
            current += '"';
            i += 1;
            continue;
        }

        if (char === '"') {
            inQuotes = !inQuotes;
            continue;
        }

        if (char === ',' && !inQuotes) {
            cells.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    cells.push(current.trim());
    return cells;
}

export function parseVocabularyCsv(text: string): VocabularyCsvRow[] {
    const lines = text
        .replace(/^\uFEFF/, '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length === 0) return [];

    const headerCells = parseCsvLine(lines[0]).map((cell) => cell.toLowerCase());
    const hasHeader = VOCABULARY_CSV_HEADERS.every((key) => headerCells.includes(key));
    const dataLines = hasHeader ? lines.slice(1) : lines;

    return dataLines.map((line) => {
        const cells = parseCsvLine(line);
        const get = (index: number) => cells[index]?.trim() ?? '';

        if (hasHeader) {
            const map: Record<string, string> = {};
            headerCells.forEach((key, index) => {
                map[key] = get(index);
            });
            return {
                category: map.category || 'General',
                language_code: (map.language_code || 'en').toLowerCase(),
                word: map.word,
                pronunciation: map.pronunciation || '',
                meaning: map.meaning,
                remarks: map.remarks || '',
            };
        }

        return {
            category: get(0) || 'General',
            language_code: (get(1) || 'en').toLowerCase(),
            word: get(2),
            pronunciation: get(3),
            meaning: get(4),
            remarks: get(5),
        };
    }).filter((row) => row.word && row.meaning);
}

export function getVocabularyTranslation<T extends { vocabulary_translations?: unknown }>(
    entry: T
): {
    id?: string;
    language_code: string;
    word: string;
    pronunciation: string | null;
    meaning: string;
    remarks: string | null;
} | null {
    const value = entry.vocabulary_translations;
    if (!value) return null;
    if (Array.isArray(value)) return value[0] ?? null;
    return value as {
        id?: string;
        language_code: string;
        word: string;
        pronunciation: string | null;
        meaning: string;
        remarks: string | null;
    };
}

export type VocabularyReviewState = {
    review_count: number;
    next_review_date: string | null;
    last_reviewed_at: string | null;
};

export function computeVocabularyNextReviewDate(reviewCount: number): string | null {
    if (reviewCount >= 5) return null;
    if (reviewCount <= 0) return new Date().toISOString().slice(0, 10);

    const offsets: Record<number, number> = {
        1: 1,
        2: 2,
        3: 4,
        4: 7,
    };

    const addDays = offsets[reviewCount];
    if (!addDays) return null;

    const date = new Date();
    date.setDate(date.getDate() + addDays);
    return date.toISOString().slice(0, 10);
}

export function buildVocabularyReviewState(reviewCount: number): VocabularyReviewState {
    const normalizedCount = Math.min(Math.max(reviewCount, 0), 5);
    return {
        review_count: normalizedCount,
        next_review_date: computeVocabularyNextReviewDate(normalizedCount),
        last_reviewed_at: normalizedCount > 0 ? new Date().toISOString() : null,
    };
}

export function applyVocabularyReviewStep(
    current: VocabularyReviewState | null,
    step: number
): VocabularyReviewState | null {
    const currentCount = current?.review_count ?? 0;

    if (step <= currentCount) {
        if (step < 1 || step > currentCount) return null;
        return buildVocabularyReviewState(step - 1);
    }

    if (step === currentCount + 1 && currentCount < 5) {
        return buildVocabularyReviewState(currentCount + 1);
    }

    return null;
}

export function getVocabularyReview<T extends { vocabulary_reviews?: unknown }>(
    entry: T
): {
    review_count: number;
    next_review_date: string | null;
    last_reviewed_at: string | null;
} | null {
    const value = entry.vocabulary_reviews;
    if (!value) return null;
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw || typeof raw !== 'object') return null;

    const review = raw as {
        review_count: unknown;
        next_review_date: string | null;
        last_reviewed_at: string | null;
    };

    const count = Number(review.review_count);
    return {
        review_count: Number.isFinite(count) ? Math.min(Math.max(0, count), 5) : 0,
        next_review_date: review.next_review_date,
        last_reviewed_at: review.last_reviewed_at,
    };
}
