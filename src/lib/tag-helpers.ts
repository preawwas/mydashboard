export const TAG_COLORS = [
    { label: 'Purple Light', value: 'bg-[#C4C3E3]/30 text-[#504E76] border-[#C4C3E3]/50' },
    { label: 'Beige Light', value: 'bg-[#FDF8E2]/30 text-[#D9B99F] border-[#FDF8E2]/50' },
    { label: 'Green Soft', value: 'bg-[#A3B565]/30 text-[#A3B565] border-[#A3B565]/50' },
    { label: 'Orange Light', value: 'bg-[#FCDD9D]/30 text-[#F1642E] border-[#FCDD9D]/50' },
    { label: 'Orange Strong', value: 'bg-[#F1642E]/30 text-[#F1642E] border-[#F1642E]/50' },
    { label: 'Copper', value: 'bg-[#A75F37]/30 text-[#A75F37] border-[#A75F37]/50' },
    { label: 'Tan', value: 'bg-[#D9B99F]/30 text-[#A75F37] border-[#D9B99F]/50' },
    { label: 'Purple Dark', value: 'bg-[#504E76]/30 text-[#504E76] border-[#504E76]/50' },
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
            // If colorIndex is out of range, default to first color
            if (!isNaN(colorIndex)) {
                return {
                    id: tag.id,
                    text,
                    colorClasses: TAG_COLORS[0].value
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

export const getColorStyles = (colorClasses: string): { backgroundColor: string; color: string; borderColor: string } => {
    // Extract hex colors from the colorClasses string
    // Format: 'bg-[#C4C3E3]/30 text-[#504E76] border-[#C4C3E3]/50'
    const bgMatch = colorClasses.match(/bg-\[(#[0-9A-F]{6})\]\/(\d+)/i);
    const textMatch = colorClasses.match(/text-\[(#[0-9A-F]{6})\]/i);
    const borderMatch = colorClasses.match(/border-\[(#[0-9A-F]{6})\]\/(\d+)/i);

    const bgColor = bgMatch ? bgMatch[1] : '#f0f0f0';
    const bgOpacity = bgMatch ? bgMatch[2] : '30';
    const textColor = textMatch ? textMatch[1] : '#000000';
    const borderColor = borderMatch ? borderMatch[1] : '#cccccc';

    return {
        backgroundColor: `${bgColor}${Math.round((parseInt(bgOpacity) / 100) * 255).toString(16).padStart(2, '0')}`,
        color: textColor,
        borderColor: `${borderColor}80`
    };
};

