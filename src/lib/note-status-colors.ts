/** La Buque palette — shared by calendar chips and Journey status UI */
export const NOTE_STATUS_COLORS: Record<
    string,
    { dot: string; bg: string; text: string; base: string; check: string; border: string }
> = {
    New: { dot: 'bg-[#563526]', bg: '#F7F2DC', text: '#563526', base: '#563526', check: '#563526', border: '#56352640' },
    'In Progress': { dot: 'bg-[#6B2D2D]', bg: '#F5DDD0', text: '#5C2E2E', base: '#6B2D2D', check: '#6B2D2D', border: '#6B2D2D40' },
    Urgent: { dot: 'bg-[#F7F2DC]', bg: '#6B2D2D', text: '#F7F2DC', base: '#6B2D2D', check: '#F7F2DC', border: '#6B2D2D' },
    Done: { dot: 'bg-[#5A9A8F]', bg: '#DCEFE8', text: '#8A9099', base: '#5A9A8F', check: '#5A9A8F', border: '#5A9A8F40' },
};

export const getNoteStatusColor = (status: string) =>
    NOTE_STATUS_COLORS[status] ?? {
        dot: 'bg-[#8A9099]',
        bg: '#E8E4DC',
        text: '#4A4540',
        base: '#8A9099',
        check: '#8A9099',
        border: '#8A909940',
    };
