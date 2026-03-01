'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    ChevronLeft, ChevronRight, Loader2, Clock
} from 'lucide-react';
import {
    Button, Card, CardHeader, CardTitle,
    CardContent, Badge
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { DbNote, DbNoteCategory, DbReminder } from '@/lib/supabase-types';
import NoteModal from '../notes/NoteModal';
import { apiClient } from '@/lib/api-client';

interface ExtendedNote extends DbNote {
    note_categories?: DbNoteCategory;
    reminders?: DbReminder;
}

type ViewMode = 'month' | 'week' | 'day';

const STATUS_OPTIONS = ['All', 'New', 'In Progress', 'Urgent', 'Done'];
const ITEMS_PER_PAGE = 5;

const CalendarView: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [notes, setNotes] = useState<ExtendedNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<ExtendedNote | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [draggedNote, setDraggedNote] = useState<ExtendedNote | null>(null);
    const [dragOverDate, setDragOverDate] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const [deadlineCount, setDeadlineCount] = useState(ITEMS_PER_PAGE);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const res = await apiClient.fetch('/api/notes');
            const json = await res.json();
            if (json.success) setNotes(json.data || []);
        } catch (error) { console.error('Error fetching notes:', error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNotes(); }, []);

    // Filtered notes by status
    const filteredNotes = useMemo(() => {
        if (statusFilter === 'All') return notes;
        return notes.filter(n => n.status === statusFilter);
    }, [notes, statusFilter]);

    // Helpers
    const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
    const formatDateStr = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const getNotesForDate = (dateStr: string) => filteredNotes.filter(n => n.reminders?.due_date?.startsWith(dateStr));

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
    const goToToday = () => setCurrentDate(new Date());

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
        e.preventDefault(); setDragOverDate(dateStr);
    };
    const handleDragLeave = () => setDragOverDate(null);
    const handleDrop = async (e: React.DragEvent, dateStr: string) => {
        e.preventDefault(); setDragOverDate(null);
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

    const handleEditNote = (note: ExtendedNote) => { setSelectedNote(note); setIsModalOpen(true); };

    const getHeaderTitle = () => {
        if (viewMode === 'month') return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (viewMode === 'week') {
            const start = getWeekStart(currentDate);
            const end = new Date(start); end.setDate(end.getDate() + 6);
            return `${start.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
        return currentDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const getWeekStart = (date: Date) => {
        const d = new Date(date); d.setDate(d.getDate() - d.getDay()); return d;
    };

    const renderNoteChip = (note: ExtendedNote) => {
        const color = note.note_categories?.color_code || '#718096';
        return (
            <div
                key={note.note_id}
                draggable
                onDragStart={(e) => handleDragStart(e, note)}
                onDragEnd={handleDragEnd}
                onClick={(e) => { e.stopPropagation(); handleEditNote(note); }}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-extrabold truncate cursor-grab active:cursor-grabbing transition-all hover:scale-[1.03] hover:shadow-xl shadow-md"
                style={{
                    backgroundColor: `${color}35`,
                    borderLeft: `4px solid ${color}`,
                    boxShadow: `0 2px 6px ${color}20`,
                    color: color,
                }}
            >
                <span className="text-sm">{note.note_categories?.icon || '•'}</span>
                <span className="truncate">{note.title}</span>
            </div>
        );
    };

    const renderDayCell = (dateStr: string, day: number, isCurrentMonth: boolean, minH = 'min-h-[130px]') => {
        const dayNotes = getNotesForDate(dateStr);
        const isToday = dateStr === todayStr;
        const isDragOver = dragOverDate === dateStr;
        return (
            <div
                key={dateStr}
                className={cn(
                    minH, "border border-border/40 p-2.5 transition-all group relative",
                    isCurrentMonth ? "bg-card/60" : "bg-muted/20 opacity-40",
                    isToday && "bg-primary/8 border-primary/30",
                    isDragOver && "bg-primary/15 border-primary/40 ring-1 ring-primary/30"
                )}
                onDragOver={(e) => handleDragOver(e, dateStr)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, dateStr)}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                        "text-sm font-black w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                        isToday ? "bg-primary text-primary-foreground shadow-md" : "text-foreground/70 group-hover:text-foreground"
                    )}>
                        {day}
                    </span>
                    {dayNotes.length > 0 && (
                        <span className="text-[10px] font-black text-white bg-primary/80 px-1.5 py-0.5 rounded-full shadow-sm min-w-[20px] text-center">
                            {dayNotes.length}
                        </span>
                    )}
                </div>
                <div className="space-y-1.5 overflow-y-auto max-h-[90px] custom-scrollbar">
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
            <div className="border border-border/40 rounded-2xl overflow-hidden bg-card/30 backdrop-blur-sm shadow-lg">
                <div className="grid grid-cols-7 bg-muted/30 border-b border-border/40">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center py-3 text-sm font-black text-foreground/60 uppercase tracking-widest">{day}</div>
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
                        "min-h-[300px] border border-border/40 p-4 transition-all bg-card/60",
                        isToday && "bg-primary/8 border-primary/30",
                        isDragOver && "bg-primary/15 ring-1 ring-primary/30"
                    )}
                    onDragOver={(e) => handleDragOver(e, dateStr)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, dateStr)}
                >
                    <div className="text-center mb-3">
                        <div className="text-xs font-bold text-muted-foreground uppercase">{d.toLocaleDateString('default', { weekday: 'short' })}</div>
                        <div className={cn("text-2xl font-black mx-auto w-10 h-10 flex items-center justify-center rounded-full mt-1", isToday ? "bg-primary text-primary-foreground" : "text-foreground")}>{d.getDate()}</div>
                    </div>
                    <div className="space-y-2 overflow-y-auto max-h-[240px]">
                        {dayNotes.map(renderNoteChip)}
                        {dayNotes.length === 0 && <p className="text-xs text-muted-foreground/40 text-center pt-4">No tasks</p>}
                    </div>
                </div>
            );
        }
        return (<div className="border border-border/40 rounded-2xl overflow-hidden bg-card/30 shadow-lg"><div className="grid grid-cols-7">{cells}</div></div>);
    };

    // DAY VIEW
    const renderDayView = () => {
        const dateStr = formatDateStr(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const dayNotes = getNotesForDate(dateStr);
        const isToday = dateStr === todayStr;
        const isDragOver = dragOverDate === dateStr;
        return (
            <div
                className={cn("border border-border/40 rounded-2xl bg-card/30 shadow-lg p-6 min-h-[500px] transition-all", isDragOver && "bg-primary/15 ring-1 ring-primary/30")}
                onDragOver={(e) => handleDragOver(e, dateStr)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, dateStr)}
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
                            onClick={() => handleEditNote(note)}
                            className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-xl cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: `${note.note_categories?.color_code || '#718096'}15` }}>
                                {note.note_categories?.icon || '📝'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-foreground line-clamp-1">{note.title}</h4>
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

    // Upcoming deadlines — from today onward, sorted by closest first
    const upcomingDeadlines = useMemo(() => {
        const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
        return filteredNotes
            .filter(n => {
                if (!n.reminders) return false;
                const due = new Date(n.reminders.due_date); due.setHours(0, 0, 0, 0);
                return due >= todayDate;
            })
            .sort((a, b) => new Date(a.reminders!.due_date).getTime() - new Date(b.reminders!.due_date).getTime());
    }, [filteredNotes]);

    const visibleDeadlines = upcomingDeadlines.slice(0, deadlineCount);
    const hasMoreDeadlines = deadlineCount < upcomingDeadlines.length;

    const handleLoadMore = () => {
        setDeadlineCount(prev => prev + ITEMS_PER_PAGE);
    };

    // Reset lazy load count when filter changes
    useEffect(() => { setDeadlineCount(ITEMS_PER_PAGE); }, [statusFilter]);

    const getStatusBadgeClass = (status: string) => {
        if (status === 'Urgent') return "bg-rose-500/10 text-rose-500";
        if (status === 'In Progress') return "bg-orange-500/10 text-orange-500";
        if (status === 'Done') return "bg-sky-500/10 text-sky-500";
        return "bg-yellow-500/10 text-yellow-500";
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center bg-card/60 border border-border/40 rounded-xl overflow-hidden">
                            <Button variant="ghost" onClick={() => navigate(-1)} className="h-9 sm:h-10 w-9 sm:w-10 p-0 rounded-none border-r border-border/40 hover:bg-primary/10">
                                <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                            </Button>
                            <Button variant="ghost" onClick={() => navigate(1)} className="h-9 sm:h-10 w-9 sm:w-10 p-0 rounded-none hover:bg-primary/10">
                                <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
                            </Button>
                        </div>
                        <h2 className="text-base sm:text-2xl font-black text-foreground">{getHeaderTitle()}</h2>
                        <Button variant="outline" onClick={goToToday} className="h-8 sm:h-10 px-3 sm:px-4 rounded-xl border-border/40 bg-card/60 font-bold text-xs sm:text-sm hover:bg-primary/10">
                            Today
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Status Filter Dropdown */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-8 sm:h-9 px-2 sm:px-3 rounded-xl bg-card/60 border border-border/40 text-xs sm:text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer pr-7"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                        >
                            {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s === 'All' ? '🔍 All' : s}</option>
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
                    </div>
                </div>

                {/* Calendar Content */}
                {loading ? (
                    <div className="h-[600px] flex items-center justify-center bg-card/30 rounded-2xl border border-border/40"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>
                ) : (
                    <>
                        {viewMode === 'month' && renderMonthView()}
                        {viewMode === 'week' && renderWeekView()}
                        {viewMode === 'day' && renderDayView()}
                    </>
                )}
            </div>

            {/* Sidebar — Upcoming Deadlines */}
            <div className="w-full lg:w-80 space-y-6">
                <Card className="border-border/50 bg-card/80 backdrop-blur-md overflow-hidden shadow-xl">
                    <CardHeader className="border-b border-border/50 bg-muted/30">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground">Upcoming Deadlines</CardTitle>
                            <span className="text-xs font-black text-primary bg-primary/15 px-2.5 py-1 rounded-full border border-primary/30">{upcomingDeadlines.length}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                            {visibleDeadlines.length > 0 ? visibleDeadlines.map(note => (
                                <div
                                    key={note.note_id}
                                    onClick={() => handleEditNote(note)}
                                    className="group p-4 bg-card border-2 border-border/60 rounded-xl cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge className={cn("text-[10px] font-black uppercase py-0.5", getStatusBadgeClass(note.status))}>
                                            {note.status}
                                        </Badge>
                                        <span className="text-[10px] font-bold text-muted-foreground">
                                            {new Date(note.reminders!.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">{note.title}</h4>
                                    <div className="flex items-center gap-1.5 mt-2 opacity-60">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: note.note_categories?.color_code || '#718096' }} />
                                        <span className="text-[10px] font-bold text-muted-foreground">{note.note_categories?.name || 'Uncategorized'}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center space-y-3 opacity-50">
                                    <Clock className="w-8 h-8 mx-auto" />
                                    <p className="text-xs font-bold uppercase">No Upcoming Deadlines</p>
                                </div>
                            )}

                            {/* Load More button */}
                            {hasMoreDeadlines && (
                                <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    className="w-full rounded-xl border-primary/20 text-primary font-bold text-xs hover:bg-primary/5 mt-2"
                                >
                                    Load More ({upcomingDeadlines.length - deadlineCount} remaining)
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <NoteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                note={selectedNote}
                onSave={fetchNotes}
            />
        </div>
    );
};

export default CalendarView;
