'use client';

import React, { useState } from 'react';
import { Asterisk, Edit2, Copy, Trash2, Check } from 'lucide-react';
import { DbShortNoteWithTags } from '@/lib/supabase-types';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { parseTag, getColorStyles } from '@/lib/tag-helpers';
import TagConeIcon from './TagConeIcon';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { format } from 'date-fns';

interface ShortNoteCardProps {
    note: DbShortNoteWithTags;
    onUpdate: () => void;
    onEdit: () => void;
}

const getShadowClass = (_colorClasses: string) => {
    // For new hex colors, return a generic shadow styling
    // Individual card styling will use borderColor from getColorStyles
    return 'shadow-primary/10 hover:shadow-primary/20';
};

const getBorderClass = (_colorClasses: string) => {
    // For new hex colors, we'll use inline styles instead
    return 'hover:border-primary/30';
};

const ShortNoteCard: React.FC<ShortNoteCardProps> = ({ note, onUpdate, onEdit }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            console.log('Deleting note:', note.note_id);
            const res = await apiClient.fetch(`/api/short-notes/${note.note_id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                setIsDeleteModalOpen(false);
                onUpdate();
            } else {
                console.error('Failed to delete note on server:', json.error);
                // Can't replace all alerts easily if no toast framework, but this is an error edge case
                alert(`Failed to delete note: ${json.error}`);
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Failed to delete note. Check console for details.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleTogglePin = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await apiClient.fetch(`/api/short-notes/${note.note_id}`, {
                method: 'PATCH',
                body: JSON.stringify({ is_favorite: !note.is_favorite })
            });
            onUpdate();
        } catch (error) {
            console.error('Error toggling pin:', error);
        }
    };

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        let textToCopy = '';
        if (note.title) textToCopy += note.title + '\n\n';
        if (note.content) textToCopy += note.content.replace(/<[^>]*>/g, '');

        const cleanText = textToCopy.trim();

        if (cleanText) {
            try {
                await navigator.clipboard.writeText(cleanText);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                console.error('Clipboard copy failed:', err);
                alert('Failed to copy to clipboard.');
            }
        }
    };

    const firstTag = note.tags && note.tags.length > 0 ? parseTag(note.tags[0]) : null;
    const firstTagStyles = firstTag ? getColorStyles(firstTag.colorClasses) : null;
    const shadowClass = firstTag ? getShadowClass(firstTag.colorClasses) : 'shadow-primary/5 hover:shadow-primary/15';
    const borderClass = firstTag ? getBorderClass(firstTag.colorClasses) : 'border-border/50 hover:border-primary/30';
    const borderStyle = firstTag ? { borderColor: getColorStyles(firstTag.colorClasses).borderColor } : undefined;

    return (
        <div
            onClick={onEdit}
            className={cn(
                "group relative border rounded-[32px] p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col h-[320px] cursor-pointer shadow-md hover:shadow-2xl",
                firstTag ? "" : "bg-card hover:bg-card/80",
                shadowClass,
                borderClass
            )}
            style={firstTag ? { ...borderStyle, backgroundColor: firstTagStyles?.backgroundColor } : borderStyle}
        >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
                <h3
                    className="flex-1 min-w-0 font-black text-foreground transition-colors group-hover:text-[#1F4E50]"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.4rem',
                        maxHeight: '2.8rem',
                        wordBreak: 'break-word'
                    }}
                    title={note.title || 'Untitled Note'}
                >
                    {note.title || 'Untitled Note'}
                </h3>
                <button
                    onClick={handleTogglePin}
                    aria-label={note.is_favorite ? "Unpin note" : "Pin note"}
                    className={cn(
                        "p-1 transition-colors",
                        note.is_favorite
                            ? "text-slate-700 hover:text-slate-400"
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <Asterisk className="w-10 h-10" strokeWidth={3} />
                </button>
            </div>

            {/* Content Snippet */}
            <div className="flex-1 mb-4 overflow-hidden text-left">
                {note.content?.replace(/<[^>]*>/g, '').trim() ? (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                        {note.content.replace(/<[^>]*>/g, '').trim()}
                    </p>
                ) : (
                    <div className="h-full flex items-center justify-center opacity-40">
                        <span className="text-sm italic font-medium">No content provided</span>
                    </div>
                )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                {note.tags && note.tags.length > 0 ? (
                    note.tags.map(tag => {
                        const parsed = parseTag(tag);
                        const colorStyles = getColorStyles(parsed.colorClasses);
                        return (
                            <span
                                key={tag.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
                                style={{
                                    backgroundColor: colorStyles.backgroundColor,
                                    color: '#000000',
                                    borderColor: '#000000'
                                }}
                            >
                                <TagConeIcon circleColor={colorStyles.color} size={18} className="shrink-0" />
                                {parsed.text}
                            </span>
                        );
                    })
                ) : (
                    <div className="h-6" /> // Spacer
                )}
            </div>

            {/* Card Footer Actions */}
            <div className="flex items-center justify-between gap-1 mt-auto pt-4 border-t border-border/30">
                <div className="text-[11px] font-medium text-muted-foreground/60 w-full pl-1">
                    {format(new Date(note.updated_at || note.created_at), "MMM d, yyyy | h:mm a")}
                </div>
                <div className="flex items-center justify-end shrink-0 gap-1">
                    <button
                        onClick={handleCopy}
                        aria-label="Copy note content"
                        className="p-2.5 rounded-xl text-muted-foreground hover:text-[#1F4E50] hover:bg-primary/10 transition-all z-10"
                        title="Copy Content"
                    >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        aria-label="Delete note"
                        className="p-2.5 rounded-xl text-muted-foreground hover:text-rose-700 hover:bg-rose-500/10 transition-all z-10"
                        title="Delete Note"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                title="Delete Note"
                description="Are you sure you want to delete this note? This action cannot be undone."
                size="sm"
            >
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setIsDeleteModalOpen(false)}
                        disabled={isDeleting}
                        className="rounded-xl border-border/50 text-foreground"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={confirmDelete}
                        disabled={isDeleting}
                        className="rounded-xl font-bold"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Note'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default ShortNoteCard;

