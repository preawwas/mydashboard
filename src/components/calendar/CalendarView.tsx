'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    ChevronLeft, ChevronRight, Loader2, Clock, PanelRightOpen, PanelRightClose, Check
} from 'lucide-react';
import {
    Button, Card, CardHeader, CardTitle,
    CardContent, Badge
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { DbNote, DbNoteCategory, DbReminder } from '@/lib/supabase-types';
import NoteModal from '../notes/NoteModal';
import { apiClient } from '@/lib/api-client';
import { useLoading } from '@/components/providers/LoadingProvider';

interface ExtendedNote extends DbNote {
    note_categories?: DbNoteCategory;
    reminders?: DbReminder;
}

type ViewMode = 'month' | 'week' | 'day';

const ITEMS_PER_PAGE = 5;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const STATUS_OPTIONS = ['All', 'New', 'In Progress', 'Urgent', 'Done'];

const CalendarView: React.FC = () => {
    const { startLoading, stopLoading } = useLoading();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [notes, setNotes] = useState<ExtendedNote[]>([]);
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
    const [statusFilter, setStatusFilter] = useState('All');
    const [showOverdue, setShowOverdue] = useState(false);
    const monthPickerRef = useRef<HTMLDivElement>(null);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const res = await apiClient.fetch('/api/notes?filter=all');
            const json = await res.json();
            if (json.success) setNotes(json.data || []);
        } catch (error) { console.error('Error fetching notes:', error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNotes(); }, []);

    // Sync loading state with global LoadingOverlay
    useEffect(() => {
        if (loading && notes.length === 0) {
            startLoading();
        } else {
            stopLoading();
        }
    }, [loading, notes.length, startLoading, stopLoading]);

    // Close month picker on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (monthPickerRef.current && !monthPickerRef.current.contains(e.target as Node)) {
                setShowMonthPicker(false);
            }
        };
        if (showMonthPicker) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showMonthPicker]);

    // Helpers
    const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
    const formatDateStr = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const getNotesForDate = (dateStr: string) => {
        return notes.filter(n => {
            if (!n.reminders?.due_date?.startsWith(dateStr)) return false;
            if (statusFilter !== 'All' && n.status !== statusFilter) return false;
            return true;
        });
    };

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
    const goToToday = () => { setCurrentDate(new Date()); setShowMonthPicker(false); };
    const goToMonth = (month: number) => {
        const d = new Date(currentDate); d.setMonth(month);
        setCurrentDate(d); setShowMonthPicker(false);
    };
    const changeYear = (dir: number) => {
        const d = new Date(currentDate); d.setFullYear(d.getFullYear() + dir);
        setCurrentDate(d);
    };

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

    // Note chip with radio
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'New': return '#eab308'; // yellow-500
            case 'In Progress': return '#f97316'; // orange-500
            case 'Urgent': return '#f43f5e'; // rose-500
            case 'Done': return '#0ea5e9'; // sky-500
            default: return '#eab308';
        }
    };

    const renderNoteChip = (note: ExtendedNote) => {
        const color = getStatusColor(note.status);
        const isDone = note.status === 'Done';
        return (
            <div
                key={note.note_id}
                draggable
                onDragStart={(e) => handleDragStart(e, note)}
                onDragEnd={handleDragEnd}
                onClick={(e) => { e.stopPropagation(); handleEditNote(note); }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-extrabold truncate cursor-grab active:cursor-grabbing transition-all hover:scale-[1.03] hover:shadow-xl shadow-md"
                style={{
                    backgroundColor: `${color}25`,
                    borderLeft: `4px solid ${color}`,
                    boxShadow: `0 2px 6px ${color}20`,
                    color: color,
                }}
            >
                {/* Radio checkbox */}
                <button
                    onClick={(e) => handleMarkDone(note, e)}
                    className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                        isDone ? "bg-green-500 border-green-500" : "border-current hover:border-green-400"
                    )}
                >
                    {isDone && <Check className="w-2.5 h-2.5 text-white" />}
                </button>
                <span className="text-sm shrink-0">{note.note_categories?.icon || '•'}</span>
                <span className={cn("truncate", isDone && "opacity-60")}>{note.title}</span>
            </div>
        );
    };

    // Day cell
    const renderDayCell = (dateStr: string, day: number, isCurrentMonth: boolean, minH = 'min-h-[130px]') => {
        const dayNotes = getNotesForDate(dateStr);
        const isToday = dateStr === todayStr;
        const isDragOver = dragOverDate === dateStr;
        return (
            <div
                key={dateStr}
                className={cn(
                    minH, "border border-border/60 p-2.5 transition-all group relative",
                    isCurrentMonth ? "bg-white" : "bg-muted/30 opacity-40",
                    isToday && "bg-primary/10 border-primary/40",
                    isDragOver && "bg-primary/15 border-primary/40 ring-2 ring-primary/30"
                )}
                onDragOver={(e) => handleDragOver(e, dateStr)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, dateStr)}
                onClick={() => handleCreateOnDate(dateStr)}
                style={{ cursor: 'pointer' }}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                        "text-sm font-black w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                        isToday ? "bg-primary text-primary-foreground shadow-md" : "text-foreground/70 group-hover:text-foreground"
                    )}>
                        {day}
                    </span>
                    {dayNotes.length > 0 && (
                        <span className="text-[10px] font-black text-white bg-gray-500 px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                            {dayNotes.length}
                        </span>
                    )}
                </div>
                <div className="space-y-1.5 mt-1 pb-1">
                    {dayNotes.map(renderNoteChip)}
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
            cells.push(renderDayCell(formatDateStr(prevYear, prevMonth, d), d, false));
        }
        for (let day = 1; day <= totalDays; day++) {
            cells.push(renderDayCell(formatDateStr(year, month, day), day, true));
        }
        const remaining = 7 - (cells.length % 7);
        if (remaining < 7) {
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextYear = month === 11 ? year + 1 : year;
            for (let i = 1; i <= remaining; i++) {
                cells.push(renderDayCell(formatDateStr(nextYear, nextMonth, i), i, false));
            }
        }

        const rows = [];
        for (let i = 0; i < cells.length; i += 7) {
            rows.push(<div key={i} className="grid grid-cols-7">{cells.slice(i, i + 7)}</div>);
        }
        return (
            <div className="border-2 border-border/60 rounded-2xl overflow-hidden bg-white shadow-xl">
                <div className="grid grid-cols-7 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 border-b-2 border-border/50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center py-3.5 text-sm font-black text-foreground/80 uppercase tracking-widest">{day}</div>
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
                        "min-h-[300px] border border-border/60 p-4 transition-all bg-white",
                        isToday && "bg-primary/10 border-primary/40",
                        isDragOver && "bg-primary/15 ring-2 ring-primary/30"
                    )}
                    onDragOver={(e) => handleDragOver(e, dateStr)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, dateStr)}
                    onClick={() => handleCreateOnDate(dateStr)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="text-center mb-3">
                        <div className="text-xs font-bold text-muted-foreground uppercase">{d.toLocaleDateString('default', { weekday: 'short' })}</div>
                        <div className={cn("text-2xl font-black mx-auto w-10 h-10 flex items-center justify-center rounded-full mt-1", isToday ? "bg-primary text-primary-foreground" : "text-foreground")}>{d.getDate()}</div>
                    </div>
                    <div className="space-y-2 pb-2">
                        {dayNotes.map(renderNoteChip)}
                        {dayNotes.length === 0 && <p className="text-xs text-muted-foreground/40 text-center pt-4">No tasks</p>}
                    </div>
                </div>
            );
        }
        return (<div className="border-2 border-border/60 rounded-2xl overflow-hidden bg-white shadow-xl"><div className="grid grid-cols-7">{cells}</div></div>);
    };

    // DAY VIEW
    const renderDayView = () => {
        const dateStr = formatDateStr(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const dayNotes = getNotesForDate(dateStr);
        const isToday = dateStr === todayStr;
        const isDragOver = dragOverDate === dateStr;
        return (
            <div
                className={cn("border border-border/40 rounded-2xl bg-card/30 shadow-lg p-6 min-h-[500px] transition-all cursor-pointer", isDragOver && "bg-primary/15 ring-2 ring-primary/30")}
                onDragOver={(e) => handleDragOver(e, dateStr)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, dateStr)}
                onClick={() => handleCreateOnDate(dateStr)}
            >
                <div className="text-center mb-6">
                    <div className="text-sm font-bold text-muted-foreground uppercase mb-1">{currentDate.toLocaleDateString('default', { weekday: 'long' })}</div>
                    <div className={cn("text-5xl font-black mx-auto w-20 h-20 flex items-center justify-center rounded-full", isToday ? "bg-primary text-primary-foreground" : "text-foreground bg-muted/20")}>{currentDate.getDate()}</div>
                </div>
                <div className="space-y-3">
                    {dayNotes.length > 0 ? dayNotes.map(note => (
                        <div
                            key={note.note_id}
                            draggable onDragStart={(e) => handleDragStart(e, note)} onDragEnd={handleDragEnd}
                            onClick={(e) => { e.stopPropagation(); handleEditNote(note); }}
                            className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-xl cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
                        >
                            <button onClick={(e) => handleMarkDone(note, e)} className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0", note.status === 'Done' ? "bg-green-500 border-green-500" : "border-muted-foreground/40 hover:border-green-400")}>
                                {note.status === 'Done' && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: `${note.note_categories?.color_code || '#718096'}15` }}>
                                {note.note_categories?.icon || '📝'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className={cn("text-sm font-bold text-foreground line-clamp-1", note.status === 'Done' && "opacity-50")}>{note.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{note.content?.replace(/<[^>]*>/g, '').trim().substring(0, 60) || 'No content'}</p>
                            </div>
                            <Badge className={cn("text-[10px] font-bold uppercase shrink-0",
                                note.status === 'Urgent' ? "bg-rose-500/10 text-rose-500" :
                                    note.status === 'In Progress' ? "bg-orange-500/10 text-orange-500" :
                                        note.status === 'Done' ? "bg-sky-500/10 text-sky-500" :
                                            "bg-yellow-500/10 text-yellow-500"
                            )}>{note.status}</Badge>
                        </div>
                    )) : (
                        <div className="py-16 text-center text-muted-foreground/50"><p className="text-lg font-bold">No tasks for this day</p></div>
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
    }, [notes, statusFilter, showOverdue]);

    const visibleDeadlines = upcomingDeadlines.slice(0, deadlineCount);
    const hasMoreDeadlines = deadlineCount < upcomingDeadlines.length;
    const handleLoadMore = () => setDeadlineCount(prev => prev + ITEMS_PER_PAGE);

    const getStatusBadgeClass = (status: string) => {
        if (status === 'Urgent') return "bg-rose-500/10 text-rose-500";
        if (status === 'In Progress') return "bg-orange-500/10 text-orange-500";
        if (status === 'Done') return "bg-sky-500/10 text-sky-500";
        return "bg-yellow-500/10 text-yellow-500";
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
                {/* Header: < March 2026 > with month picker */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-1 relative">
                        <Button variant="ghost" onClick={() => navigate(-1)} className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>

                        {/* Month title — clickable to open picker */}
                        <div className="relative" ref={monthPickerRef}>
                            <button
                                onClick={() => setShowMonthPicker(!showMonthPicker)}
                                className="px-3 py-1.5 rounded-xl text-lg sm:text-2xl font-black text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200"
                            >
                                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </button>

                            {/* Month picker dropdown */}
                            {showMonthPicker && (
                                <div className="absolute top-full left-0 mt-2 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 p-4 w-[280px] animate-in fade-in zoom-in-95 duration-200">
                                    {/* Year nav */}
                                    <div className="flex items-center justify-between mb-3">
                                        <button onClick={() => changeYear(-1)} className="p-1 rounded-lg hover:bg-muted/30"><ChevronLeft className="w-4 h-4" /></button>
                                        <span className="font-black text-foreground">{currentDate.getFullYear()}</span>
                                        <button onClick={() => changeYear(1)} className="p-1 rounded-lg hover:bg-muted/30"><ChevronRight className="w-4 h-4" /></button>
                                    </div>
                                    {/* Month grid */}
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {MONTHS.map((m, i) => (
                                            <button
                                                key={m}
                                                onClick={() => goToMonth(i)}
                                                className={cn(
                                                    "py-2 rounded-lg text-xs font-bold transition-all",
                                                    i === currentDate.getMonth()
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                                                )}
                                            >
                                                {m.substring(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Today button inside picker */}
                                    <button
                                        onClick={goToToday}
                                        className="w-full mt-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
                                    >
                                        Today
                                    </button>
                                </div>
                            )}
                        </div>

                        <Button variant="ghost" onClick={() => navigate(1)} className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10">
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-8 sm:h-9 px-2 sm:px-3 rounded-xl bg-card/60 border border-border/40 text-xs sm:text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer pr-7"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                        >
                            {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s === 'All' ? '🔍 All Status' : s}</option>
                            ))}
                        </select>

                        {/* View Mode */}
                        <div className="flex items-center bg-card/60 border border-border/40 rounded-xl p-0.5 sm:p-1">
                            {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
                                <Button key={mode} variant="ghost" onClick={() => setViewMode(mode)}
                                    className={cn("h-7 sm:h-8 px-2.5 sm:px-4 rounded-lg font-bold text-[10px] sm:text-xs capitalize", viewMode === mode ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                                    {mode}
                                </Button>
                            ))}
                        </div>

                        {/* Deadlines toggle button */}
                        <Button
                            variant="outline"
                            onClick={() => setShowDeadlines(!showDeadlines)}
                            className={cn(
                                "h-8 sm:h-9 px-3 rounded-xl border-border/40 font-bold text-xs gap-1.5",
                                showDeadlines ? "bg-primary/10 text-primary border-primary/30" : "bg-card/60"
                            )}
                        >
                            {showDeadlines ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                            <span className="hidden sm:inline">Deadlines</span>
                            {upcomingDeadlines.length > 0 && (
                                <span className="bg-primary/20 text-primary text-[10px] font-black px-1.5 py-0.5 rounded-full">{upcomingDeadlines.length}</span>
                            )}
                        </Button>
                    </div>
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
                                <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground">
                                    {showOverdue ? 'Overdue Deadlines' : 'Upcoming Deadlines'}
                                </CardTitle>
                                <span className={cn("text-xs font-black px-2.5 py-1 rounded-full border", 
                                    showOverdue ? "text-rose-500 bg-rose-500/15 border-rose-500/30" : "text-primary bg-primary/15 border-primary/30"
                                )}>
                                    {upcomingDeadlines.length}
                                </span>
                            </div>
                            <div className="flex bg-muted/40 p-1 rounded-xl mt-3 border border-border/40">
                                <button
                                    onClick={() => { setShowOverdue(false); setDeadlineCount(ITEMS_PER_PAGE); }}
                                    className={cn("flex-1 text-[11px] font-black py-1.5 rounded-lg transition-all uppercase tracking-wider", !showOverdue ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}
                                >
                                    Upcoming
                                </button>
                                <button
                                    onClick={() => { setShowOverdue(true); setDeadlineCount(ITEMS_PER_PAGE); }}
                                    className={cn("flex-1 text-[11px] font-black py-1.5 rounded-lg transition-all uppercase tracking-wider", showOverdue ? "bg-rose-500 text-white shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}
                                >
                                    Overdue
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                                {visibleDeadlines.length > 0 ? visibleDeadlines.map(note => (
                                    <div
                                        key={note.note_id}
                                        onClick={() => handleEditNote(note)}
                                        className="group p-3 bg-card border-2 border-border/60 rounded-xl cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg shadow-sm"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge className={cn("text-[10px] font-black uppercase py-0.5", getStatusBadgeClass(note.status))}>
                                                {note.status}
                                            </Badge>
                                            <span className="text-[10px] font-bold text-muted-foreground">
                                                {new Date(note.reminders!.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h4 className={cn("font-bold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1", note.status === 'Done' && "opacity-50")}>{note.title}</h4>
                                        <div className="flex items-center gap-1.5 mt-2 opacity-60">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: note.note_categories?.color_code || '#718096' }} />
                                            <span className="text-[10px] font-bold text-muted-foreground">{note.note_categories?.name || 'Uncategorized'}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center space-y-3 opacity-50">
                                        <Clock className="w-8 h-8 mx-auto" />
                                        <p className="text-xs font-bold uppercase">No {showOverdue ? 'Overdue' : 'Upcoming'} Deadlines</p>
                                    </div>
                                )}

                                {hasMoreDeadlines && (
                                    <Button variant="outline" onClick={handleLoadMore}
                                        className="w-full rounded-xl border-primary/20 text-primary font-bold text-xs hover:bg-primary/5 mt-2">
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
