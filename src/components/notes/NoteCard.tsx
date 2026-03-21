'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { CalendarDays, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DbNote, DbNoteCategory, DbReminder } from '@/lib/supabase-types';

interface ExtendedNote extends DbNote {
    note_categories?: DbNoteCategory;
    reminders?: DbReminder;
}

interface NoteCardProps {
    note: ExtendedNote;
    onClick?: () => void;
}

function getDaysRemaining(dueDate: string): { text: string; isOverdue: boolean } {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        const absDays = Math.abs(diffDays);
        if (absDays >= 30) {
            const months = Math.floor(absDays / 30);
            const days = absDays % 30;
            return { text: `${months} month${months > 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''} overdue`, isOverdue: true };
        }
        return { text: `${absDays} day${absDays !== 1 ? 's' : ''} overdue`, isOverdue: true };
    }
    if (diffDays === 0) return { text: 'Due today', isOverdue: false };
    if (diffDays === 1) return { text: '1 day left', isOverdue: false };
    if (diffDays >= 30) {
        const months = Math.floor(diffDays / 30);
        const days = diffDays % 30;
        return { text: `${months} month${months > 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''} left`, isOverdue: false };
    }
    return { text: `${diffDays} days left`, isOverdue: false };
}

const statusStyles: Record<string, string> = {
    'New': 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    'In Progress': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    'Urgent': 'bg-rose-500/10 text-rose-700 border-rose-500/20',
    'Done': 'bg-slate-500/10 text-slate-700 border-slate-500/20',
};

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
    const categoryColor = note.note_categories?.color_code || '#718096';
    const deadline = note.reminders ? getDaysRemaining(note.reminders.due_date) : null;
    const formattedDate = note.reminders
        ? new Date(note.reminders.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : null;

    return (
        <Card
            className="group relative cursor-pointer hover:border-primary/50 transition-all duration-300 border-l-4 overflow-hidden hover:shadow-lg hover:-translate-y-1"
            style={{ borderLeftColor: categoryColor }}
            onClick={onClick}
        >
            <CardContent className="p-5 flex flex-col h-full bg-card/40 backdrop-blur-sm min-h-[200px]">
                {/* Top Row: Icon + Title + Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm shrink-0"
                            style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
                        >
                            {note.note_categories?.icon || '\u{1F4DD}'}
                        </div>
                        <h3 className="text-base font-bold text-foreground line-clamp-2 group-hover:text-[#1F4E50] transition-colors leading-tight">
                            {note.title}
                        </h3>
                    </div>
                    <span className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border shrink-0",
                        statusStyles[note.status] || statusStyles['New']
                    )}>
                        {note.status}
                    </span>
                </div>

                {/* Content Preview - Stripped HTML */}
                <p className="text-sm text-muted-foreground mb-auto line-clamp-2 leading-relaxed">
                    {note.content?.replace(/<[^>]*>/g, '').trim() || 'No content...'}
                </p>

                {/* Bottom: Deadline + Days remaining */}
                <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between">
                    {note.reminders ? (
                        <>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <CalendarDays className="w-3.5 h-3.5" />
                                <span className="font-medium">{formattedDate}</span>
                            </div>
                            <span className={cn(
                                "text-xs font-bold px-2 py-0.5 rounded-full",
                                deadline?.isOverdue
                                    ? "bg-rose-500/10 text-rose-700"
                                    : "bg-primary/10 text-[#1F4E50]"
                            )}>
                                {deadline?.text}
                            </span>
                        </>
                    ) : (
                        <span className="text-xs text-muted-foreground opacity-50">No Deadline</span>
                    )}

                    {note.is_favorite && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default NoteCard;

