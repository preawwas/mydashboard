'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLoading } from '@/components/providers/LoadingProvider';
import { Search, Plus, Filter, Tag as TagIcon, StickyNote, Zap, Settings, Trash2, Send, X, Pin, Edit2 } from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { apiClient } from '@/lib/api-client';
import { DbShortNoteWithTags, DbTag } from '@/lib/supabase-types';
import ShortNoteCard from './ShortNoteCard';
import ShortNoteEditor from './ShortNoteEditor';
import { cn } from '@/lib/utils';
import { parseTag, stringifyTag, TAG_COLORS } from '@/lib/tag-helpers';

const getSolidColorClass = (colorValue: string) => {
    if (colorValue.includes('red')) return 'bg-red-500 text-white';
    if (colorValue.includes('orange')) return 'bg-orange-500 text-white';
    if (colorValue.includes('amber')) return 'bg-amber-500 text-white';
    if (colorValue.includes('emerald')) return 'bg-emerald-500 text-white';
    if (colorValue.includes('blue')) return 'bg-blue-500 text-white';
    if (colorValue.includes('indigo')) return 'bg-indigo-500 text-white';
    if (colorValue.includes('purple')) return 'bg-purple-500 text-white';
    if (colorValue.includes('pink')) return 'bg-pink-500 text-white';
    return 'bg-primary text-primary-foreground';
};

const ShortNoteDashboard: React.FC = () => {
    const { startLoading, stopLoading } = useLoading();
    const [notes, setNotes] = useState<DbShortNoteWithTags[]>([]);
    const [tags, setTags] = useState<DbTag[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
    const [filterPinned, setFilterPinned] = useState(false);
    const [quickNoteContent, setQuickNoteContent] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'edit'>('grid');
    const [selectedNote, setSelectedNote] = useState<DbShortNoteWithTags | null>(null);

    // Trash state
    const [trashedNotes, setTrashedNotes] = useState<DbShortNoteWithTags[]>([]);
    const [showTrash, setShowTrash] = useState(false);

    // Tag creation states
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [newTagText, setNewTagText] = useState('');
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);
    const [tagLoading, setTagLoading] = useState(false);

    // Tag management states
    const [isManageTagsModalOpen, setIsManageTagsModalOpen] = useState(false);
    const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
    const [editingTagId, setEditingTagId] = useState<string | null>(null);
    const [editingTagText, setEditingTagText] = useState('');
    const [editingTagColor, setEditingTagColor] = useState('');
    const [isSavingEditTagId, setIsSavingEditTagId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [notesRes, tagsRes] = await Promise.all([
                apiClient.fetch('/api/short-notes'),
                apiClient.fetch('/api/tags')
            ]);

            const notesJson = await notesRes.json();
            const tagsJson = await tagsRes.json();

            if (notesJson.success) {
                // Map the complex tag structure to a simple array
                const mappedNotes = notesJson.data.map((n: any) => ({
                    ...n,
                    tags: n.note_tags?.map((nt: any) => nt.tags).filter(Boolean) || []
                }));
                setNotes(mappedNotes);
            }
            if (tagsJson.success) setTags(tagsJson.data || []);
        } catch (error) {
            console.error('Error fetching short notes data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTrashedNotes = useCallback(async () => {
        try {
            const res = await apiClient.fetch('/api/short-notes?filter=deleted');
            const json = await res.json();
            if (json.success) {
                // Map the complex tag structure to a simple array
                const mappedNotes = json.data.map((n: any) => ({
                    ...n,
                    tags: n.note_tags?.map((nt: any) => nt.tags).filter(Boolean) || []
                }));
                setTrashedNotes(mappedNotes);
            }
        } catch (error) {
            console.error('Error fetching trashed short notes:', error);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Sync loading state with global LoadingOverlay
    useEffect(() => {
        if (loading && notes.length === 0) {
            startLoading();
        } else {
            stopLoading();
        }
    }, [loading, notes.length, startLoading, stopLoading]);

    const [isCreatingQuickNote, setIsCreatingQuickNote] = useState(false);

    const handleCreateQuickNote = async () => {
        if (!quickNoteContent.trim() || isCreatingQuickNote) return;

        setIsCreatingQuickNote(true);
        try {
            const res = await apiClient.fetch('/api/short-notes', {
                method: 'POST',
                body: JSON.stringify({
                    title: quickNoteContent.split('\n')[0].substring(0, 50) || 'Quick Note',
                    content: quickNoteContent
                })
            });
            const json = await res.json();
            if (json.success) {
                setQuickNoteContent('');
                fetchData();
            }
        } catch (error) {
            console.error('Error creating quick note:', error);
        } finally {
            setIsCreatingQuickNote(false);
        }
    };

    const handleDrop = async (e: React.DragEvent, targetTagId: string) => {
        e.preventDefault();
        const sourceTagId = e.dataTransfer.getData('text/plain');
        if (!sourceTagId || sourceTagId === targetTagId) return;

        const items = Array.from(tags);
        const sourceIndex = items.findIndex(t => t.id === sourceTagId);
        const targetIndex = items.findIndex(t => t.id === targetTagId);

        if (sourceIndex === -1 || targetIndex === -1) return;

        const [reorderedItem] = items.splice(sourceIndex, 1);
        items.splice(targetIndex, 0, reorderedItem);

        // Optimistic UI update
        setTags(items);

        // Push full ordered array of IDs to API
        try {
            await apiClient.fetch('/api/tags/reorder', {
                method: 'PUT',
                body: JSON.stringify({ tagIds: items.map(t => t.id) })
            });
        } catch (err) {
            console.error('Failed to save tag order', err);
            // Revert on failure
            fetchData();
        }
    };

    const handleCreateTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagText.trim()) return;
        setTagLoading(true);
        try {
            const res = await apiClient.fetch('/api/tags', {
                method: 'POST',
                body: JSON.stringify({
                    name: stringifyTag(newTagText.trim(), newTagColor)
                })
            });
            const json = await res.json();
            if (json.success) {
                setIsTagModalOpen(false);
                setNewTagText('');
                setNewTagColor(TAG_COLORS[0].value);
                fetchData();
            }
        } catch (error) {
            console.error('Error creating tag:', error);
        } finally {
            setTagLoading(false);
        }
    };

    const handleDeleteTag = async (tagId: string) => {
        setDeletingTagId(tagId);
        try {
            const res = await apiClient.fetch(`/api/tags/${tagId}`, {
                method: 'DELETE'
            });
            const json = await res.json();
            if (json.success) {
                if (selectedTagId === tagId) {
                    setSelectedTagId(null);
                }
                fetchData();
            } else {
                alert(json.error || 'Failed to delete tag');
            }
        } catch (error) {
            console.error('Error deleting tag:', error);
            alert('An error occurred while deleting the tag');
        } finally {
            setDeletingTagId(null);
        }
    };

    const handleSaveEditTag = async (tagId: string) => {
        if (!editingTagText.trim() || isSavingEditTagId === tagId) return;
        setIsSavingEditTagId(tagId);
        try {
            const res = await apiClient.fetch(`/api/tags/${tagId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    name: stringifyTag(editingTagText.trim(), editingTagColor)
                })
            });
            const json = await res.json();
            if (json.success) {
                setEditingTagId(null);
                fetchData();
            } else {
                alert(json.error || 'Failed to update tag');
            }
        } catch (error) {
            console.error('Error updating tag:', error);
            alert('An error occurred while updating the tag');
        } finally {
            setIsSavingEditTagId(null);
        }
    };

    const handleRestore = async (noteId: string) => {
        setTrashedNotes(prev => prev.filter(n => n.note_id !== noteId));
        try {
            await apiClient.fetch(`/api/short-notes/${noteId}`, {
                method: 'PATCH',
                body: JSON.stringify({ is_deleted: false })
            });
            fetchData();
        } catch (error) {
            console.error('Error restoring note:', error);
            fetchTrashedNotes();
        }
    };

    const handlePermanentDelete = async (noteId: string) => {
        setTrashedNotes(prev => prev.filter(n => n.note_id !== noteId));
        try {
            await apiClient.fetch(`/api/short-notes/${noteId}?permanent=true`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error permanently deleting note:', error);
            fetchTrashedNotes();
        }
    };

    const handleOpenCreate = () => { setSelectedNote(null); setViewMode('edit'); };
    const handleOpenEdit = (note: DbShortNoteWithTags) => { setSelectedNote(note); setViewMode('edit'); };
    const handleSave = () => { setViewMode('grid'); fetchData(); };
    const handleCancel = () => { setViewMode('grid'); };

    const filteredNotes = useMemo<DbShortNoteWithTags[]>(() => {
        return notes.filter(note => {
            const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content?.toLowerCase().includes(searchQuery.toLowerCase());

            // If NO tag is selected (All Notes), only show notes that HAVE tags
            // If A tag is selected, check if note has that specific tag
            const matchesTag = selectedTagId
                ? note.tags?.some(t => t.id === selectedTagId)
                : (note.tags && note.tags.length > 0);

            const matchesPin = filterPinned ? note.is_favorite : true;

            return matchesSearch && matchesTag && matchesPin;
        });
    }, [notes, searchQuery, selectedTagId, filterPinned]);

    return (
        <div className="flex flex-col lg:flex-row gap-6 min-h-screen p-6 bg-background">
            {/* Sidebar Tags */}
            <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
                <div className="flex w-full items-center justify-between mb-2">
                    <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">Tags</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors shrink-0"
                        onClick={() => setIsManageTagsModalOpen(true)}
                        title="Manage Tags"
                        aria-label="Manage Tags"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
                <nav className="space-y-1">
                    <button
                        onClick={() => { setSelectedTagId(null); setViewMode('grid'); }}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                            !selectedTagId ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        <TagIcon className="w-4 h-4" />
                        <span>All Notes</span>
                    </button>
                    <div className="space-y-1">
                        {tags.map((tag) => {
                            const parsed = parseTag(tag);
                            return (
                                <button
                                    key={tag.id}
                                    draggable={true}
                                    onDragStart={(e) => {
                                        e.dataTransfer.effectAllowed = 'move';
                                        e.dataTransfer.setData('text/plain', tag.id);
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDrop(e, tag.id)}
                                    onClick={() => { setSelectedTagId(tag.id); setViewMode('grid'); }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all border group cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary/20",
                                        selectedTagId === tag.id ? parsed.colorClasses : "bg-transparent border-transparent hover:bg-muted/30"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "font-black text-lg leading-none opacity-80",
                                            selectedTagId === tag.id ? "text-current opacity-70" : parsed.colorClasses.match(/text-\S+/)?.[0] || "text-muted-foreground"
                                        )}>#</span>
                                        <span className={cn(
                                            selectedTagId !== tag.id ? "text-foreground" : ""
                                        )}>{parsed.text}</span>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-30 transition-opacity">
                                        ::
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => setIsTagModalOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-primary/70 hover:bg-primary/5 mt-2 border border-dashed border-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Tag</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 space-y-6">
                {viewMode === 'edit' ? (
                    <ShortNoteEditor
                        note={selectedNote}
                        tags={tags}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                ) : (
                    <>
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h1 className="text-2xl font-black text-foreground">
                                {selectedTagId
                                    ? `#${tags.find(t => t.id === selectedTagId) ? parseTag(tags.find(t => t.id === selectedTagId)!).text : 'Notes'}`
                                    : 'All Notes'}
                            </h1>
                            <div className="flex items-center gap-2 flex-1 md:max-w-xl">
                                <div className="flex-1 group/search">
                                    <Input
                                        placeholder="Search notes..."
                                        className="h-11 bg-card border-border/50 rounded-2xl shadow-sm transition-all"
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
                                <Button
                                    variant="outline"
                                    onClick={() => setFilterPinned(!filterPinned)}
                                    className={cn(
                                        "h-11 w-11 p-0 rounded-2xl border-border/50 transition-colors shrink-0 flex items-center justify-center shadow-sm",
                                        filterPinned ? "bg-primary text-primary-foreground border-primary/50" : "bg-card/50 text-muted-foreground hover:text-foreground"
                                    )}
                                    title={filterPinned ? "Show All Notes" : "Show Pinned Notes Only"}
                                >
                                    <Pin className={cn("w-5 h-5 transition-transform", filterPinned ? "fill-current" : "")} />
                                </Button>
                                <Button
                                    onClick={handleOpenCreate}
                                    className="h-11 px-5 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 flex items-center gap-2 shrink-0"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="hidden sm:inline">New Note</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => { setShowTrash(true); fetchTrashedNotes(); }}
                                    className="h-11 px-4 rounded-2xl border-border/50 bg-card/50 text-muted-foreground hover:text-rose-500 shrink-0 flex items-center justify-center shadow-sm gap-2"
                                    title="View Trash"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    <span className="hidden sm:inline font-bold">Trash</span>
                                </Button>
                            </div>
                        </header>

                        {/* Quick Note Input */}
                        <div className="bg-card border border-border/50 rounded-3xl p-4 shadow-xl shadow-primary/5 transition-all focus-within:ring-2 focus-within:ring-primary/20">
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <h2 className="text-sm font-black text-foreground">Quick Note</h2>
                            </div>
                            <div className="flex gap-4">
                                <textarea
                                    placeholder="What's on your mind?..."
                                    aria-label="Quick note content"
                                    className="flex-1 bg-transparent border-0 focus:ring-0 resize-none text-sm min-h-[60px] custom-scrollbar"
                                    value={quickNoteContent}
                                    onChange={(e) => setQuickNoteContent(e.target.value)}
                                />
                                <div className="flex flex-col justify-end">
                                    <Button
                                        className={cn(
                                            "px-8 rounded-2xl font-bold shadow-lg transition-all",
                                            !quickNoteContent.trim() || isCreatingQuickNote
                                                ? "bg-muted text-muted-foreground shadow-none"
                                                : "bg-primary text-primary-foreground shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                                        )}
                                        onClick={handleCreateQuickNote}
                                        disabled={!quickNoteContent.trim() || isCreatingQuickNote}
                                    >
                                        {isCreatingQuickNote ? (
                                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span>Save Note</span>
                                                <Send className="w-4 h-4" />
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Notes Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-48 bg-card/50 border border-border/20 rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {filteredNotes.map((note: DbShortNoteWithTags) => (
                                    <ShortNoteCard key={note.note_id} note={note} onUpdate={fetchData} onEdit={() => handleOpenEdit(note)} />
                                ))}
                                {filteredNotes.length === 0 && (
                                    <div className="col-span-full py-20 text-center">
                                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <StickyNote className="w-10 h-10 text-muted-foreground/30" />
                                        </div>
                                        <p className="text-muted-foreground font-bold">No notes found</p>
                                        <p className="text-sm text-muted-foreground/50">Click a tag or create a new note</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Tag Creation Modal */}
            <Modal isOpen={isTagModalOpen} onClose={() => setIsTagModalOpen(false)} title="Create New Tag">
                <form onSubmit={handleCreateTag} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground ml-1">Tag Name</label>
                        <Input
                            placeholder="e.g. Work, Ideas, Urgent"
                            value={newTagText}
                            onChange={(e) => setNewTagText(e.target.value)}
                            className="bg-card/50"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-muted-foreground ml-1">Tag Color</label>
                        <div className="flex flex-wrap gap-3">
                            {TAG_COLORS.map(color => (
                                <button
                                    key={color.label}
                                    type="button"
                                    onClick={() => setNewTagColor(color.value)}
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center transition-all border-2",
                                        getSolidColorClass(color.value),
                                        newTagColor === color.value ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-md border-transparent" : "border-transparent opacity-50 hover:opacity-100"
                                    )}
                                    title={color.label}
                                >
                                    {newTagColor === color.value && <div className="w-2.5 h-2.5 rounded-full bg-current opacity-90" />}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsTagModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={tagLoading || !newTagText.trim()} className="font-bold">
                            {tagLoading ? 'Saving...' : 'Create Tag'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Manage Tags Modal */}
            <Modal isOpen={isManageTagsModalOpen} onClose={() => setIsManageTagsModalOpen(false)} title="Manage Tags">
                <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                    {tags.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No tags created yet.</p>
                    ) : (
                        tags.map(tag => {
                            const parsed = parseTag(tag);
                            const isGeneralTag = parsed.text.toLowerCase() === 'general';
                            const usageCount = notes.filter(n => n.tags?.some(t => t.id === tag.id)).length;
                            const isDeleting = deletingTagId === tag.id;

                            // Disable deletion if tag is used OR if it's the fixed general tag
                            const disableDelete = usageCount > 0 || isGeneralTag;
                            const deleteTooltip = isGeneralTag
                                ? "System tag cannot be deleted"
                                : usageCount > 0 ? "Cannot delete tag in use" : "Delete tag";

                            const isEditing = editingTagId === tag.id;

                            if (isEditing) {
                                return (
                                    <div key={tag.id} className="p-3 rounded-xl border bg-card/50 space-y-3">
                                        <Input
                                            value={editingTagText}
                                            onChange={(e) => setEditingTagText(e.target.value)}
                                            className="h-9 text-sm font-bold bg-background"
                                            autoFocus
                                        />
                                        <div className="flex flex-wrap gap-1.5 px-1 mt-2">
                                            {TAG_COLORS.map(color => (
                                                <button
                                                    key={color.label}
                                                    type="button"
                                                    onClick={() => setEditingTagColor(color.value)}
                                                    className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center transition-all border-2",
                                                        getSolidColorClass(color.value),
                                                        editingTagColor === color.value ? "ring-2 ring-primary ring-offset-1 scale-110 shadow-sm border-transparent" : "border-transparent opacity-50 hover:opacity-100"
                                                    )}
                                                    title={color.label}
                                                >
                                                    {editingTagColor === color.value && <div className="w-2 h-2 rounded-full bg-current opacity-90" />}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                                            <Button variant="ghost" size="sm" onClick={() => setEditingTagId(null)} className="h-7 text-xs px-3">Cancel</Button>
                                            <Button
                                                size="sm"
                                                className="h-7 text-xs px-3 font-bold"
                                                disabled={!editingTagText.trim() || isSavingEditTagId === tag.id}
                                                onClick={() => handleSaveEditTag(tag.id)}
                                            >
                                                {isSavingEditTagId === tag.id ? 'Saving...' : 'Save'}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={tag.id} className="flex items-center justify-between p-3 rounded-xl border bg-card/50 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-3 h-3 rounded-full", parsed.colorClasses.split(' ')[0])} />
                                        <div>
                                            <p className="font-bold text-sm text-foreground">
                                                {parsed.text}
                                                {isGeneralTag && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-bold tracking-wider">Default</span>}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {usageCount} {usageCount === 1 ? 'note' : 'notes'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            disabled={isGeneralTag}
                                            onClick={() => {
                                                setEditingTagId(tag.id);
                                                setEditingTagText(parsed.text);
                                                setEditingTagColor(parsed.colorClasses);
                                            }}
                                            title={isGeneralTag ? "System tag cannot be edited" : "Edit tag"}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "h-8 w-8 p-0 rounded-lg",
                                                disableDelete ? "opacity-30 cursor-not-allowed" : "text-destructive hover:text-destructive hover:bg-destructive/10"
                                            )}
                                            disabled={disableDelete || isDeleting}
                                            onClick={() => handleDeleteTag(tag.id)}
                                            title={deleteTooltip}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="pt-4 mt-2 border-t flex justify-end">
                    <Button onClick={() => setIsManageTagsModalOpen(false)} className="font-bold">Done</Button>
                </div>
            </Modal>

            {/* Trash Modal */}
            <Modal isOpen={showTrash} onClose={() => setShowTrash(false)} title="Trash Bin">
                <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                    {trashedNotes.length === 0 ? (
                        <div className="py-8 text-center">
                            <Trash2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm font-bold text-muted-foreground">Trash is empty</p>
                        </div>
                    ) : (
                        trashedNotes.map(note => {
                            const noteDate = new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            return (
                                <div key={note.note_id} className="p-4 rounded-xl border bg-card/50 hover:bg-muted/30 transition-colors">
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-sm text-foreground truncate">{note.title}</h3>
                                            <p className="text-xs text-muted-foreground truncate mt-1">
                                                {note.content?.replace(/<[^>]*>/g, '').trim() || 'No content...'}
                                            </p>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground shrink-0 mt-0.5">
                                            {noteDate}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRestore(note.note_id)}
                                            className="h-8 text-xs font-bold"
                                        >
                                            Restore Note
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handlePermanentDelete(note.note_id)}
                                            className="h-8 text-xs font-bold px-3 bg-rose-500 hover:bg-rose-600 text-white border-transparent"
                                        >
                                            Delete Permanently
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="pt-4 mt-2 border-t flex justify-end">
                    <Button onClick={() => setShowTrash(false)} className="font-bold">Close</Button>
                </div>
            </Modal>
        </div>
    );
};

export default ShortNoteDashboard;
