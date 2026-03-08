'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon, Loader2, AlertCircle
} from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { DbNote, DbNoteCategory } from '@/lib/supabase-types';
import { apiClient } from '@/lib/api-client';
import RichTextEditor from './RichTextEditor';

// Desired category display order
const CATEGORY_ORDER = [
    'Work', 'Study', 'Personal', 'Finance',
    'Ideas/Brainstorm', 'Draft/Writing', 'Resources/Knowledge', 'Archive/Reference'
];

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    note?: any;
    onSave: (note: any) => void;
    defaultDueDate?: string;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, note, onSave, defaultDueDate }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [noteCategoryId, setNoteCategoryId] = useState('');
    const [status, setStatus] = useState<'New' | 'In Progress' | 'Urgent' | 'Done'>('New');
    const [isFavorite, setIsFavorite] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [categories, setCategories] = useState<DbNoteCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [editorKey, setEditorKey] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setEditorKey(prev => prev + 1); // Force new TipTap instance
            setSubmitted(false);
            fetchCategories();
            if (note) {
                setTitle(note.title || '');
                setContent(note.content || '');
                setNoteCategoryId(note.note_category_id || '');
                setStatus(note.status || 'New');
                setIsFavorite(note.is_favorite || false);
                setDueDate(note.reminders?.due_date ? new Date(note.reminders.due_date).toISOString().split('T')[0] : '');
            } else {
                setTitle('');
                setContent('');
                setNoteCategoryId('');
                setStatus('New');
                setIsFavorite(false);
                setDueDate(defaultDueDate || '');
            }
        }
    }, [isOpen, note]);

    const fetchCategories = async () => {
        try {
            const res = await apiClient.fetch('/api/note-categories');
            const json = await res.json();
            if (json.success) {
                const sorted = [...json.data].sort((a: DbNoteCategory, b: DbNoteCategory) => {
                    const indexA = CATEGORY_ORDER.indexOf(a.name);
                    const indexB = CATEGORY_ORDER.indexOf(b.name);
                    if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                });
                setCategories(sorted);
                // In Create mode, always default to first category
                if (!note && sorted.length > 0) {
                    setNoteCategoryId(sorted[0].note_category_id);
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        if (!title.trim() || !dueDate) return;
        setLoading(true);
        try {
            const payload = {
                title,
                content,
                note_category_id: noteCategoryId || null,
                status,
                is_favorite: isFavorite,
                due_date: dueDate || null
            };

            let res;
            if (note) {
                res = await apiClient.fetch(`/api/notes/${note.note_id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload)
                });
            } else {
                res = await apiClient.fetch('/api/notes', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            }

            const json = await res.json();
            if (json.success) {
                onSave(json.data);
                onClose();
            }
        } catch (error) {
            console.error('Error saving note:', error);
        } finally {
            setLoading(false);
        }
    };

    // Find selected category for display
    const selectedCategory = categories.find(c => c.note_category_id === noteCategoryId);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={note ? 'Edit Note' : 'Create Note'}>
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Category Dropdown (first) */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Category</label>
                    <div className="relative">
                        <select
                            className="w-full h-12 px-4 pl-10 rounded-xl bg-card/50 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer"
                            value={noteCategoryId}
                            onChange={(e) => setNoteCategoryId(e.target.value)}
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat.note_category_id} value={cat.note_category_id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {/* Show icon of selected category */}
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">
                            {selectedCategory?.icon || '📝'}
                        </span>
                        {/* Custom arrow */}
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* 2. Title */}
                <div className="space-y-1">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Title <span className="text-rose-500">*</span></label>
                    <Input
                        placeholder="Enter title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`h-12 bg-card/50 rounded-xl ${submitted && !title.trim() ? 'border-rose-500 focus:ring-rose-500/20' : 'border-border/50'}`}
                    />
                    {submitted && !title.trim() && (
                        <p className="text-xs text-rose-500 font-medium ml-1 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Title is required
                        </p>
                    )}
                </div>

                {/* Status & Deadline row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground ml-1">Status</label>
                        <select
                            className="w-full h-12 px-4 rounded-xl bg-card/50 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                        >
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Urgent">Urgent</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground ml-1">Deadline <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className={`pl-12 h-12 bg-card/50 rounded-xl ${submitted && !dueDate ? 'border-rose-500 focus:ring-rose-500/20' : 'border-border/50'}`}
                            />
                        </div>
                        {submitted && !dueDate && (
                            <p className="text-xs text-rose-500 font-medium ml-1 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Deadline is required
                            </p>
                        )}
                    </div>
                </div>

                {/* Content - Rich Text Editor */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Content</label>
                    <RichTextEditor
                        key={editorKey}
                        content={content}
                        onChange={setContent}
                        placeholder="Write your note here..."
                    />
                </div>

                {/* Actions */}
                <div className="pt-4 flex items-center justify-end gap-3">
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
            </form>
        </Modal>
    );
};

export default NoteModal;
