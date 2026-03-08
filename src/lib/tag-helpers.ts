export const TAG_COLORS = [
    { label: 'Primary', value: 'bg-primary/10 text-[#6D28D9] border-primary/20' },
    { label: 'Red', value: 'bg-red-500/10 text-red-700 border-red-500/20' },
    { label: 'Orange', value: 'bg-orange-500/10 text-orange-700 border-orange-500/20' },
    { label: 'Amber', value: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
    { label: 'Green', value: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
    { label: 'Blue', value: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
    { label: 'Indigo', value: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20' },
    { label: 'Purple', value: 'bg-purple-500/10 text-purple-700 border-purple-500/20' },
    { label: 'Pink', value: 'bg-pink-500/10 text-pink-700 border-pink-500/20' },
];

export interface ParsedTag {
    id: string;
    text: string;
    colorClasses: string;
}

export const parseTag = (tag: { id: string; name: string }): ParsedTag => {
    // 1. Try to parse new format: text|#|colorIndex
    if (tag.name.includes('|#|')) {
        const parts = tag.name.split('|#|');
        if (parts.length === 2) {
            const text = parts[0];
            const colorIndex = parseInt(parts[1], 10);
            if (!isNaN(colorIndex) && colorIndex >= 0 && colorIndex < TAG_COLORS.length) {
                return {
                    id: tag.id,
                    text,
                    colorClasses: TAG_COLORS[colorIndex].value
                };
            }
        }
    }

    // 2. Try JSON (Fallback for any that happened to be short enough to save)
    try {
        const parsed = JSON.parse(tag.name);
        if (parsed && typeof parsed.text === 'string') {
            return {
                id: tag.id,
                text: parsed.text,
                colorClasses: parsed.color || TAG_COLORS[0].value
            };
        }
    } catch {
        // Not a JSON string
    }

    // 3. Plain text tag (Old data)
    return {
        id: tag.id,
        text: tag.name,
        colorClasses: TAG_COLORS[0].value
    };
};

export const stringifyTag = (text: string, colorClasses: string): string => {
    const colorIndex = TAG_COLORS.findIndex(c => c.value === colorClasses);
    const validIndex = colorIndex >= 0 ? colorIndex : 0;

    // Total max length is 50. '|#|00' takes up to 5 chars. So text can be max 45 chars.
    const safeText = text.substring(0, 45);
    return `${safeText}|#|${validIndex}`;
};
