'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Search, Plus, Loader2, Trash2, GripVertical,
    Filter, X, CalendarDays, ChevronUp, ChevronDown
} from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import NoteModal from './NoteModal';
import { DbNote, DbNoteCategory, DbReminder } from '@/lib/supabase-types';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface ExtendedNote extends DbNote {
    note_categories?: DbNoteCategory;
    reminders?: DbReminder;
}

// New status colors: New=yellow, In Progress=orange, Urgent=red, Done=blue
// Column order: New first, then In Progress
const STATUS_COLUMNS = ['New', 'In Progress', 'Urgent', 'Done'];
const statusStyles: Record<string, { bg: string; text: string; border: string; dot: string; countBg: string; pillBg: string }> = {
    'New': { bg: 'bg-yellow-500/5', text: 'text-yellow-600', border: 'border-yellow-500/20', dot: 'bg-yellow-500', countBg: 'bg-yellow-500/15', pillBg: 'bg-yellow-500/10' },
    'In Progress': { bg: 'bg-orange-500/5', text: 'text-orange-600', border: 'border-orange-500/20', dot: 'bg-orange-500', countBg: 'bg-orange-500/15', pillBg: 'bg-orange-500/10' },
    'Urgent': { bg: 'bg-rose-500/5', text: 'text-rose-600', border: 'border-rose-500/20', dot: 'bg-rose-500', countBg: 'bg-rose-500/15', pillBg: 'bg-rose-500/10' },
    'Done': { bg: 'bg-sky-500/5', text: 'text-sky-600', border: 'border-sky-500/20', dot: 'bg-sky-500', countBg: 'bg-sky-500/15', pillBg: 'bg-sky-500/10' },
};

function getDaysRemainingText(dueDate: string): { text: string; isOverdue: boolean } {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
        const abs = Math.abs(diffDays);
        if (abs >= 30) { const m = Math.floor(abs / 30); const d = abs % 30; return { text: `${m} month${m > 1 ? 's' : ''} ${d} day${d !== 1 ? 's' : ''} overdue`, isOverdue: true }; }
        return { text: `${abs} day${abs !== 1 ? 's' : ''} overdue`, isOverdue: true };
    }
    if (diffDays === 0) return { text: 'Due today', isOverdue: false };
    if (diffDays >= 30) { const m = Math.floor(diffDays / 30); const d = diffDays % 30; return { text: `${m} month${m > 1 ? 's' : ''} ${d} day${d !== 1 ? 's' : ''} left`, isOverdue: false }; }
    return { text: `${diffDays} day${diffDays !== 1 ? 's' : ''} left`, isOverdue: false };
}

const NoteDashboard: React.FC = () => {
    const [notes, setNotes] = useState<ExtendedNote[]>([]);
    const [trashedNotes, setTrashedNotes] = useState<ExtendedNote[]>([]);
    const [categories, setCategories] = useState<DbNoteCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<ExtendedNote | null>(null);
    const [draggedNote, setDraggedNote] = useState<ExtendedNote | null>(null);
    const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

    // Category filter
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);
    const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
    const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

    // Category tab drag
    const [draggedCatId, setDraggedCatId] = useState<string | null>(null);
    const [dragOverCatId, setDragOverCatId] = useState<string | null>(null);

    // Date filter
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Trash popup
    const [showTrash, setShowTrash] = useState(false);

    // Track whether categories have been initialized
    const categoriesInitialized = useRef(false);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await apiClient.fetch('/api/note-categories');
            const json = await res.json();
            if (json.success) {
                const cats: DbNoteCategory[] = json.data || [];
                setCategories(cats);
                const allIds = cats.map(c => c.note_category_id);

                if (!categoriesInitialized.current) {
                    // First load: show all categories
                    categoriesInitialized.current = true;
                    setCategoryOrder(allIds);
                    setVisibleCategories(allIds);
                } else {
                    // Subsequent loads: only add NEW categories, preserve existing filter/order
                    setCategoryOrder(prev => {
                        const newIds = allIds.filter(id => !prev.includes(id));
                        // Also remove any IDs that no longer exist
                        const existing = prev.filter(id => allIds.includes(id));
                        return [...existing, ...newIds];
                    });
                    setVisibleCategories(prev => {
                        const newIds = allIds.filter(id => !prev.includes(id));
                        const existing = prev.filter(id => allIds.includes(id));
                        return [...existing, ...newIds];
                    });
                }

                if (!selectedCategoryId && cats.length > 0) {
                    setSelectedCategoryId(cats[0].note_category_id);
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, [selectedCategoryId]);

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.fetch('/api/notes');
            const json = await res.json();
            if (json.success) setNotes(json.data || []);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTrashedNotes = useCallback(async () => {
        try {
            const res = await apiClient.fetch('/api/notes?filter=deleted');
            const json = await res.json();
            if (json.success) setTrashedNotes(json.data || []);
        } catch (error) {
            console.error('Error fetching trashed notes:', error);
        }
    }, []);

    useEffect(() => { fetchCategories(); fetchNotes(); }, []);

    // Filtered notes
    const filteredNotes = notes.filter(n => {
        const matchesCat = selectedCategoryId ? n.note_category_id === selectedCategoryId : true;
        const matchesSearch = searchQuery
            ? n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content?.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        let matchesDate = true;
        if (dateFrom || dateTo) {
            const dueDate = n.reminders?.due_date;
            if (!dueDate) { matchesDate = false; }
            else {
                const d = new Date(dueDate); d.setHours(0, 0, 0, 0);
                if (dateFrom) { const from = new Date(dateFrom); from.setHours(0, 0, 0, 0); if (d < from) matchesDate = false; }
                if (dateTo) { const to = new Date(dateTo); to.setHours(23, 59, 59, 999); if (d > to) matchesDate = false; }
            }
        }
        return matchesCat && matchesSearch && matchesDate;
    });

    const getCategoryCount = (catId: string) => notes.filter(n => n.note_category_id === catId).length;

    // Status summary (all notes)
    const statusSummary = STATUS_COLUMNS.map(s => ({
        status: s,
        count: notes.filter(n => n.status === s).length
    }));

    // Ordered & visible categories
    const orderedCategories = categoryOrder
        .filter(id => visibleCategories.includes(id))
        .map(id => categories.find(c => c.note_category_id === id))
        .filter(Boolean) as DbNoteCategory[];

    // Category filter helpers
    const toggleCategoryVisibility = (id: string) => {
        setVisibleCategories(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };
    const moveCategoryUp = (id: string) => {
        setCategoryOrder(prev => {
            const idx = prev.indexOf(id); if (idx <= 0) return prev;
            const arr = [...prev];[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]; return arr;
        });
    };
    const moveCategoryDown = (id: string) => {
        setCategoryOrder(prev => {
            const idx = prev.indexOf(id); if (idx < 0 || idx >= prev.length - 1) return prev;
            const arr = [...prev];[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]; return arr;
        });
    };

    // Category Tab Drag handlers
    const handleCatDragStart = (e: React.DragEvent, catId: string) => {
        setDraggedCatId(catId);
        e.dataTransfer.effectAllowed = 'move';
        if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.5';
    };
    const handleCatDragEnd = (e: React.DragEvent) => {
        if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1';
        setDraggedCatId(null); setDragOverCatId(null);
    };
    const handleCatDragOver = (e: React.DragEvent, catId: string) => {
        e.preventDefault(); setDragOverCatId(catId);
    };
    const handleCatDrop = (e: React.DragEvent, targetCatId: string) => {
        e.preventDefault(); setDragOverCatId(null);
        if (!draggedCatId || draggedCatId === targetCatId) return;
        setCategoryOrder(prev => {
            const arr = [...prev];
            const fromIdx = arr.indexOf(draggedCatId);
            const toIdx = arr.indexOf(targetCatId);
            if (fromIdx < 0 || toIdx < 0) return prev;
            arr.splice(fromIdx, 1);
            arr.splice(toIdx, 0, draggedCatId);
            return arr;
        });
        setDraggedCatId(null);
    };

    // Note card Drag & Drop
    const handleDragStart = (e: React.DragEvent, note: ExtendedNote) => {
        setDraggedNote(note); e.dataTransfer.effectAllowed = 'move';
        if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.5';
    };
    const handleDragEnd = (e: React.DragEvent) => {
        if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1';
        setDraggedNote(null); setDragOverStatus(null);
    };
    const handleDragOver = (e: React.DragEvent, status: string) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverStatus(status); };
    const handleDragLeave = () => setDragOverStatus(null);
    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault(); setDragOverStatus(null);
        if (!draggedNote || draggedNote.status === newStatus) return;
        setNotes(prev => prev.map(n => n.note_id === draggedNote.note_id ? { ...n, status: newStatus as ExtendedNote['status'] } : n));
        try { await apiClient.fetch(`/api/notes/${draggedNote.note_id}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) }); } catch { fetchNotes(); }
        setDraggedNote(null);
    };

    const handleDelete = async (noteId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotes(prev => prev.filter(n => n.note_id !== noteId));
        try { await apiClient.fetch(`/api/notes/${noteId}`, { method: 'PATCH', body: JSON.stringify({ is_deleted: true }) }); } catch { fetchNotes(); }
    };

    const handleRestore = async (noteId: string) => {
        setTrashedNotes(prev => prev.filter(n => n.note_id !== noteId));
        try { await apiClient.fetch(`/api/notes/${noteId}`, { method: 'PATCH', body: JSON.stringify({ is_deleted: false }) }); fetchNotes(); } catch { fetchTrashedNotes(); }
    };

    const handlePermanentDelete = async (noteId: string) => {
        setTrashedNotes(prev => prev.filter(n => n.note_id !== noteId));
        try { await apiClient.fetch(`/api/notes/${noteId}`, { method: 'DELETE' }); } catch { fetchTrashedNotes(); }
    };

    const handleOpenCreate = () => { setSelectedNote(null); setIsModalOpen(true); };
    const handleOpenEdit = (note: ExtendedNote) => { setSelectedNote(note); setIsModalOpen(true); };
    const handleSave = () => { fetchNotes(); };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Notes Dashboard</h1>
                    {/* Status Summary — name before count, colored pill background */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {statusSummary.map(({ status, count }) => {
                            const style = statusStyles[status];
                            return (
                                <div key={status} className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full", style.pillBg)}>
                                    <div className={cn("w-2 h-2 rounded-full", style.dot)} />
                                    <span className={cn("text-xs font-bold", style.text)}>{status}</span>
                                    <span className={cn("text-sm font-black", style.text)}>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search..." className="pl-10 h-10 w-48 bg-card/50 border-border/50 rounded-xl text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <Button onClick={handleOpenCreate} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create
                    </Button>
                    <Button variant="outline" onClick={() => { setShowTrash(true); fetchTrashedNotes(); }} className="h-10 px-4 rounded-xl border-border/50 bg-card/50 flex items-center gap-2 text-muted-foreground hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                        Trash
                    </Button>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-card/50 border border-border/50 rounded-xl px-3 py-1.5">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 w-36 bg-transparent border-0 text-sm p-0 focus:ring-0" />
                    <span className="text-muted-foreground text-xs">to</span>
                    <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 w-36 bg-transparent border-0 text-sm p-0 focus:ring-0" />
                    {(dateFrom || dateTo) && (
                        <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="p-1 text-muted-foreground hover:text-rose-500"><X className="w-3.5 h-3.5" /></button>
                    )}
                </div>
                <Button variant="outline" onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                    className={cn("h-10 px-4 rounded-xl border-border/50 bg-card/50 flex items-center gap-2 text-sm font-bold", showCategoryFilter && "border-primary/30 text-primary")}>
                    <Filter className="w-4 h-4" />
                    Category Filter
                </Button>
            </div>

            {/* Category Filter Panel */}
            {showCategoryFilter && (
                <div className="bg-card/50 border border-border/50 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Show / Hide & Reorder</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setVisibleCategories(categoryOrder)}
                                className="text-[10px] font-bold text-primary hover:underline"
                            >
                                Select All
                            </button>
                            <span className="text-border">|</span>
                            <button
                                onClick={() => setVisibleCategories([])}
                                className="text-[10px] font-bold text-rose-500 hover:underline"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                    {categoryOrder.map((id, idx) => {
                        const cat = categories.find(c => c.note_category_id === id);
                        if (!cat) return null;
                        const isVisible = visibleCategories.includes(id);
                        return (
                            <div key={id} className="flex items-center gap-3 py-1.5">
                                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                    <input type="checkbox" checked={isVisible} onChange={() => toggleCategoryVisibility(id)} className="w-4 h-4 rounded accent-primary" />
                                    <span className="text-sm">{cat.icon || '📝'}</span>
                                    <span className={cn("text-sm font-medium", isVisible ? "text-foreground" : "text-muted-foreground line-through")}>{cat.name}</span>
                                </label>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => moveCategoryUp(id)} disabled={idx === 0} className="p-1 text-muted-foreground hover:text-primary disabled:opacity-20"><ChevronUp className="w-4 h-4" /></button>
                                    <button onClick={() => moveCategoryDown(id)} disabled={idx === categoryOrder.length - 1} className="p-1 text-muted-foreground hover:text-primary disabled:opacity-20"><ChevronDown className="w-4 h-4" /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Category Tabs — Draggable */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {orderedCategories.map(cat => {
                    const count = getCategoryCount(cat.note_category_id);
                    const isSelected = selectedCategoryId === cat.note_category_id;
                    const isDragOverCat = dragOverCatId === cat.note_category_id;
                    return (
                        <button
                            key={cat.note_category_id}
                            draggable
                            onDragStart={(e) => handleCatDragStart(e, cat.note_category_id)}
                            onDragEnd={handleCatDragEnd}
                            onDragOver={(e) => handleCatDragOver(e, cat.note_category_id)}
                            onDrop={(e) => handleCatDrop(e, cat.note_category_id)}
                            onClick={() => setSelectedCategoryId(cat.note_category_id)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border cursor-grab active:cursor-grabbing',
                                isSelected
                                    ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                                    : 'bg-card/50 text-muted-foreground border-border/50 hover:border-primary/20 hover:text-foreground',
                                isDragOverCat && 'ring-2 ring-primary/30 scale-105'
                            )}
                        >
                            <span className="text-base">{cat.icon || '📝'}</span>
                            <span>{cat.name}</span>
                            <span className={cn('ml-1 px-2 py-0.5 rounded-full text-[10px] font-black', isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Kanban Board */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground font-medium">Loading notes...</p>
                </div>
            ) : (
                <div className="overflow-x-auto pb-4 -mx-2 px-2">
                    <div className="flex gap-5 md:grid md:grid-cols-2 xl:grid-cols-4">
                        {STATUS_COLUMNS.map(status => {
                            const style = statusStyles[status];
                            const columnNotes = filteredNotes.filter(n => n.status === status);
                            const isDragOver = dragOverStatus === status;
                            return (
                                <div
                                    key={status}
                                    className={cn("rounded-2xl border transition-all duration-200 min-h-[350px] min-w-[280px] md:min-w-0", style.border, style.bg, isDragOver && "ring-2 ring-primary/30 border-primary/30 scale-[1.01]")}
                                    onDragOver={(e) => handleDragOver(e, status)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, status)}
                                >
                                    {/* Column Header */}
                                    <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className={cn("w-3 h-3 rounded-full", style.dot)} />
                                            <h3 className={cn("text-sm font-black uppercase tracking-wider", style.text)}>{status}</h3>
                                        </div>
                                        <span className={cn("px-3 py-1 rounded-full text-lg font-black", style.text, style.countBg)}>
                                            {columnNotes.length}
                                        </span>
                                    </div>

                                    {/* Cards */}
                                    <div className="p-3 space-y-3">
                                        {columnNotes.map(note => {
                                            const deadline = note.reminders ? getDaysRemainingText(note.reminders.due_date) : null;
                                            return (
                                                <div
                                                    key={note.note_id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, note)}
                                                    onDragEnd={handleDragEnd}
                                                    onClick={() => handleOpenEdit(note)}
                                                    className="group bg-card border border-border/50 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-primary/30 hover:shadow-md transition-all duration-200"
                                                >
                                                    <div className="flex items-start gap-2.5">
                                                        <GripVertical className="w-4 h-4 text-muted-foreground/30 mt-0.5 shrink-0 group-hover:text-muted-foreground transition-colors" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="text-sm shrink-0">{note.note_categories?.icon || '📝'}</span>
                                                                    <h4 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{note.title}</h4>
                                                                </div>
                                                                <button onClick={(e) => handleDelete(note.note_id, e)} className="p-1 rounded-lg text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0" title="Move to Trash">
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                            {note.content && (
                                                                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                                                                    {note.content.replace(/<[^>]*>/g, '').trim().substring(0, 80)}
                                                                </p>
                                                            )}
                                                            {/* Bottom: Deadline + Days remaining */}
                                                            {deadline && (
                                                                <div className="mt-2.5 flex items-center justify-between">
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        📅 {new Date(note.reminders!.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                    </span>
                                                                    <span className={cn(
                                                                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                                                        deadline.isOverdue ? "bg-rose-500/10 text-rose-600" : "bg-primary/10 text-primary"
                                                                    )}>
                                                                        {deadline.text}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {columnNotes.length === 0 && (
                                            <div className="py-8 text-center"><p className="text-xs text-muted-foreground/50 font-medium">{isDragOver ? 'Drop here' : 'No notes'}</p></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <NoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} note={selectedNote} onSave={handleSave} />

            {/* Trash Popup */}
            <Modal isOpen={showTrash} onClose={() => setShowTrash(false)} title="🗑️ Trash">
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {trashedNotes.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="font-bold">Trash is empty</p>
                        </div>
                    ) : trashedNotes.map(note => (
                        <div key={note.note_id} className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-xl">
                            <span className="text-sm">{note.note_categories?.icon || '📝'}</span>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-foreground line-clamp-1">{note.title}</h4>
                                <p className="text-[10px] text-muted-foreground">{note.note_categories?.name || 'Uncategorized'}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Button variant="outline" onClick={() => handleRestore(note.note_id)} className="h-8 px-3 rounded-lg text-xs font-bold border-border/50 text-primary hover:bg-primary/10">
                                    Restore
                                </Button>
                                <Button variant="outline" onClick={() => handlePermanentDelete(note.note_id)} className="h-8 px-3 rounded-lg text-xs font-bold border-border/50 text-rose-500 hover:bg-rose-500/10">
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default NoteDashboard;
