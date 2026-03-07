'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { DbShortNoteWithTags, DbTag } from '@/lib/supabase-types';
import { apiClient } from '@/lib/api-client';
import RichTextEditor from './RichTextEditor';
import { cn } from '@/lib/utils';
import { parseTag } from '@/lib/tag-helpers';

interface ShortNoteEditorProps {
    note?: DbShortNoteWithTags | null;
    onSave: () => void;
    onCancel: () => void;
    tags: DbTag[];
}

const ShortNoteEditor: React.FC<ShortNoteEditorProps> = ({ note, onSave, onCancel, tags }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editorKey, setEditorKey] = useState(0);

    useEffect(() => {
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
    }, [note]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Please enter a title for your note.');
            return;
        }
        if (selectedTagIds.length === 0) {
            setError('Please select at least one tag for your note.');
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
            <header className="flex items-center gap-4 bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20 p-5 sm:p-6 mb-2 rounded-3xl shadow-sm">
                <Button variant="ghost" onClick={onCancel} className="rounded-xl p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 border-transparent shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-black tracking-tight truncate">
                    {note ? 'Edit Note' : 'Create Note'}
                </h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Title</label>
                    <Input
                        placeholder="Enter note title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-12 bg-background border-border/50 rounded-xl font-bold"
                    />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Tags</label>
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => {
                            const parsed = parseTag(tag);
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
                                    <span className="opacity-50 mr-1">#</span>
                                    {parsed.text}
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
                    <div className="min-h-[400px]">
                        <RichTextEditor
                            key={editorKey}
                            content={content}
                            onChange={setContent}
                            placeholder="Start writing your thoughts..."
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="text-sm font-bold text-rose-500 bg-rose-500/10 px-4 py-3 rounded-xl border border-rose-500/20">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-border/50">
                    <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto rounded-xl px-8 h-12 font-bold text-muted-foreground hover:text-foreground">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto rounded-xl px-8 h-12 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (note ? 'Update Note' : 'Create Note')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ShortNoteEditor;
