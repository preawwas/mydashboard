'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { DbShortNoteWithTags, DbTag } from '@/lib/supabase-types';
import { apiClient } from '@/lib/api-client';
import DynamicRichTextEditor from './DynamicRichTextEditor';
import TagConeIcon from './TagConeIcon';
import { cn } from '@/lib/utils';
import { parseTag, getColorStyles } from '@/lib/tag-helpers';

interface ShortNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    note?: DbShortNoteWithTags | null;
    onSave: () => void;
    tags: DbTag[];
}

const ShortNoteModal: React.FC<ShortNoteModalProps> = ({ isOpen, onClose, note, onSave, tags }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [editorKey, setEditorKey] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setEditorKey(prev => prev + 1); // Force new TipTap instance
            if (note) {
                setTitle(note.title || '');
                setContent(note.content || '');
                setSelectedTagIds(note.tags?.map(t => t.id) || []);
            } else {
                setTitle('');
                setContent('');
                setSelectedTagIds([]);
            }
        }
    }, [isOpen, note]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                title: title.trim() || 'Untitled Note',
                content,
                tags: selectedTagIds
            };

            let res;
            if (note) {
                res = await apiClient.fetch(`/api/short-notes/${note.note_id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload)
                });
            } else {
                res = await apiClient.fetch('/api/short-notes', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            }

            const json = await res.json();
            if (json.success) {
                onSave();
                onClose();
            }
        } catch (error) {
            console.error('Error saving short note:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTag = (tagId: string) => {
        setSelectedTagIds(prev =>
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={note ? 'Edit Note' : 'Create Note'}>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="space-y-5 flex-1 overflow-y-auto">
                    {/* Title */}
                    <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Title</label>
                    <Input
                        placeholder="Enter title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-12 bg-card/50 border-border/50 rounded-xl"
                    />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Tags</label>
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => {
                            const parsed = parseTag(tag);
                            const colorStyles = getColorStyles(parsed.colorClasses);
                            const isSelected = selectedTagIds.includes(tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => toggleTag(tag.id)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                                        isSelected
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-card/50 text-muted-foreground border-border/50 hover:border-primary/50"
                                    )}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <TagConeIcon size={19} className="shrink-0" />
                                        <span>{parsed.text}</span>
                                    </span>
                                </button>
                            );
                        })}
                        {tags.length === 0 && (
                            <span className="text-sm text-muted-foreground italic">No tags available. create one in the sidebar.</span>
                        )}
                    </div>
                </div>

                    {/* Content - Rich Text Editor */}
                    <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Content</label>
                    <DynamicRichTextEditor
                        key={editorKey}
                        content={content}
                        onChange={setContent}
                        placeholder="Write your note here..."
                    />
                </div>
                </div>

                {/* Actions - sticky footer inside the modal's scroll container */}
                <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border p-4 flex-shrink-0">
                    <div className="flex items-center justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-6 h-12 border-border/50">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl px-8 h-12 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (note ? 'Edit Note' : 'Create Note')}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default ShortNoteModal;
