'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { DbShortNoteWithTags, DbTag } from '@/lib/supabase-types';
import { apiClient } from '@/lib/api-client';
import DynamicRichTextEditor from './DynamicRichTextEditor';
import TagConeIcon from './TagConeIcon';
import { cn } from '@/lib/utils';
import { parseTag, getColorStyles } from '@/lib/tag-helpers';

interface ShortNoteEditorProps {
    note?: DbShortNoteWithTags | null;
    onSave: () => void;
    onCancel: () => void;
    tags: DbTag[];
    defaultTagIds?: string[];
}

const ShortNoteEditor: React.FC<ShortNoteEditorProps> = ({ note, onSave, onCancel, tags, defaultTagIds = [] }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [editorKey, setEditorKey] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        setEditorKey(prev => prev + 1); // Force new TipTap instance
        if (note) {
            setTitle(note.title || '');
            setContent(note.content || '');
            setSelectedTagIds(note.tags?.map(t => t.id) || []);
        } else {
            setTitle('');
            setContent('');
            setSelectedTagIds(defaultTagIds);
        }
    }, [note, defaultTagIds]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (!title.trim()) {
            return;
        }
        if (selectedTagIds.length === 0) {
            return;
        }

        if (loading) return; // Prevent double click
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
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border/50 rounded-3xl p-6 shadow-sm">

                {/* Header & Actions at the top */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
                    <div className="flex items-center gap-4">
                        <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl p-2.5 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-transparent shrink-0">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-black tracking-tight truncate text-foreground">
                            {note ? 'Edit Note' : 'Create Note'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 sm:flex-none rounded-xl px-6 h-11 font-bold text-muted-foreground hover:text-foreground bg-muted/30 sm:bg-transparent">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 sm:flex-none rounded-xl px-6 h-11 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (note ? 'Update Note' : 'Create Note')}
                        </Button>
                    </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground flex items-center gap-1 ml-1">
                        Title
                        <span className="text-rose-500">*</span>
                    </label>
                    <Input
                        placeholder="Enter note title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={cn("h-12 bg-background border-border/50 rounded-xl font-bold", submitted && !title.trim() && "border-rose-500 focus-visible:ring-rose-500")}
                    />
                    {submitted && !title.trim() && (
                        <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5 mt-1.5 ml-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Title is required
                        </p>
                    )}
                </div>

                {/* Tags */}
                <div className={cn("space-y-2 rounded-2xl p-3 -mx-1 transition-colors", submitted && selectedTagIds.length === 0 && "border-2 border-rose-500 bg-rose-500/5")}>
                    <label className="text-sm font-bold text-muted-foreground ml-1 flex items-center gap-1">
                        Tags
                        <span className="text-rose-500">*</span>
                    </label>
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
                                        "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                                        isSelected
                                            ? `${parsed.colorClasses} shadow-sm ring-1 ring-current`
                                            : "bg-background text-muted-foreground border-border/50 hover:border-border hover:bg-muted/50"
                                    )}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <TagConeIcon circleColor={colorStyles.color} size={20} className="shrink-0" />
                                        <span>{parsed.text}</span>
                                    </span>
                                </button>
                            );
                        })}
                        {tags.length === 0 && (
                            <span className="text-sm text-muted-foreground italic py-2">No tags available. create one in the sidebar.</span>
                        )}
                    </div>
                </div>

                {/* Content - Rich Text Editor */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Content</label>
                    <div className="w-full">
                        <DynamicRichTextEditor
                            key={editorKey}
                            content={content}
                            onChange={setContent}
                            placeholder="Start writing your thoughts..."
                        />
                    </div>
                </div>

            </form>
        </div>
    );
};

export default ShortNoteEditor;
