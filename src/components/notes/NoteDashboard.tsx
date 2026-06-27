'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    Search, Plus, Loader2, Trash2, GripVertical,
    Filter, X, CalendarDays, ChevronUp, ChevronDown, Settings,
    MoreVertical, Copy, Calendar as LucideCalendar,
    Sparkles, PlayCircle, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { 
    startOfWeek, 
    endOfWeek, 
    startOfMonth, 
    endOfMonth,
    format
} from 'date-fns';
import { Button, Input, Modal } from '@/components/ui';
import NoteModal from './NoteModal';
import NoteCategoryIcon from './NoteCategoryIcon';
import { DbNote, DbNoteCategory, DbReminder } from '@/lib/supabase-types';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { useLoading } from '@/components/providers/LoadingProvider';

interface ExtendedNote extends DbNote {
    note_categories?: DbNoteCategory;
    reminders?: DbReminder;
}

// New status colors: New=yellow, In Progress=orange, Urgent=red, Done=blue
// Column order: New first, then In Progress
const STATUS_COLUMNS = ['New', 'In Progress', 'Urgent', 'Done'];

const formatStatusLabel = (status: string): string => {
    if (status === 'In Progress') return 'In progress';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    'New': Sparkles,
    'In Progress': PlayCircle,
    'Urgent': AlertTriangle,
    'Done': CheckCircle2,
};

const statusStyles: Record<string, { bg: string; text: string; border: string; dot: string; countBg: string; pillBg: string; ring: string; icon: string }> = {
    'New':         { bg: 'bg-[#eceff3]', text: 'text-[#1f2937]', border: 'border-[#c0c7d1] border-t-[#7f8a99]', dot: 'bg-[#f59e0b]',   countBg: 'bg-[#f8fafc] ring-1 ring-[#7f8a99]/35', pillBg: 'bg-[#e2e8f0]',  ring: 'ring-[#7f8a99]/35', icon: 'text-[#f59e0b]' },
    'In Progress': { bg: 'bg-[#eceff3]', text: 'text-[#1f2937]', border: 'border-[#c0c7d1] border-t-[#7f8a99]', dot: 'bg-[#3B82F6]',   countBg: 'bg-[#f8fafc] ring-1 ring-[#7f8a99]/35', pillBg: 'bg-[#e2e8f0]',  ring: 'ring-[#7f8a99]/35', icon: 'text-[#3B82F6]' },
    'Urgent':      { bg: 'bg-[#eceff3]', text: 'text-[#1f2937]', border: 'border-[#c0c7d1] border-t-[#7f8a99]', dot: 'bg-rose-500',    countBg: 'bg-[#f8fafc] ring-1 ring-[#7f8a99]/35', pillBg: 'bg-[#e2e8f0]',  ring: 'ring-[#7f8a99]/35', icon: 'text-rose-500' },
    'Done':        { bg: 'bg-[#eceff3]', text: 'text-[#1f2937]', border: 'border-[#c0c7d1] border-t-[#7f8a99]', dot: 'bg-[#4b5563]',   countBg: 'bg-[#f8fafc] ring-1 ring-[#7f8a99]/35', pillBg: 'bg-[#e2e8f0]',  ring: 'ring-[#7f8a99]/35', icon: 'text-[#4b5563]' },
};

// Palette assigned to categories (round-robin by sort order)
const CATEGORY_PALETTE = [
    { base: '#12275c', bg: '#e8ecf5', text: '#12275c', border: '#12275c40', countBg: '#12275c20' },
    { base: '#7a9bb5', bg: '#dce8f0', text: '#2d5a7a', border: '#abc5d440', countBg: '#abc5d430' },
    { base: '#5a8a6e', bg: '#daeee4', text: '#2e6147', border: '#bcd5c740', countBg: '#bcd5c730' },
    { base: '#6b7e4a', bg: '#e5ecda', text: '#4a5930', border: '#8b9d6b40', countBg: '#8b9d6b30' },
    { base: '#d47a00', bg: '#fff0d9', text: '#9a5500', border: '#ffa64640', countBg: '#ffa64630' },
    { base: '#b06060', bg: '#fce8e8', text: '#8a3c3c', border: '#f1a8a840', countBg: '#f1a8a830' },
    { base: '#7a4e78', bg: '#eedde9', text: '#5c2e5a', border: '#9e6c8c40', countBg: '#9e6c8c30' },
];

const getCategoryColor = (index: number) => CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];

const STATUS_CARD_THEMES: Record<string, { bg: string; accent: string; border: string }> = {
    'New': { bg: '#EBE4D6', accent: '#f59e0b', border: '#D9CEBD' },
    'In Progress': { bg: '#BFD2DC', accent: '#3B82F6', border: '#A3BBC6' },
    'Urgent': { bg: '#CFC8B8', accent: '#e11d48', border: '#B8AFA0' },
    'Done': { bg: '#D8D7A8', accent: '#98AD57', border: '#C4C38E' },
};

interface StatusSummaryCardProps {
    count: number;
    label: string;
    bg: string;
    accentColor: string;
    borderColor: string;
    ariaLabel: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>;
    className?: string;
    onClick?: () => void;
}

const StatusSummaryCard: React.FC<StatusSummaryCardProps> = ({
    count,
    label,
    bg,
    accentColor,
    borderColor,
    ariaLabel,
    icon: Icon,
    className,
    onClick,
}) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={`${ariaLabel}: ${count}`}
        className={cn(
            'rounded-2xl border p-3.5 sm:p-4 shadow-[0_4px_16px_-4px_rgba(18,39,92,0.08)] min-h-[88px] flex-1 min-w-[108px] basis-0 text-left transition-all hover:brightness-[0.97] active:scale-[0.99]',
            className
        )}
        style={{ backgroundColor: bg, borderColor }}
    >
        <div className="flex items-center justify-between gap-3 h-full">
            <div className="flex flex-col justify-between self-stretch min-h-[56px]">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    {label}
                </span>
                <p className="text-3xl font-black leading-none tabular-nums text-black">
                    {count}
                </p>
            </div>
            <Icon className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" style={{ color: accentColor }} strokeWidth={2} />
        </div>
    </button>
);

function getDaysRemainingText(dueDate: string, status?: string, updatedAt?: string): { text: string; isOverdue: boolean; isDueToday?: boolean } {
    const now = new Date();
    if (status === 'Done' && updatedAt) {
        now.setTime(new Date(updatedAt).getTime());
    }
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
        const abs = Math.abs(diffDays);
        if (abs >= 30) { const m = Math.floor(abs / 30); const d = abs % 30; return { text: `${m} month${m > 1 ? 's' : ''} ${d} day${d !== 1 ? 's' : ''} overdue`, isOverdue: true }; }
        return { text: `${abs} day${abs !== 1 ? 's' : ''} overdue`, isOverdue: true };
    }
    if (diffDays === 0) return { text: 'Due today', isOverdue: false, isDueToday: true };
    if (diffDays >= 30) { const m = Math.floor(diffDays / 30); const d = diffDays % 30; return { text: `${m} month${m > 1 ? 's' : ''} ${d} day${d !== 1 ? 's' : ''} left`, isOverdue: false }; }
    return { text: `${diffDays} day${diffDays !== 1 ? 's' : ''} left`, isOverdue: false };
}

const NoteDashboard: React.FC = () => {
    const { startLoading, stopLoading } = useLoading();
    const [notes, setNotes] = useState<ExtendedNote[]>([]);
    const [trashedNotes, setTrashedNotes] = useState<ExtendedNote[]>([]);
    const [categories, setCategories] = useState<DbNoteCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCloneMode, setIsCloneMode] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState<'New' | 'In Progress' | 'Urgent' | 'Done'>('New');
    const [selectedNote, setSelectedNote] = useState<ExtendedNote | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

    // Search debouncing
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);
    const [draggedNote, setDraggedNote] = useState<ExtendedNote | null>(null);
    const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
    const [dragOverNoteId, setDragOverNoteId] = useState<string | null>(null);

    // Category filter
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);
    const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
    const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

    // Category tab drag
    const [draggedCatId, setDraggedCatId] = useState<string | null>(null);
    const [dragOverCatId, setDragOverCatId] = useState<string | null>(null);

    // Date filter - Default to current month
    const defaultDateFrom = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const defaultDateTo = format(endOfMonth(new Date()), 'yyyy-MM-dd');
    const [dateFrom, setDateFrom] = useState(defaultDateFrom);
    const [dateTo, setDateTo] = useState(defaultDateTo);

    // Trash popup
    const [showTrash, setShowTrash] = useState(false);

    // Category settings popup
    const [showCategorySettings, setShowCategorySettings] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Track whether categories have been initialized
    const categoriesInitialized = useRef(false);
    const hasUserChangedSettings = useRef(false);
    const STORAGE_KEY_VISIBLE = 'note-dashboard-visible-categories';
    const STORAGE_KEY_ORDER = 'note-dashboard-category-order';

    const fetchCategories = useCallback(async () => {
        try {
            const res = await apiClient.fetch('/api/note-categories');
            const json = await res.json();
            if (json.success) {
                const cats: DbNoteCategory[] = json.data || [];
                setCategories(cats);
                const allIds = cats.map(c => c.note_category_id);

                if (!categoriesInitialized.current) {
                    categoriesInitialized.current = true;
                    // Try to load saved settings from localStorage
                    const savedVisibleStr = localStorage.getItem(STORAGE_KEY_VISIBLE);
                    const savedOrderStr = localStorage.getItem(STORAGE_KEY_ORDER);

                    let orderArr: string[] = [];
                    if (savedOrderStr) {
                        try { orderArr = JSON.parse(savedOrderStr); } catch { orderArr = []; }
                        const validOrder = orderArr.filter(id => allIds.includes(id));
                        const newIds = allIds.filter(id => !validOrder.includes(id));
                        setCategoryOrder([...validOrder, ...newIds]);
                    } else {
                        setCategoryOrder(allIds);
                    }

                    if (savedVisibleStr !== null) {
                        try {
                            const parsedVisible = JSON.parse(savedVisibleStr) as string[];
                            const validVisible = parsedVisible.filter(id => allIds.includes(id));
                            setVisibleCategories(validVisible);
                        } catch {
                            setVisibleCategories([]);
                        }
                    } else {
                        // First visit: hide all categories until user enables them
                        setVisibleCategories([]);
                    }
                } else {
                    // Subsequent loads: preserve existing filter/order exactly as it is without auto-adding
                    setCategoryOrder(prev => {
                        const newIds = allIds.filter(id => !prev.includes(id));
                        const existing = prev.filter(id => allIds.includes(id));
                        return [...existing, ...newIds]; // order safely appends at the end
                    });

                    // Don't modify visibleCategories automatically so they stay hidden until explicitly enabled
                    setVisibleCategories(prev => prev.filter(id => allIds.includes(id)));
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }

        // Cleanup old localstorage key if it exists
        localStorage.removeItem('note-dashboard-selected-categories');
    }, []);

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('filter', 'journey');
            if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
            if (selectedCategoryIds.length > 0) params.append('category_ids', selectedCategoryIds.join(','));
            if (dateFrom) params.append('due_date_from', dateFrom);
            if (dateTo) params.append('due_date_to', dateTo);

            const res = await apiClient.fetch(`/api/notes?${params.toString()}`);
            const json = await res.json();
            if (json.success) {
                // Keep Journey logic: filter out notes that have tags (they belong in Short Notes)
                const allNotes = json.data || [];
                const journeyNotes = allNotes.filter((n: any) => !n.note_tags || n.note_tags.length === 0);
                setNotes(journeyNotes);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchQuery, selectedCategoryIds, dateFrom, dateTo]);

    const fetchTrashedNotes = useCallback(async () => {
        try {
            const res = await apiClient.fetch('/api/notes?filter=deleted');
            const json = await res.json();
            if (json.success) setTrashedNotes(json.data || []);
        } catch (error) {
            console.error('Error fetching trashed notes:', error);
        }
    }, []);

    useEffect(() => { fetchCategories(); }, []);
    useEffect(() => { fetchNotes(); }, [fetchNotes]);

    // Sync loading state with global LoadingOverlay
    useEffect(() => {
        if (loading && notes.length === 0) {
            startLoading();
        } else {
            stopLoading();
        }
    }, [loading, notes.length, startLoading, stopLoading]);

    // Close settings on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
                setShowCategorySettings(false);
            }
        };
        if (showCategorySettings) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showCategorySettings]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = () => setOpenDropdownId(null);
        if (openDropdownId) document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [openDropdownId]);

    useEffect(() => {
        if (categoriesInitialized.current && hasUserChangedSettings.current) {
            localStorage.setItem(STORAGE_KEY_VISIBLE, JSON.stringify(visibleCategories));
        }
    }, [visibleCategories]);

    useEffect(() => {
        if (categoriesInitialized.current && hasUserChangedSettings.current) {
            localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(categoryOrder));
        }
    }, [categoryOrder]);

    const toggleCategorySelection = (id: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Filered notes (now handled mostly by API, except for journey/tags logic)
    const filteredNotes = useMemo<ExtendedNote[]>(() => {
        return notes;
    }, [notes]);

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
        hasUserChangedSettings.current = true;
        setVisibleCategories(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };
    const moveCategoryUp = (id: string) => {
        hasUserChangedSettings.current = true;
        setCategoryOrder(prev => {
            const idx = prev.indexOf(id); if (idx <= 0) return prev;
            const arr = [...prev];[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]; return arr;
        });
    };
    const moveCategoryDown = (id: string) => {
        hasUserChangedSettings.current = true;
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
        hasUserChangedSettings.current = true;
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

    // Note card Drag & Drop (cross-column + within-column reorder)
    const handleDragStart = (e: React.DragEvent, note: ExtendedNote) => {
        setDraggedNote(note); e.dataTransfer.effectAllowed = 'move';
        if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.4';
    };
    const handleDragEnd = (e: React.DragEvent) => {
        if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1';
        setDraggedNote(null); setDragOverStatus(null); setDragOverNoteId(null);
    };
    const handleDragOver = (e: React.DragEvent, status: string) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverStatus(status); };
    const handleCardDragOver = (e: React.DragEvent, noteId: string, status: string) => {
        e.preventDefault(); e.stopPropagation();
        setDragOverStatus(status); setDragOverNoteId(noteId);
    };
    const handleDragLeave = () => { setDragOverStatus(null); setDragOverNoteId(null); };
    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault(); setDragOverStatus(null);
        const targetNoteId = dragOverNoteId;
        setDragOverNoteId(null);
        if (!draggedNote) return;

        if (draggedNote.status === newStatus) {
            // Same column reorder
            if (targetNoteId && targetNoteId !== draggedNote.note_id) {
                setNotes(prev => {
                    const arr = [...prev];
                    const fromIdx = arr.findIndex(n => n.note_id === draggedNote.note_id);
                    const toIdx = arr.findIndex(n => n.note_id === targetNoteId);
                    if (fromIdx < 0 || toIdx < 0) return prev;
                    const [moved] = arr.splice(fromIdx, 1);
                    arr.splice(toIdx, 0, moved);
                    return arr;
                });
            }
        } else {
            // Cross-column: change status
            setNotes(prev => prev.map(n => n.note_id === draggedNote.note_id ? { ...n, status: newStatus as ExtendedNote['status'] } : n));
            try { await apiClient.fetch(`/api/notes/${draggedNote.note_id}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) }); } catch { fetchNotes(); }
        }
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

    const handleOpenCreate = () => { setSelectedNote(null); setIsCloneMode(false); setDefaultStatus('New'); setIsModalOpen(true); };
    const handleOpenCreateWithStatus = (status: 'New' | 'In Progress' | 'Urgent' | 'Done') => {
        setSelectedNote(null);
        setIsCloneMode(false);
        setDefaultStatus(status);
        setIsModalOpen(true);
    };
    const handleOpenEdit = (note: ExtendedNote) => { setSelectedNote(note); setIsCloneMode(false); setIsModalOpen(true); };
    const handleClone = (note: ExtendedNote) => { setSelectedNote(note); setIsCloneMode(true); setIsModalOpen(true); };
    const handleSave = () => { fetchNotes(); };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-black text-foreground tracking-tight">Journey</h1>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <div className="group/search">
                        <Input
                            placeholder="Search..."
                            className="h-10 w-64 md:w-80 bg-card/50 border-border/50 rounded-xl text-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            leftIcon={<Search className="w-4 h-4 ml-1" />}
                            rightIcon={
                                searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        aria-label="Clear search"
                                        className="p-1.5 mr-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )
                            }
                        />
                    </div>
                    <Button onClick={handleOpenCreate} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create
                    </Button>
                    <Button variant="outline" onClick={() => { setShowTrash(true); fetchTrashedNotes(); }} className="h-10 px-4 rounded-xl border-border/50 bg-card/50 flex items-center gap-2 text-muted-foreground hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                        Trash
                    </Button>
                    {/* Settings button */}
                    <div className="relative" ref={settingsRef}>
                        <Button
                            variant="outline"
                            onClick={() => setShowCategorySettings(!showCategorySettings)}
                            aria-label="Category settings"
                            className={cn(
                                "h-10 w-10 p-0 rounded-xl border-border/50 bg-card/50 text-muted-foreground hover:text-primary",
                                showCategorySettings && "border-primary/30 text-primary bg-primary/5"
                            )}
                        >
                            <Settings className="w-4 h-4" />
                        </Button>

                        {/* Category Settings Dropdown */}
                        {showCategorySettings && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-black text-foreground">Category Settings</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => { hasUserChangedSettings.current = true; setVisibleCategories(categoryOrder); }}
                                            className="text-[10px] font-bold text-primary hover:underline"
                                        >
                                            Show All
                                        </button>
                                        <span className="text-border">|</span>
                                        <button
                                            onClick={() => { hasUserChangedSettings.current = true; setVisibleCategories([]); }}
                                            className="text-[10px] font-bold text-rose-500 hover:underline"
                                        >
                                            Hide All
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {categoryOrder.map((id) => {
                                        const cat = categories.find(c => c.note_category_id === id);
                                        if (!cat) return null;
                                        const isVisible = visibleCategories.includes(id);
                                        return (
                                            <label
                                                key={id}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                                                    isVisible ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30 opacity-50"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 transition-all",
                                                        isVisible ? "shadow-sm" : "grayscale"
                                                    )}
                                                    style={{ backgroundColor: isVisible ? `${cat.color_code}20` : '#e2e8f0' }}
                                                >
                                                    <NoteCategoryIcon categoryName={cat.name} size={16} />
                                                </div>
                                                <span className={cn("flex-1 text-sm font-bold", isVisible ? "text-foreground" : "text-muted-foreground line-through")}>
                                                    {cat.name}
                                                </span>
                                                {/* Toggle switch */}
                                                <button
                                                    onClick={(e) => { e.preventDefault(); toggleCategoryVisibility(id); }}
                                                    role="switch"
                                                    aria-checked={isVisible}
                                                    aria-label={`Toggle visibility for ${cat.name}`}
                                                    className={cn(
                                                        "w-10 h-6 rounded-full relative transition-all cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                                        isVisible ? "bg-primary" : "bg-muted-foreground/30"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-md transition-all",
                                                        isVisible ? "left-[19px]" : "left-[3px]"
                                                    )} />
                                                </button>
                                            </label>
                                        );
                                    })}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-3 text-center">Settings are saved automatically</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status pills + summary cards + date filters */}
            <div className="flex flex-col xl:flex-row gap-4 xl:gap-5 items-stretch xl:items-start">
                <div className="space-y-4 flex-1 min-w-0">
                    {/* Status pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {statusSummary.map(({ status, count }) => {
                            const style = statusStyles[status];
                            const StatusIcon = STATUS_ICONS[status];
                            return (
                                <div key={status} className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full", style.pillBg)}>
                                    {StatusIcon && <StatusIcon className={cn("w-3.5 h-3.5 shrink-0", style.icon)} />}
                                    <span className={cn("text-xs font-bold", style.text)}>{formatStatusLabel(status)}</span>
                                    <span className={cn("text-sm font-black", style.text)}>{count}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Filters Row */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 bg-card/50 border border-border/50 rounded-xl px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary shadow-sm">
                            <CalendarDays className="w-4 h-4 text-muted-foreground mr-1" />
                            <Input type="date" aria-label="From date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 w-36 bg-transparent border-0 text-sm p-0 focus:ring-0 font-medium" />
                            <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-40">to</span>
                            <Input type="date" aria-label="To date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 w-36 bg-transparent border-0 text-sm p-0 focus:ring-0 font-medium" />
                            {(dateFrom !== defaultDateFrom || dateTo !== defaultDateTo) && (
                                <button onClick={() => { setDateFrom(defaultDateFrom); setDateTo(defaultDateTo); }} aria-label="Clear date range" className="p-1 text-muted-foreground hover:text-rose-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                            )}
                        </div>

                        {/* Quick Filters */}
                        <div className="flex items-center gap-1.5 p-1 bg-card/30 border border-border/50 rounded-xl shadow-sm">
                            <button
                                onClick={() => {
                                    const today = format(new Date(), 'yyyy-MM-dd');
                                    if (dateFrom === today && dateTo === today) {
                                        setDateFrom(defaultDateFrom);
                                        setDateTo(defaultDateTo);
                                    } else {
                                        setDateFrom(today);
                                        setDateTo(today);
                                    }
                                }}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    dateFrom === format(new Date(), 'yyyy-MM-dd') && dateTo === format(new Date(), 'yyyy-MM-dd')
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                )}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => {
                                    const now = new Date();
                                    const start = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
                                    const end = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
                                    if (dateFrom === start && dateTo === end) {
                                        setDateFrom(defaultDateFrom);
                                        setDateTo(defaultDateTo);
                                    } else {
                                        setDateFrom(start);
                                        setDateTo(end);
                                    }
                                }}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    dateFrom === format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd') && dateTo === format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                )}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => {
                                    const now = new Date();
                                    const start = format(startOfMonth(now), 'yyyy-MM-dd');
                                    const end = format(endOfMonth(now), 'yyyy-MM-dd');
                                    if (dateFrom === start && dateTo === end) {
                                        setDateFrom(defaultDateFrom);
                                        setDateTo(defaultDateTo);
                                    } else {
                                        setDateFrom(start);
                                        setDateTo(end);
                                    }
                                }}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    dateFrom === format(startOfMonth(new Date()), 'yyyy-MM-dd') && dateTo === format(endOfMonth(new Date()), 'yyyy-MM-dd')
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                )}
                            >
                                Month
                            </button>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => setShowCategoryFilter(true)}
                            className={cn(
                                'h-10 px-4 rounded-xl border-border/50 bg-card/50 flex items-center gap-2 text-sm font-bold',
                                (showCategoryFilter || visibleCategories.length < categoryOrder.length) &&
                                    'border-primary/30 text-primary bg-primary/5'
                            )}
                        >
                            <Filter className="w-4 h-4" />
                            Category Filter
                        </Button>
                    </div>
                </div>

                {/* Status summary cards — horizontal row, flexible width */}
                <div className="flex gap-3 w-full xl:w-auto xl:flex-[1.35] xl:min-w-[360px] min-w-0 overflow-x-auto scrollbar-hide">
                    {statusSummary.map(({ status, count }) => {
                        const theme = STATUS_CARD_THEMES[status];
                        const Icon = STATUS_ICONS[status];
                        return (
                            <StatusSummaryCard
                                key={status}
                                ariaLabel={formatStatusLabel(status)}
                                label={formatStatusLabel(status)}
                                count={count}
                                bg={theme.bg}
                                accentColor={theme.accent}
                                borderColor={theme.border}
                                icon={Icon}
                                onClick={() => handleOpenCreateWithStatus(status as 'New' | 'In Progress' | 'Urgent' | 'Done')}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Category Tabs - Draggable */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {orderedCategories.map((cat, catIdx) => {
                    const count = getCategoryCount(cat.note_category_id);
                    const isSelected = selectedCategoryIds.includes(cat.note_category_id);
                    const isDragOverCat = dragOverCatId === cat.note_category_id;
                    const catColor = getCategoryColor(catIdx);
                    return (
                        <button
                            key={cat.note_category_id}
                            draggable
                            onDragStart={(e) => handleCatDragStart(e, cat.note_category_id)}
                            onDragEnd={handleCatDragEnd}
                            onDragOver={(e) => handleCatDragOver(e, cat.note_category_id)}
                            onDrop={(e) => handleCatDrop(e, cat.note_category_id)}
                            onClick={() => toggleCategorySelection(cat.note_category_id)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border-2 cursor-grab active:cursor-grabbing shadow-sm',
                                isDragOverCat && 'ring-2 ring-offset-1 scale-105'
                            )}
                            style={{
                                backgroundColor: isSelected ? catColor.bg : `${catColor.bg}80`,
                                borderColor: isSelected ? catColor.bg : `${catColor.bg}80`,
                                color: catColor.text,
                                boxShadow: isSelected ? `0 2px 8px ${catColor.base}30` : undefined,
                            }}
                        >
                            <span className="flex items-center shrink-0"><NoteCategoryIcon categoryName={cat.name} size={16} /></span>
                            <span className="hidden md:inline">{cat.name}</span>
                            <span
                                className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-black"
                                style={{ backgroundColor: catColor.countBg, color: catColor.text }}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Kanban Board */}
            {loading ? (
                <div className="overflow-x-auto pb-4 -mx-2 px-2">
                    <div className="flex gap-5 md:grid md:grid-cols-2 xl:grid-cols-4">
                        {[0, 1, 2, 3].map(col => (
                            <div key={col} className="h-[calc(100vh-140px)] min-h-[400px] min-w-[280px] flex-1 bg-card/30 border border-border/30 rounded-2xl p-4 space-y-4 overflow-hidden">
                                {/* Column header skeleton */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-muted/60 animate-pulse" />
                                        <div className="h-4 w-20 rounded-lg bg-muted/40 animate-pulse" />
                                    </div>
                                    <div className="h-6 w-8 rounded-full bg-muted/30 animate-pulse" />
                                </div>
                                {/* Card skeletons */}
                                {[0, 1, 2].map(card => (
                                    <div key={card} className="bg-card/50 border border-border/20 rounded-xl p-4 space-y-3" style={{ animationDelay: `${col * 100 + card * 150}ms` }}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-muted/40 animate-pulse" />
                                            <div className="flex-1 space-y-1.5">
                                                <div className="h-3.5 w-3/4 rounded-md bg-muted/40 animate-pulse" />
                                                <div className="h-2.5 w-1/2 rounded-md bg-muted/30 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="h-2.5 w-full rounded-md bg-muted/25 animate-pulse" />
                                            <div className="h-2.5 w-2/3 rounded-md bg-muted/20 animate-pulse" />
                                        </div>
                                        <div className="flex items-center justify-between pt-1">
                                            <div className="h-5 w-16 rounded-full bg-muted/30 animate-pulse" />
                                            <div className="h-3 w-20 rounded-md bg-muted/20 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto pb-4 -mx-2 px-2">
                    <div className="flex gap-5 md:grid md:grid-cols-2 xl:grid-cols-4">
                        {STATUS_COLUMNS.map(status => {
                            const style = statusStyles[status];
                            const StatusIcon = STATUS_ICONS[status];
                            const columnNotes = filteredNotes.filter(n => n.status === status);
                            const isDragOver = dragOverStatus === status;
                            return (
                                <div
                                    key={status}
                                    className={cn(
                                        "rounded-2xl border border-t-[3px] transition-all h-[calc(100vh-350px)] min-h-[400px] min-w-[280px] md:min-w-0 flex flex-col overflow-hidden shadow-sm hover:shadow bg-[#f6f8fb] border-[#d6dde6] border-t-[#a7b1bf]",
                                        isDragOver ? cn("bg-primary/5 border-primary shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.5)]") : ''
                                    )}
                                    onDragOver={(e) => handleDragOver(e, status)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, status)}
                                >
                                    {/* Column Header */}
                                    <button
                                        type="button"
                                        onClick={() => handleOpenCreateWithStatus(status as 'New' | 'In Progress' | 'Urgent' | 'Done')}
                                        className={cn("w-full px-5 py-3.5 flex items-center border-b border-[#cdd5df] shrink-0 bg-[#ebeff4] hover:bg-[#e2e8f0] transition-colors cursor-pointer text-left")}
                                        aria-label={`Create note in ${formatStatusLabel(status)}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {StatusIcon ? (
                                                <StatusIcon className={cn("w-4 h-4 shrink-0", style.icon)} />
                                            ) : (
                                                <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.1)]", style.dot)} />
                                            )}
                                            <h2 className={cn("text-xs font-bold", style.text)}>{formatStatusLabel(status)}</h2>
                                        </div>
                                    </button>

                                    {/* Cards */}
                                    <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                                        {columnNotes.map(note => {
                                            const reminderData = Array.isArray(note.reminders) ? note.reminders[0] : note.reminders;
                                            const deadline = reminderData ? getDaysRemainingText(reminderData.due_date, note.status, note.updated_at) : null;
                                            // Find category color for this note
                                            const noteCatIdx = orderedCategories.findIndex(c => c.note_category_id === note.note_category_id);
                                            const noteColor = noteCatIdx >= 0 ? getCategoryColor(noteCatIdx) : null;
                                            return (
                                                <React.Fragment key={note.note_id}>
                                                    {/* Drop indicator */}
                                                    {dragOverNoteId === note.note_id && draggedNote?.note_id !== note.note_id && (
                                                        <div className="h-1 rounded-full bg-primary/50 -mt-1 mb-1 mx-2 animate-pulse" />
                                                    )}
                                                    <div
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, note)}
                                                        onDragEnd={handleDragEnd}
                                                        onDragOver={(e) => handleCardDragOver(e, note.note_id, status)}
                                                        onClick={() => handleOpenEdit(note)}
                                                        className={cn(
                                                            "group border rounded-xl p-4 cursor-grab active:cursor-grabbing shadow-[0_2px_8px_-3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.12)] transition-all duration-300",
                                                            draggedNote?.note_id === note.note_id && "opacity-40 scale-95"
                                                        )}
                                                        style={noteColor ? {
                                                            backgroundColor: noteColor.bg,
                                                            borderColor: noteColor.bg,
                                                        } : { backgroundColor: 'var(--card)', borderColor: 'var(--card)' }}
                                                    >
                                                        <div className="flex items-start gap-2.5">
                                                            <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 mt-0.5 shrink-0 group-hover:text-muted-foreground transition-colors" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                                        <span className="shrink-0 flex items-center"><NoteCategoryIcon categoryName={note.note_categories?.name || ''} size={14} /></span>
                                                                        <h3 title={note.title} className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{note.title}</h3>
                                                                    </div>
                                                                    <div className="relative">
                                                                        <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === note.note_id ? null : note.note_id); }} className="p-1 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all shrink-0 cursor-pointer" aria-label="More options">
                                                                            <MoreVertical className="w-4 h-4" />
                                                                        </button>
                                                                        {openDropdownId === note.note_id && (
                                                                            <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border/50 rounded-xl shadow-lg z-50 py-1 overflow-hidden" onClick={e => e.stopPropagation()}>
                                                                                <button onClick={() => { setOpenDropdownId(null); handleClone(note); }} className="w-full text-left px-3 py-2 text-xs font-bold text-foreground hover:bg-muted/50 flex items-center gap-2 cursor-pointer">
                                                                                    <Copy className="w-3.5 h-3.5" /> Clone
                                                                                </button>
                                                                                <button onClick={(e) => { setOpenDropdownId(null); handleDelete(note.note_id, e); }} className="w-full text-left px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer">
                                                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {note.content && (
                                                                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                                                                        {note.content.replace(/<[^>]*>/g, '').trim().substring(0, 80)}
                                                                    </p>
                                                                )}
                                                                {deadline && (
                                                                    <div className="mt-2.5 flex items-center justify-between">
                                                                        <span className="text-[10px] text-muted-foreground">
                                                                            {'\u{1F4C5}'} {new Date(reminderData!.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                        </span>
                                                                        <span className={cn(
                                                                            "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                                                            deadline.isOverdue ? "bg-rose-500/10 text-rose-700" :
                                                                                (deadline as any).isDueToday ? "bg-orange-500/15 text-orange-700" :
                                                                                    "bg-primary/10 text-[#1F4E50]"
                                                                        )}>
                                                                            {deadline.text}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
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

            <NoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} note={selectedNote} onSave={handleSave} isClone={isCloneMode} defaultStatus={defaultStatus} />

            <Modal
                isOpen={showCategoryFilter}
                onClose={() => setShowCategoryFilter(false)}
                title="Show / Hide & Reorder"
                size="md"
                closeOnBackdropClick
                closeOnEscape
            >
                <div className="space-y-2">
                    <div className="flex items-center justify-end gap-2 mb-3">
                        <button
                            type="button"
                            onClick={() => {
                                hasUserChangedSettings.current = true;
                                setVisibleCategories(categoryOrder);
                            }}
                            className="text-[10px] font-bold text-primary hover:underline"
                        >
                            Select All
                        </button>
                        <span className="text-border">|</span>
                        <button
                            type="button"
                            onClick={() => {
                                hasUserChangedSettings.current = true;
                                setVisibleCategories([]);
                            }}
                            className="text-[10px] font-bold text-rose-500 hover:underline"
                        >
                            Clear All
                        </button>
                    </div>
                    {categoryOrder.map((id, idx) => {
                        const cat = categories.find((c) => c.note_category_id === id);
                        if (!cat) return null;
                        const isVisible = visibleCategories.includes(id);
                        return (
                            <div key={id} className="flex items-center gap-3 py-1.5">
                                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isVisible}
                                        onChange={() => toggleCategoryVisibility(id)}
                                        className="w-4 h-4 rounded accent-primary"
                                    />
                                    <NoteCategoryIcon categoryName={cat.name} size={16} />
                                    <span
                                        className={cn(
                                            'text-sm font-medium',
                                            isVisible ? 'text-foreground' : 'text-muted-foreground line-through'
                                        )}
                                    >
                                        {cat.name}
                                    </span>
                                </label>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => moveCategoryUp(id)}
                                        disabled={idx === 0}
                                        aria-label={`Move ${cat.name} up`}
                                        className="p-1 text-muted-foreground hover:text-primary disabled:opacity-20"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveCategoryDown(id)}
                                        disabled={idx === categoryOrder.length - 1}
                                        aria-label={`Move ${cat.name} down`}
                                        className="p-1 text-muted-foreground hover:text-primary disabled:opacity-20"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Modal>

            {/* Trash Popup */}
            <Modal isOpen={showTrash} onClose={() => setShowTrash(false)} title="Trash">
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {trashedNotes.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="font-bold">Trash is empty</p>
                        </div>
                    ) : trashedNotes.map(note => (
                        <div key={note.note_id} className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-xl">
                            <span className="flex items-center shrink-0"><NoteCategoryIcon categoryName={note.note_categories?.name || ''} size={16} /></span>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-foreground line-clamp-1">{note.title}</h3>
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

