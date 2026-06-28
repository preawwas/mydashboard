'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Loader2, Clock, PanelRightOpen, PanelRightClose, Check
} from 'lucide-react';
import {
    Button, Card, CardHeader, CardTitle,
    CardContent, Badge
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { DbNote, DbNoteCategory, DbReminder } from '@/lib/supabase-types';
import NoteModal from '../notes/NoteModal';
import NoteCategoryIcon from '../notes/NoteCategoryIcon';
import { apiClient } from '@/lib/api-client';
import { useLoading } from '@/components/providers/LoadingProvider';
import CalendarFlipDate from './CalendarFlipDate';
import { getNoteStatusColor } from '@/lib/note-status-colors';

interface ExtendedNote extends DbNote {
    note_categories?: DbNoteCategory;
    reminders?: DbReminder;
}

type ViewMode = 'month' | 'week' | 'day';

const ITEMS_PER_PAGE = 5;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const STATUS_OPTIONS = ['All', 'New', 'In Progress', 'Urgent', 'Done'];

const getStatusColor = getNoteStatusColor;

// Same palette as Journey page
const CATEGORY_PALETTE = [
    { base: '#12275c', bg: '#e8ecf5', text: '#12275c' },
    { base: '#7a9bb5', bg: '#dce8f0', text: '#2d5a7a' },
    { base: '#5a8a6e', bg: '#daeee4', text: '#2e6147' },
    { base: '#6b7e4a', bg: '#e5ecda', text: '#4a5930' },
    { base: '#d47a00', bg: '#fff0d9', text: '#9a5500' },
    { base: '#b06060', bg: '#fce8e8', text: '#8a3c3c' },
    { base: '#7a4e78', bg: '#eedde9', text: '#5c2e5a' },
];
const getCategoryColor = (index: number) => CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];

const CalendarView: React.FC = () => {
    const { startLoading, stopLoading } = useLoading();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [notes, setNotes] = useState<ExtendedNote[]>([]);
    const [categories, setCategories] = useState<DbNoteCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<ExtendedNote | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [draggedNote, setDraggedNote] = useState<ExtendedNote | null>(null);
    const [dragOverDate, setDragOverDate] = useState<string | null>(null);
    const [deadlineCount, setDeadlineCount] = useState(ITEMS_PER_PAGE);
    const [defaultDueDate, setDefaultDueDate] = useState('');
    const [showDeadlines, setShowDeadlines] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [yearPickerStart, setYearPickerStart] = useState(() => new Date().getFullYear() - 5);
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [showOverdue, setShowOverdue] = useState(false);
    const [toolbarExpanded, setToolbarExpanded] = useState(true);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const categoryOptions = useMemo(() => {
        return [
            { value: 'All', label: 'All Categories' },
            ...categories.map((category) => ({
                value: category.note_category_id,
                label: category.name,
            })),
        ];
    }, [categories]);

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ filter: 'all' });
            if (categoryFilter !== 'All') {
                params.set('category_ids', categoryFilter);
            }

            const res = await apiClient.fetch(`/api/notes?${params.toString()}`);
            const json = await res.json();
            if (json.success) setNotes(json.data || []);
        } catch (error) { console.error('Error fetching notes:', error); }
        finally { setLoading(false); }
    }, [categoryFilter]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    useEffect(() => {
        // Fetch categories for color mapping
        apiClient.fetch('/api/note-categories')
            .then(r => r.json())
            .then(j => { if (j.success) setCategories(j.data || []); })
            .catch(() => {});
    }, []);

    // Sync loading state with global LoadingOverlay
    useEffect(() => {
        if (loading && notes.length === 0) {
            startLoading();
        } else {
            stopLoading();
        }
    }, [loading, notes.length, startLoading, stopLoading]);

    // Close date pickers on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
                setShowMonthPicker(false);
                setShowYearPicker(false);
            }
        };
        if (showMonthPicker || showYearPicker) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showMonthPicker, showYearPicker]);

    // Helpers
    const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
    const formatDateStr = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const notesByDate = useMemo(() => {
        const map = new Map<string, ExtendedNote[]>();
        notes.forEach(n => {
            if (statusFilter !== 'All' && n.status !== statusFilter) return;
            if (categoryFilter !== 'All' && n.note_category_id !== categoryFilter) return;
            if (n.reminders?.due_date) {
                const dateStr = n.reminders.due_date.substring(0, 10);
                if (!map.has(dateStr)) map.set(dateStr, []);
                map.get(dateStr)!.push(n);
            }
        });
        return map;
    }, [notes, statusFilter, categoryFilter]);

    const getNotesForDate = useCallback((dateStr: string) => {
        return notesByDate.get(dateStr) || [];
    }, [notesByDate]);

    const today = new Date();
    const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

    // Navigation
    const navigate = (dir: number) => {
        const d = new Date(currentDate);
        if (viewMode === 'month') d.setMonth(d.getMonth() + dir);
        else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
        else d.setDate(d.getDate() + dir);
        setCurrentDate(d);
    };
    const prevMonth = () => navigate(-1);
    const nextMonth = () => navigate(1);
    const goToToday = () => {
        setCurrentDate(new Date());
        setShowMonthPicker(false);
        setShowYearPicker(false);
    };
    const goToMonth = (month: number) => {
        const d = new Date(currentDate); d.setMonth(month);
        setCurrentDate(d); setShowMonthPicker(false);
    };
    const goToYear = (year: number) => {
        const d = new Date(currentDate); d.setFullYear(year);
        setCurrentDate(d); setShowYearPicker(false);
    };
    const changeYear = (dir: number) => {
        const d = new Date(currentDate); d.setFullYear(d.getFullYear() + dir);
        setCurrentDate(d);
    };
    const yearPickerOptions = useMemo(
        () => Array.from({ length: 12 }, (_, i) => yearPickerStart + i),
        [yearPickerStart]
    );

    // Drag and Drop
    const handleDragStart = (e: React.DragEvent, note: ExtendedNote) => {
        setDraggedNote(note);
        e.dataTransfer.effectAllowed = 'move';
        if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.4';
    };
    const handleDragEnd = (e: React.DragEvent) => {
        if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1';
        setDraggedNote(null); setDragOverDate(null);
    };
    const handleDragOver = (e: React.DragEvent, dateStr: string) => {
        e.preventDefault(); e.stopPropagation(); setDragOverDate(dateStr);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        // Only clear if leaving the cell, not entering a child
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (e.currentTarget instanceof HTMLElement && !e.currentTarget.contains(relatedTarget)) {
            setDragOverDate(null);
        }
    };
    const handleDrop = async (e: React.DragEvent, dateStr: string) => {
        e.preventDefault(); e.stopPropagation(); setDragOverDate(null);
        if (!draggedNote) return;
        const oldDate = draggedNote.reminders?.due_date?.split('T')[0];
        if (oldDate === dateStr) return;
        setNotes(prev => prev.map(n => {
            if (n.note_id === draggedNote.note_id && n.reminders) {
                return { ...n, reminders: { ...n.reminders, due_date: dateStr + 'T00:00:00' } };
            }
            return n;
        }));
        try {
            await apiClient.fetch(`/api/notes/${draggedNote.note_id}`, {
                method: 'PATCH', body: JSON.stringify({ due_date: dateStr })
            });
        } catch { fetchNotes(); }
        setDraggedNote(null);
    };


    // Mark note as done
    const handleMarkDone = async (note: ExtendedNote, e: React.MouseEvent) => {
        e.stopPropagation();
        const newStatus = note.status === 'Done' ? 'New' : 'Done';
        setNotes(prev => prev.map(n => n.note_id === note.note_id ? { ...n, status: newStatus as ExtendedNote['status'] } : n));
        try {
            await apiClient.fetch(`/api/notes/${note.note_id}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
        } catch { fetchNotes(); }
    };

    const handleEditNote = (note: ExtendedNote) => { setSelectedNote(note); setDefaultDueDate(''); setIsModalOpen(true); };
    const handleCreateOnDate = (dateStr: string) => { setSelectedNote(null); setDefaultDueDate(dateStr); setIsModalOpen(true); };

    const getWeekStart = (date: Date) => {
        const d = new Date(date); d.setDate(d.getDate() - d.getDay()); return d;
    };

    // Note chip — colored by status (matching Journey status dots)
    const renderCategoryIcon = (note: ExtendedNote, size = 14) => (
        <NoteCategoryIcon categoryName={note.note_categories?.name || ''} size={size} />
    );

    const renderNoteChip = (note: ExtendedNote, iconOnly = false) => {
        const statusColor = getStatusColor(note.status || 'New');
        const isDone = note.status === 'Done';
        if (iconOnly) {
            return (
                <div
                    key={note.note_id}
                    className="text-lg shrink-0"
                    title={note.title}
                >
                    {renderCategoryIcon(note, 16)}
                </div>
            );
        }
        return (
            <div
                key={note.note_id}
                draggable
                onDragStart={(e) => handleDragStart(e, note)}
                onDragEnd={handleDragEnd}
                onClick={(e) => { e.stopPropagation(); handleEditNote(note); }}
                className={cn(
                    'flex items-center gap-0.5 px-1 py-0.5 sm:gap-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs truncate cursor-grab active:cursor-grabbing transition-all hover:scale-[1.03] shadow-[0_2px_8px_-3px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)]',
                    isDone ? 'font-semibold' : 'font-extrabold'
                )}
                style={{
                    backgroundColor: statusColor.bg,
                    borderColor: statusColor.bg,
                    color: statusColor.text,
                }}
                title={note.title}
            >
                {/* Radio checkbox */}
                <button
                    onClick={(e) => handleMarkDone(note, e)}
                    aria-label={`Mark "${note.title}" as ${isDone ? 'incomplete' : 'done'}`}
                    className="hidden lg:flex w-2 h-2 sm:w-4 sm:h-4 rounded-full border-2 items-center justify-center shrink-0 transition-all"
                    style={
                        isDone
                            ? { backgroundColor: statusColor.check, borderColor: statusColor.check }
                            : { borderColor: statusColor.check, backgroundColor: 'transparent' }
                    }
                >
                    {isDone && <Check className="w-1 h-1 sm:w-2.5 sm:h-2.5 text-white" />}
                </button>
                <span className="shrink-0 flex items-center scale-90 sm:scale-100">{renderCategoryIcon(note, 11)}</span>
                <span className="truncate">{note.title}</span>
            </div>
        );
    };

    // Day cell
    const renderDayCell = (dateStr: string, day: number, isCurrentMonth: boolean, hClass = 'h-[92px] sm:h-[120px] md:h-[140px]', iconOnly = false) => {
        const dayNotes = getNotesForDate(dateStr);
        const isToday = dateStr === todayStr;
        const isDragOver = dragOverDate === dateStr;
        return (
            <div
                key={dateStr}
                className={cn(
                    hClass, 'flex flex-col border border-border/60 p-1 sm:p-2.5 transition-all group relative',
                    isCurrentMonth ? 'bg-white' : 'bg-muted/30 opacity-40',
                    isToday && 'bg-primary/10 border-primary/40',
                    isDragOver && 'bg-primary/15 border-primary/40 ring-2 ring-primary/30'
                )}
                onDragOver={(e) => handleDragOver(e, dateStr)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, dateStr)}
                onClick={() => handleCreateOnDate(dateStr)}
                style={{ cursor: 'pointer' }}
            >
                <div className="flex justify-between items-start mb-1 sm:mb-2 shrink-0">
                    <span className={cn(
                        'text-[11px] sm:text-sm font-black w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-colors',
                        isToday ? 'bg-primary text-primary-foreground shadow-md' : 'text-foreground/70 group-hover:text-foreground'
                    )}>
                        {day}
                    </span>
                    {dayNotes.length > 0 && (
                        <span
                            className={cn(
                                'text-[9px] sm:text-[10px] font-black text-white px-1 sm:px-1.5 py-0.5 rounded-full min-w-[16px] sm:min-w-[20px] text-center shadow-sm leading-none',
                                isToday ? 'bg-[#2D5A52]' : 'bg-[#B0B8BF]'
                            )}
                        >
                            {dayNotes.length}
                        </span>
                    )}
                </div>
                <div className="flex-1 space-y-1 sm:space-y-1.5 pb-0.5 sm:pb-1 overflow-y-auto custom-scrollbar pr-0.5 sm:pr-1">
                    {dayNotes.map((note) => renderNoteChip(note, iconOnly))}
                </div>
            </div>
        );
    };

    // MONTH VIEW
    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const cells = [];

        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const prevMonthDays = daysInMonth(prevYear, prevMonth);
        for (let i = 0; i < startDay; i++) {
            const d = prevMonthDays - startDay + 1 + i;
            cells.push(renderDayCell(formatDateStr(prevYear, prevMonth, d), d, false, 'h-[92px] sm:h-[120px] md:h-[140px]', false));
        }
        for (let day = 1; day <= totalDays; day++) {
            cells.push(renderDayCell(formatDateStr(year, month, day), day, true, 'h-[92px] sm:h-[120px] md:h-[140px]', false));
        }
        const remaining = 7 - (cells.length % 7);
        if (remaining < 7) {
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextYear = month === 11 ? year + 1 : year;
            for (let i = 1; i <= remaining; i++) {
                cells.push(renderDayCell(formatDateStr(nextYear, nextMonth, i), i, false, 'h-[92px] sm:h-[120px] md:h-[140px]', false));
            }
        }

        const rows = [];
        for (let i = 0; i < cells.length; i += 7) {
            rows.push(<div key={i} className="grid grid-cols-7">{cells.slice(i, i + 7)}</div>);
        }

        return (
            <div className="border border-border/60 sm:border-2 rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-lg sm:shadow-xl">
                <div className="grid grid-cols-7 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 border-b border-border/50 sm:border-b-2">
                    {WEEKDAYS.map((day) => (
                        <div key={day} className="text-center py-2 sm:py-3.5 text-[10px] sm:text-sm font-black text-foreground/80 uppercase tracking-wide sm:tracking-widest">
                            <span className="sm:hidden">{day.charAt(0)}</span>
                            <span className="hidden sm:inline">{day}</span>
                        </div>
                    ))}
                </div>
                {rows}
            </div>
        );
    };

    // WEEK VIEW
    const renderWeekView = () => {
        const start = getWeekStart(currentDate);

        const cells = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start); d.setDate(d.getDate() + i);
            const dateStr = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate());
            const dayNotes = getNotesForDate(dateStr);
            const isToday = dateStr === todayStr;
            const isDragOver = dragOverDate === dateStr;
            cells.push(
                <div
                    key={dateStr}
                    className={cn(
                        'h-[280px] sm:h-[400px] flex flex-col border border-border/60 p-2 sm:p-4 transition-all bg-white',
                        isToday && 'bg-primary/10 border-primary/40',
                        isDragOver && 'bg-primary/15 ring-2 ring-primary/30'
                    )}
                    onDragOver={(e) => handleDragOver(e, dateStr)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, dateStr)}
                    onClick={() => handleCreateOnDate(dateStr)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="text-center mb-2 sm:mb-3 shrink-0">
                        <div className={cn('text-lg sm:text-2xl font-black mx-auto w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full mt-0.5 sm:mt-1', isToday ? 'bg-primary text-primary-foreground' : 'text-foreground')}>{d.getDate()}</div>
                    </div>
                    <div className="flex-1 space-y-1.5 sm:space-y-2 pb-1 sm:pb-2 overflow-y-auto custom-scrollbar pr-0.5 sm:pr-1">
                        {dayNotes.map((note) => renderNoteChip(note, false))}
                        {dayNotes.length === 0 && <p className="text-[11px] sm:text-xs text-muted-foreground/40 text-center pt-2 sm:pt-4">No tasks</p>}
                    </div>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0 sm:overflow-visible">
                <div className="min-w-[560px] sm:min-w-0 border border-border/60 sm:border-2 rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-lg sm:shadow-xl">
                    <div className="grid grid-cols-7 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 border-b border-border/50 sm:border-b-2">
                        {WEEKDAYS.map((day) => (
                            <div key={day} className="text-center py-2 sm:py-3.5 text-[10px] sm:text-sm font-black text-foreground/80 uppercase tracking-wide sm:tracking-widest">
                                <span className="sm:hidden">{day.charAt(0)}</span>
                                <span className="hidden sm:inline">{day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">{cells}</div>
                </div>
            </div>
        );
    };

    // DAY VIEW
    const renderDayView = () => {
        const dateStr = formatDateStr(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const dayNotes = getNotesForDate(dateStr);
        const isToday = dateStr === todayStr;
        const isDragOver = dragOverDate === dateStr;
        return (
            <div
                className={cn('border border-border/40 rounded-xl sm:rounded-2xl bg-card/30 shadow-lg p-4 sm:p-6 min-h-[360px] sm:min-h-[500px] transition-all cursor-pointer', isDragOver && 'bg-primary/15 ring-2 ring-primary/30')}
                onDragOver={(e) => handleDragOver(e, dateStr)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, dateStr)}
                onClick={() => handleCreateOnDate(dateStr)}
            >
                <div className="text-center mb-4 sm:mb-6">
                    <div className="text-xs sm:text-sm font-bold text-muted-foreground uppercase mb-1">{currentDate.toLocaleDateString('default', { weekday: 'long' })}</div>
                    <div className={cn('text-4xl sm:text-5xl font-black mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full', isToday ? 'bg-primary text-primary-foreground' : 'text-foreground bg-muted/20')}>{currentDate.getDate()}</div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                    {dayNotes.length > 0 ? dayNotes.map((note: ExtendedNote) => {
                        const statusColor = getStatusColor(note.status || 'New');
                        return (
                        <div
                            key={note.note_id}
                            draggable onDragStart={(e) => handleDragStart(e, note)} onDragEnd={handleDragEnd}
                            onClick={(e) => { e.stopPropagation(); handleEditNote(note); }}
                            className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl cursor-pointer shadow-[0_2px_8px_-3px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] transition-all border"
                            style={{ backgroundColor: statusColor.bg, borderColor: statusColor.bg, color: statusColor.text }}
                        >
                            <button 
                                onClick={(e) => handleMarkDone(note, e)} 
                                aria-label={`Mark "${note.title}" as ${note.status === 'Done' ? 'incomplete' : 'done'}`}
                                className="hidden lg:flex w-6 h-6 rounded-full border-2 items-center justify-center shrink-0 transition-all"
                                style={
                                    note.status === 'Done'
                                        ? { backgroundColor: statusColor.check, borderColor: statusColor.check }
                                        : { borderColor: statusColor.check, backgroundColor: 'transparent' }
                                }
                            >
                                {note.status === 'Done' && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${statusColor.base}20` }}>
                                {renderCategoryIcon(note, 16)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 title={note.title} className={cn('text-xs sm:text-sm truncate', note.status === 'Done' ? 'font-semibold' : 'font-bold')} style={{ color: statusColor.text }}>{note.title}</h3>
                                <p className="text-[11px] sm:text-xs line-clamp-1 mt-0.5 opacity-70" style={{ color: statusColor.text }}>{note.content?.replace(/<[^>]*>/g, '').trim().substring(0, 60) || 'No content'}</p>
                            </div>
                            <Badge className="text-[9px] sm:text-[10px] font-bold uppercase shrink-0" style={{ backgroundColor: `${statusColor.base}20`, color: statusColor.text }}>{note.status}</Badge>
                        </div>
                        );
                    }) : (
                        <div className="py-12 text-center text-muted-foreground/50"><p className="text-sm sm:text-lg font-bold">No tasks for this day</p></div>
                    )}
                </div>
            </div>
        );
    };

    // Upcoming vs Overdue deadlines
    const upcomingDeadlines = useMemo(() => {
        const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
        return notes
            .filter(n => {
                if (!n.reminders) return false;
                const due = new Date(n.reminders.due_date); due.setHours(0, 0, 0, 0);

                if (showOverdue) {
                    // Overdue: past dates, not Done
                    if (due >= todayDate) return false;
                    if (n.status === 'Done') return false;
                } else {
                    // Upcoming: today or future
                    if (due < todayDate) return false;
                }

                if (statusFilter !== 'All' && n.status !== statusFilter) return false;
                if (categoryFilter !== 'All' && n.note_category_id !== categoryFilter) return false;
                return true;
            })
            .sort((a, b) => {
                if (showOverdue) {
                    // Sort overdue: oldest first (most overdue)
                    return new Date(a.reminders!.due_date).getTime() - new Date(b.reminders!.due_date).getTime();
                } else {
                    // Sort upcoming: soonest first
                    return new Date(a.reminders!.due_date).getTime() - new Date(b.reminders!.due_date).getTime();
                }
            });
    }, [notes, statusFilter, categoryFilter, showOverdue]);

    const visibleDeadlines = upcomingDeadlines.slice(0, deadlineCount);
    const hasMoreDeadlines = deadlineCount < upcomingDeadlines.length;
    const handleLoadMore = () => setDeadlineCount(prev => prev + ITEMS_PER_PAGE);

    const getStatusBadgeClass = (status: string) => {
        const c = getStatusColor(status);
        return { backgroundColor: c.bg, color: c.text };
    };

    const toggleToolbar = () => {
        if (toolbarExpanded) {
            setShowMonthPicker(false);
            setShowYearPicker(false);
        }
        setToolbarExpanded((expanded) => !expanded);
    };

    const collapsedToolbarLabel = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return (
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1 min-w-0">
                <div
                    className={cn(
                        'relative mb-4 sm:mb-8 rounded-2xl border backdrop-blur-sm shadow-sm overflow-hidden',
                        toolbarExpanded
                            ? 'border-border/40 bg-[#ECEEF1]/70 sm:bg-card/40'
                            : 'border-border/50 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15'
                    )}
                >
                    <button
                        type="button"
                        onClick={toggleToolbar}
                        aria-label={toolbarExpanded ? 'Collapse calendar toolbar' : 'Expand calendar toolbar'}
                        aria-expanded={toolbarExpanded}
                        className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1A2332] shadow-sm transition-colors hover:bg-white/90"
                    >
                        {toolbarExpanded ? (
                            <ChevronUp className="h-4 w-4 stroke-[2.5]" />
                        ) : (
                            <ChevronDown className="h-4 w-4 stroke-[2.5]" />
                        )}
                    </button>

                    {toolbarExpanded ? (
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-6 p-3 sm:p-4 pr-11">
                {/* 1. Navigation Cluster */}
                <div className="flex items-center justify-between sm:justify-start gap-2">
                    <div className="relative rounded-[1.15rem] sm:rounded-[1.35rem] bg-[#ECEEF1] px-2 py-1.5 sm:px-2.5 sm:py-2 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.18)]" ref={datePickerRef}>
                        <CalendarFlipDate
                            date={currentDate}
                            onMonthPrev={prevMonth}
                            onMonthNext={nextMonth}
                            onYearPrev={() => changeYear(-1)}
                            onYearNext={() => changeYear(1)}
                            onMonthClick={() => {
                                setShowYearPicker(false);
                                setShowMonthPicker((open) => !open);
                            }}
                            onYearClick={() => {
                                setShowMonthPicker(false);
                                setYearPickerStart(currentDate.getFullYear() - 5);
                                setShowYearPicker((open) => !open);
                            }}
                            isMonthPickerOpen={showMonthPicker}
                            isYearPickerOpen={showYearPicker}
                        />

                        {showMonthPicker && (
                            <div className="absolute top-full left-0 mt-1.5 sm:mt-2 bg-card border border-border/50 rounded-xl sm:rounded-2xl shadow-2xl z-50 p-3 sm:p-4 w-[min(100vw-2rem,200px)] sm:w-[220px] animate-in fade-in zoom-in-95 duration-200">
                                <p className="mb-1.5 sm:mb-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Month</p>
                                <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                                    {MONTHS.map((m, i) => (
                                        <button
                                            key={m}
                                            onClick={() => goToMonth(i)}
                                            className={cn(
                                                'py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all',
                                                i === currentDate.getMonth()
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                                            )}
                                        >
                                            {m.substring(0, 3)}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={goToToday}
                                    className="w-full mt-2 sm:mt-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-primary/10 text-primary text-[11px] sm:text-xs font-bold hover:bg-primary/20 transition-all"
                                >
                                    Today
                                </button>
                            </div>
                        )}

                        {showYearPicker && (
                            <div className="absolute top-full right-0 mt-1.5 sm:mt-2 bg-card border border-border/50 rounded-xl sm:rounded-2xl shadow-2xl z-50 p-3 sm:p-4 w-[min(100vw-2rem,200px)] sm:w-[220px] animate-in fade-in zoom-in-95 duration-200">
                                <p className="mb-1.5 sm:mb-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Year</p>
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setYearPickerStart((start) => start - 12)}
                                        className="p-1 rounded-lg hover:bg-muted/30"
                                        aria-label="Previous years"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-[11px] sm:text-xs font-bold text-muted-foreground">Select year</span>
                                    <button
                                        type="button"
                                        onClick={() => setYearPickerStart((start) => start + 12)}
                                        className="p-1 rounded-lg hover:bg-muted/30"
                                        aria-label="Next years"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                                    {yearPickerOptions.map((year) => (
                                        <button
                                            key={year}
                                            type="button"
                                            onClick={() => goToYear(year)}
                                            className={cn(
                                                'py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all',
                                                year === currentDate.getFullYear()
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                                            )}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={goToToday}
                                    className="w-full mt-2 sm:mt-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-primary/10 text-primary text-[11px] sm:text-xs font-bold hover:bg-primary/20 transition-all"
                                >
                                    Today
                                </button>
                            </div>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToToday}
                        className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-full text-[11px] sm:text-xs font-bold hover:bg-primary/5 active:scale-95 transition-all text-muted-foreground hover:text-primary"
                    >
                        Today
                    </Button>
                </div>

                {/* 2. Filters & View Controls Group */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4">
                    {/* Filters Cluster */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="relative flex-1 sm:flex-initial">
                            <select 
                                className="w-full sm:w-[130px] h-8 sm:h-9 px-2 sm:px-3 pr-7 sm:pr-8 rounded-full bg-background border border-border/50 text-[11px] sm:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer hover:border-primary/30 shadow-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                <ChevronRight className="w-3 h-3 rotate-90" />
                            </div>
                        </div>

                        <div className="relative flex-1 sm:flex-initial">
                            <select 
                                className="w-full sm:w-[140px] h-8 sm:h-9 px-2 sm:px-3 pr-7 sm:pr-8 rounded-full bg-background border border-border/50 text-[11px] sm:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer hover:border-primary/30 shadow-sm"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                {categoryOptions.map((category) => (
                                    <option key={category.value} value={category.value}>{category.value === 'All' ? 'All Categories' : category.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                <ChevronRight className="w-3 h-3 rotate-90" />
                            </div>
                        </div>
                    </div>

                    {/* View Switcher Cluster */}
                    <div className="flex items-center justify-between sm:justify-start gap-1 p-0.5 sm:p-1 bg-muted/30 border border-border/50 rounded-full shadow-inner">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                            {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={cn(
                                        'px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wide sm:tracking-wider transition-all',
                                        viewMode === mode 
                                            ? "bg-primary text-primary-foreground shadow-sm scale-105" 
                                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                    )}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <div className="w-[1px] h-4 bg-border/60 mx-1 hidden sm:block" />

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeadlines(!showDeadlines)}
                            className={cn(
                                'h-6 sm:h-7 px-1.5 sm:px-2 rounded-full border-none transition-all',
                                showDeadlines ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:text-accent hover:bg-accent/5'
                            )}
                        >
                            {showDeadlines ? <PanelRightClose className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <PanelRightOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                        </Button>
                    </div>
                </div>
                </div>
                    ) : (
                        <div className="flex items-center justify-center px-3 py-3 pr-11 min-h-[44px]">
                            <span className="text-[11px] sm:text-sm font-black text-foreground/80 tracking-wide truncate">
                                {collapsedToolbarLabel}
                            </span>
                        </div>
                    )}
                </div>

                {/* Calendar Content */}
                {loading ? (
                    <div className="border border-border/40 rounded-2xl overflow-hidden bg-card/30 backdrop-blur-sm shadow-lg">
                        {/* Day header skeleton */}
                        <div className="grid grid-cols-7 bg-muted/30 border-b border-border/40">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center py-3">
                                    <div className="h-3 w-8 mx-auto rounded-md bg-muted/40 animate-pulse" />
                                </div>
                            ))}
                        </div>
                        {/* Calendar cells skeleton */}
                        {[0, 1, 2, 3, 4].map(row => (
                            <div key={row} className="grid grid-cols-7">
                                {[0, 1, 2, 3, 4, 5, 6].map(col => (
                                    <div key={col} className="min-h-[130px] border border-border/20 p-2.5 bg-card/40">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="w-8 h-8 rounded-full bg-muted/30 animate-pulse" style={{ animationDelay: `${row * 80 + col * 60}ms` }} />
                                        </div>
                                        {/* Random card placeholders */}
                                        {(row + col) % 3 === 0 && (
                                            <div className="space-y-1.5">
                                                <div className="h-7 w-full rounded-lg bg-muted/20 animate-pulse" style={{ animationDelay: `${row * 100 + col * 80}ms` }} />
                                                {col % 2 === 0 && <div className="h-7 w-4/5 rounded-lg bg-muted/15 animate-pulse" style={{ animationDelay: `${row * 120 + col * 90}ms` }} />}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {viewMode === 'month' && renderMonthView()}
                        {viewMode === 'week' && renderWeekView()}
                        {viewMode === 'day' && renderDayView()}
                    </>
                )}
            </div>

            {/* Sidebar — Upcoming Deadlines (collapsible) */}
            {showDeadlines && (
                <div className="w-full lg:w-80 shrink-0 animate-in slide-in-from-right duration-300">
                    <Card className="border-border/50 bg-card/80 backdrop-blur-md overflow-hidden shadow-xl sticky top-20">
                        <CardHeader className="border-b border-border/50 bg-muted/30 py-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xs sm:text-sm font-black uppercase tracking-wider text-foreground">
                                    {showOverdue ? 'Overdue Deadlines' : 'Upcoming Deadlines'}
                                </CardTitle>
                                <span className={cn('text-[11px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 rounded-full border',
                                    showOverdue ? "text-rose-500 bg-rose-500/15 border-rose-500/30" : "text-primary bg-primary/15 border-primary/30"
                                )}>
                                    {upcomingDeadlines.length}
                                </span>
                            </div>
                            <div className="flex bg-muted/40 p-1 rounded-xl mt-3 border border-border/40">
                                <button
                                    onClick={() => { setShowOverdue(false); setDeadlineCount(ITEMS_PER_PAGE); }}
                                    className={cn('flex-1 text-[11px] font-black py-1 sm:py-1.5 rounded-lg transition-all uppercase tracking-wide sm:tracking-wider', !showOverdue ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground')}
                                >
                                    Upcoming
                                </button>
                                <button
                                    onClick={() => { setShowOverdue(true); setDeadlineCount(ITEMS_PER_PAGE); }}
                                    className={cn('flex-1 text-[11px] font-black py-1 sm:py-1.5 rounded-lg transition-all uppercase tracking-wide sm:tracking-wider', showOverdue ? 'bg-rose-500 text-white shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground')}
                                >
                                    Overdue
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4">
                            <div className="space-y-2 sm:space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                                {visibleDeadlines.length > 0 ? visibleDeadlines.map(note => {
                                    const statusColor = getStatusColor(note.status || 'New');
                                    return (
                                    <div
                                        key={note.note_id}
                                        onClick={() => handleEditNote(note)}
                                        className="group p-2.5 sm:p-3 rounded-xl cursor-pointer shadow-[0_2px_8px_-3px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] transition-all border"
                                        style={{ backgroundColor: statusColor.bg, borderColor: statusColor.bg }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex h-2.5 w-2.5 items-center justify-center">
                                                    <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.1)]", statusColor.dot)} />
                                                </div>
                                                <Badge className="text-[9px] sm:text-[10px] font-black uppercase py-0.5" style={{ backgroundColor: `${statusColor.base}25`, color: statusColor.text }}>
                                                    {note.status}
                                                </Badge>
                                            </div>
                                            <span className="text-[11px] sm:text-[10px] font-bold" style={{ color: statusColor.text, opacity: 0.7 }}>
                                                {new Date(note.reminders!.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 title={note.title} className={cn('text-xs sm:text-sm truncate', note.status === 'Done' ? 'font-semibold' : 'font-bold')} style={{ color: statusColor.text }}>{note.title}</h3>
                                        <div className="flex items-center gap-1.5 mt-1.5 sm:mt-2">
                                            <span className="shrink-0 flex items-center scale-90 sm:scale-100">{renderCategoryIcon(note, 12)}</span>
                                            <span className="text-[11px] sm:text-[10px] font-bold" style={{ color: statusColor.text, opacity: 0.7 }}>{note.note_categories?.name || 'Uncategorized'}</span>
                                        </div>
                                    </div>
                                    );
                                }) : (
                                    <div className="py-12 text-center space-y-3 opacity-50">
                                        <Clock className="w-8 h-8 mx-auto" />
                                        <p className="text-[11px] sm:text-xs font-bold uppercase">No {showOverdue ? 'Overdue' : 'Upcoming'} Deadlines</p>
                                    </div>
                                )}

                                {hasMoreDeadlines && (
                                    <Button variant="outline" onClick={handleLoadMore}
                                        className="w-full rounded-xl border-primary/20 text-primary font-bold text-[11px] sm:text-xs hover:bg-primary/5 mt-2">
                                        Load More ({upcomingDeadlines.length - deadlineCount} remaining)
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <NoteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                note={selectedNote}
                onSave={fetchNotes}
                defaultDueDate={defaultDueDate}
            />
        </div>
    );
};

export default CalendarView;
