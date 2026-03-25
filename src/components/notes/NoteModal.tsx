'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Calendar as CalendarIcon, Loader2, AlertCircle, X
} from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { DbNote, DbNoteCategory } from '@/lib/supabase-types';
import { apiClient } from '@/lib/api-client';
import DynamicRichTextEditor from './DynamicRichTextEditor';
import { MultiDatePicker } from '@/components/ui';
import { cn } from '@/lib/utils';

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
    isClone?: boolean;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, note, onSave, defaultDueDate, isClone }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [noteCategoryId, setNoteCategoryId] = useState('');
    const [status, setStatus] = useState<'New' | 'In Progress' | 'Urgent' | 'Done'>('New');
    const [isFavorite, setIsFavorite] = useState(false);
    const [dueDates, setDueDates] = useState<string[]>([]);
    const [tempDate, setTempDate] = useState<string>('');
    const [categories, setCategories] = useState<DbNoteCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [editorKey, setEditorKey] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [isMultiDateMode, setIsMultiDateMode] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsDatePickerOpen(false);
            }
        };
        if (isDatePickerOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDatePickerOpen]);

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
                const reminderData = Array.isArray(note.reminders) ? note.reminders[0] : note.reminders;
                const initialDate = reminderData?.due_date ? new Date(reminderData.due_date).toISOString().split('T')[0] : '';
                setDueDates(isClone ? [] : (initialDate ? [initialDate] : []));
                setTempDate(isClone ? '' : initialDate);
                setIsMultiDateMode(false);
            } else {
                setTitle('');
                setContent('');
                setNoteCategoryId('');
                setStatus('New');
                setIsFavorite(false);
                setDueDates(defaultDueDate ? [defaultDueDate] : []);
                setTempDate('');
                setIsMultiDateMode(false);
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
        if (!title.trim() || dueDates.length === 0) return;
        setLoading(true);
        try {
            if (note && !isClone) {
                const payload = {
                    title,
                    content,
                    note_category_id: noteCategoryId || null,
                    status,
                    is_favorite: isFavorite,
                    due_date: dueDates[0] || null
                };
                const res = await apiClient.fetch(`/api/notes/${note.note_id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload)
                });
                const json = await res.json();
                if (json.success) {
                    onSave(json.data);
                    onClose();
                }
            } else {
                let firstCreatedNote = null;
                for (const date of dueDates) {
                    const payload = {
                        title,
                        content,
                        note_category_id: noteCategoryId || null,
                        status,
                        is_favorite: isFavorite,
                        due_date: date
                    };
                    const res = await apiClient.fetch('/api/notes', {
                        method: 'POST',
                        body: JSON.stringify(payload)
                    });
                    const json = await res.json();
                    if (json.success && !firstCreatedNote) {
                        firstCreatedNote = json.data;
                    }
                }
                onSave(firstCreatedNote || {});
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
        <Modal isOpen={isOpen} onClose={onClose} title={note && !isClone ? 'Edit Note' : (isClone ? 'Clone Note' : 'Create Note')}>
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
                        <div className="flex items-center h-8 ml-1">
                            <label className="text-sm font-bold text-muted-foreground">Status</label>
                        </div>
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
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 ml-1 h-8">
                            <label className="text-sm font-bold text-muted-foreground whitespace-nowrap">
                                Deadline <span className="text-rose-500">*</span>
                            </label>
                            {!(note && !isClone) && (
                                <div className="flex bg-muted/50 p-0.5 rounded-full border border-border/50 shrink-0 self-start sm:self-auto w-fit">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isMultiDateMode) {
                                                setIsMultiDateMode(false);
                                                if (dueDates.length > 1) setDueDates(dueDates.length > 0 ? [dueDates[0]] : []);
                                            }
                                        }}
                                        className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${!isMultiDateMode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        1 Day
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsMultiDateMode(true)}
                                        className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${isMultiDateMode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Multi Days
                                    </button>
                                </div>
                            )}
                        </div>
                        {isMultiDateMode && !(note && !isClone) ? (
                            <div className="relative" ref={datePickerRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                    className={cn(
                                        "w-full h-12 px-4 flex items-center gap-3 rounded-xl border transition-all text-sm font-bold",
                                        isDatePickerOpen ? "bg-primary/5 border-primary ring-2 ring-primary/20" : "bg-card/50 border-border/50 hover:border-primary/50",
                                        dueDates.length > 0 ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className={cn("w-4 h-4", dueDates.length > 0 ? "text-primary" : "text-muted-foreground")} />
                                    {dueDates.length > 0 ? `${dueDates.length} days selected` : "Select Dates"}
                                    <div className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px]">
                                        {dueDates.length}
                                    </div>
                                </button>

                                {isDatePickerOpen && (
                                    <div className="absolute top-[calc(100%+8px)] right-0 w-[340px] z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <MultiDatePicker
                                            selectedDates={dueDates}
                                            onChange={setDueDates}
                                            onDone={() => setIsDatePickerOpen(false)}
                                            className="w-full shadow-2xl border-primary/20 bg-card backdrop-blur-xl"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    value={note && !isClone ? tempDate : (dueDates[0] || '')}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (note && !isClone) {
                                            setTempDate(val);
                                            setDueDates(val ? [val] : []);
                                        } else {
                                            setDueDates(val ? [val] : []);
                                        }
                                    }}
                                    className={`pl-12 h-12 bg-card/50 rounded-xl ${submitted && dueDates.length === 0 ? 'border-rose-500 focus:ring-rose-500/20' : 'border-border/50'}`}
                                />
                            </div>
                        )}
                        {submitted && dueDates.length === 0 && (
                            <p className="text-xs text-rose-500 font-medium ml-1 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Deadline is required
                            </p>
                        )}
                    </div>
                </div>

                {/* Selected Deadlines Chips - Only show in single mode or when not empty if we want extra visibility */}
                {!(note && !isClone) && !isMultiDateMode && dueDates.length > 1 && (
                    <div className="space-y-2 bg-card/30 p-3 rounded-xl border border-border/50">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                                Selected Dates
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">{dueDates.length} selected</span>
                                <button type="button" onClick={() => setDueDates([])} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors bg-rose-500/10 px-2 py-0.5 rounded-full">Clear all</button>
                            </div>
                        </div>
                        <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1 custom-scrollbar">
                            {dueDates.map(date => {
                                const [y, m, d] = date.split('-');
                                const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                                return (
                                    <div key={date} className="flex items-center gap-1.5 bg-background text-foreground px-3 py-1.5 rounded-lg text-xs font-bold border border-border/50 shadow-sm shrink-0">
                                        <span>{dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'})}</span>
                                        <button type="button" onClick={() => setDueDates(dueDates.filter(d => d !== date))} className="p-1 hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground rounded-full transition-colors ml-0.5">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Content - Rich Text Editor */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Content</label>
                    <DynamicRichTextEditor
                        key={editorKey}
                        content={content}
                        onChange={setContent}
                        placeholder="Write your note here..."
                        minHeight="250px"
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
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (note && !isClone ? 'Edit Note' : (isClone ? 'Clone Note' : 'Create Note'))}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default NoteModal;
