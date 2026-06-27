'use client';

import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Modal,
    Select,
    Table,
} from '@/components/ui';
import { Edit, Heart, Trash2, Filter } from 'lucide-react';
import {
    formatNextReviewLabel,
    getVocabularyReview,
    getVocabularyTranslation,
    VOCABULARY_LANGUAGE_OPTIONS,
} from '@/lib/vocabulary-helpers';
import { VOCABULARY_THEME as T } from '@/lib/vocabulary-theme';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/lib/store';
import { VocabularyCategory, VocabularyEntry, VocabularyFormData } from '@/types';
import type { VocabularyFilter } from '@/hooks/useVocabulary';
import VocabularyHoverWord from './VocabularyHoverWord';

interface VocabularyReviewTableProps {
    entries: VocabularyEntry[];
    categories: VocabularyCategory[];
    loading: boolean;
    filter: VocabularyFilter;
    categoryId: string;
    onFilterChange: (filter: VocabularyFilter) => void;
    onCategoryChange: (categoryId: string) => void;
    onToggleFavorite: (entry: VocabularyEntry) => Promise<unknown>;
    onToggleReview: (id: string, step: number) => Promise<unknown>;
    onUpdate: (id: string, payload: Record<string, unknown>) => Promise<unknown>;
    onDelete: (id: string) => Promise<unknown>;
}

function InlineEditableCell({
    value,
    onSave,
    placeholder,
}: {
    value: string;
    onSave: (nextValue: string) => Promise<void>;
    placeholder?: string;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    useEffect(() => {
        setDraft(value);
    }, [value]);

    const commit = async () => {
        setEditing(false);
        if (draft !== value) {
            await onSave(draft);
        }
    };

    if (editing) {
        return (
            <Input
                autoFocus
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={() => void commit()}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') void commit();
                    if (event.key === 'Escape') {
                        setDraft(value);
                        setEditing(false);
                    }
                }}
                placeholder={placeholder}
            />
        );
    }

    return (
        <button
            type="button"
            onDoubleClick={() => setEditing(true)}
            className="max-w-[220px] truncate text-left hover:opacity-80"
            style={{ color: T.text }}
            title="Double click to edit"
        >
            {value || placeholder || '-'}
        </button>
    );
}

export default function VocabularyReviewTable({
    entries,
    categories,
    loading,
    filter,
    categoryId,
    onFilterChange,
    onCategoryChange,
    onToggleFavorite,
    onToggleReview,
    onUpdate,
    onDelete,
}: VocabularyReviewTableProps) {
    const { addToast } = useToastStore();
    const [editEntry, setEditEntry] = useState<VocabularyEntry | null>(null);
    const [editForm, setEditForm] = useState<VocabularyFormData>({
        categoryName: '',
        languageCode: 'en',
        word: '',
        pronunciation: '',
        meaning: '',
        remarks: '',
    });
    const [deleteTarget, setDeleteTarget] = useState<VocabularyEntry | null>(null);

    const openEditModal = (entry: VocabularyEntry) => {
        const translation = getVocabularyTranslation(entry);
        setEditEntry(entry);
        setEditForm({
            categoryName: entry.vocabulary_categories?.name || 'General',
            languageCode: translation?.language_code || 'en',
            word: translation?.word || '',
            pronunciation: translation?.pronunciation || '',
            meaning: translation?.meaning || '',
            remarks: translation?.remarks || '',
        });
    };

    const handleSaveEdit = async () => {
        if (!editEntry) return;
        try {
            await onUpdate(editEntry.id, {
                categoryName: editForm.categoryName,
                languageCode: editForm.languageCode,
                word: editForm.word,
                pronunciation: editForm.pronunciation,
                meaning: editForm.meaning,
                remarks: editForm.remarks,
            });
            setEditEntry(null);
            addToast('Vocabulary updated', 'success');
        } catch (error) {
            addToast(error instanceof Error ? error.message : 'Update failed', 'error');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await onDelete(deleteTarget.id);
            setDeleteTarget(null);
            addToast('Vocabulary deleted', 'success');
        } catch (error) {
            addToast(error instanceof Error ? error.message : 'Delete failed', 'error');
        }
    };

    const columns = [
        {
            key: 'no',
            header: 'No.',
            render: (_item: VocabularyEntry, index?: number) => (index ?? 0) + 1,
        },
        {
            key: 'word',
            header: 'Vocab.',
            render: (item: VocabularyEntry) => {
                const translation = getVocabularyTranslation(item);
                return (
                    <VocabularyHoverWord
                        word={translation?.word || ''}
                        languageCode={translation?.language_code}
                        pronunciation={translation?.pronunciation}
                        meaning={translation?.meaning}
                    />
                );
            },
        },
        {
            key: 'pronunciation',
            header: 'Pronunciation',
            render: (item: VocabularyEntry) => (
                <InlineEditableCell
                    value={getVocabularyTranslation(item)?.pronunciation || ''}
                    placeholder="Add pronunciation"
                    onSave={async (pronunciation) => {
                        await onUpdate(item.id, { pronunciation });
                    }}
                />
            ),
        },
        {
            key: 'favorite',
            header: <Heart className="h-4 w-4 mx-auto" style={{ color: T.favorite }} />,
            render: (item: VocabularyEntry) => (
                <button
                    type="button"
                    onClick={() => void onToggleFavorite(item)}
                    className="rounded-lg border p-2 transition-colors hover:bg-[#EAF4F4]"
                    style={{
                        color: item.is_favorite ? T.favorite : T.favoriteMuted,
                        borderColor: item.is_favorite ? T.favoriteBorder : '#E5E7EB',
                    }}
                    aria-label={item.is_favorite ? 'Remove favorite' : 'Add favorite'}
                >
                    <Heart className="h-4 w-4" />
                </button>
            ),
        },
        {
            key: 'meaning',
            header: 'Meaning',
            render: (item: VocabularyEntry) => (
                <span className="max-w-[240px] truncate block">
                    {getVocabularyTranslation(item)?.meaning || '-'}
                </span>
            ),
        },
        {
            key: 'checks',
            header: 'Check Read',
            render: (item: VocabularyEntry) => {
                const review = getVocabularyReview(item);
                const count = review?.review_count ?? 0;

                return (
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((step) => {
                            const checked = count >= step;
                            const isNext = count + 1 === step && count < 5;
                            const isInteractive = checked || isNext;

                            return (
                                <button
                                    key={step}
                                    type="button"
                                    disabled={!isInteractive}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        if (isInteractive) void onToggleReview(item.id, step);
                                    }}
                                    className={cn(
                                        'h-5 w-5 rounded border text-[10px] font-bold transition-colors',
                                        checked
                                            ? 'text-[#563526] cursor-pointer hover:opacity-80'
                                            : isNext
                                                ? 'bg-white text-[#563526] hover:opacity-90 cursor-pointer'
                                                : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                                    )}
                                    style={
                                        checked || isNext
                                            ? {
                                                backgroundColor: checked ? T.primary : undefined,
                                                borderColor: T.primaryBorder,
                                            }
                                            : undefined
                                    }
                                    aria-label={
                                        checked
                                            ? `Uncheck review round ${step}`
                                            : `Check review round ${step}`
                                    }
                                >
                                    {checked ? '✓' : step}
                                </button>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            key: 'nextReview',
            header: 'Next Review',
            render: (item: VocabularyEntry) => {
                const review = getVocabularyReview(item);
                return formatNextReviewLabel(
                    review?.review_count ?? 0,
                    review?.next_review_date ?? null
                );
            },
        },
        {
            key: 'remarks',
            header: 'Remarks',
            render: (item: VocabularyEntry) => (
                <InlineEditableCell
                    value={getVocabularyTranslation(item)?.remarks || ''}
                    placeholder="Add remarks"
                    onSave={async (remarks) => {
                        await onUpdate(item.id, { remarks });
                    }}
                />
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item: VocabularyEntry) => (
                <div className="flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="rounded-lg p-2 hover:bg-[#E8E6F4]"
                        style={{ color: T.accentStrong }}
                        aria-label="Edit vocabulary"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        aria-label="Delete vocabulary"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Card className="border-none shadow-sm bg-white/90">
                <CardHeader className="space-y-4">
                    <CardTitle className="flex items-center gap-2 text-[#563526]">
                        <Filter className="h-5 w-5" style={{ color: T.accentStrong }} />
                        Review Dashboard
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                        {([
                            ['all', 'All'],
                            ['due_today', 'Due Today'],
                            ['mastered', 'Mastered'],
                        ] as const).map(([value, label]) => (
                            <Button
                                key={value}
                                type="button"
                                variant={filter === value ? 'secondary' : 'outline'}
                                className={filter === value ? 'text-[#563526] hover:opacity-90' : ''}
                                style={
                                    filter === value
                                        ? { backgroundColor: T.primary, borderColor: T.primaryBorder }
                                        : undefined
                                }
                                onClick={() => onFilterChange(value)}
                            >
                                {label}
                            </Button>
                        ))}
                        <Button
                            type="button"
                            variant={filter === 'favorite' ? 'secondary' : 'outline'}
                            className="hover:opacity-90"
                            style={
                                filter === 'favorite'
                                    ? {
                                        backgroundColor: '#FFFFFF',
                                        borderColor: T.favoriteBorder,
                                        color: T.favorite,
                                    }
                                    : { color: T.favoriteMuted, borderColor: '#E5E7EB' }
                            }
                            onClick={() => onFilterChange('favorite')}
                            aria-label="Favorites"
                            title="Favorites"
                        >
                            <Heart className="h-4 w-4" />
                        </Button>
                        <Select
                            value={categoryId}
                            onChange={onCategoryChange}
                            options={[
                                { value: '', label: 'All categories' },
                                ...categories.map((category) => ({
                                    value: category.category_id,
                                    label: category.name,
                                })),
                            ]}
                            className="min-w-[180px]"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table
                        data={entries}
                        columns={columns.map((column) =>
                            column.key === 'no'
                                ? {
                                    ...column,
                                    render: (item: VocabularyEntry) => {
                                        const index = entries.findIndex((entry) => entry.id === item.id);
                                        return index + 1;
                                    },
                                }
                                : column
                        )}
                        keyExtractor={(item) => item.id}
                        isLoading={loading}
                        emptyMessage="No vocabulary found for this filter"
                    />
                </CardContent>
            </Card>

            <Modal
                isOpen={!!editEntry}
                onClose={() => setEditEntry(null)}
                title="Edit Vocabulary"
            >
                <div className="space-y-4">
                    <Input
                        label="Category"
                        value={editForm.categoryName}
                        onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, categoryName: event.target.value }))
                        }
                    />
                    <Select
                        label="Language"
                        value={editForm.languageCode}
                        onChange={(value) =>
                            setEditForm((prev) => ({ ...prev, languageCode: value }))
                        }
                        options={VOCABULARY_LANGUAGE_OPTIONS.map((option) => ({
                            value: option.value,
                            label: option.label,
                        }))}
                    />
                    <Input
                        label="Vocab"
                        value={editForm.word}
                        onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, word: event.target.value }))
                        }
                    />
                    <Input
                        label="Pronunciation"
                        value={editForm.pronunciation}
                        onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, pronunciation: event.target.value }))
                        }
                    />
                    <Input
                        label="Meaning"
                        value={editForm.meaning}
                        onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, meaning: event.target.value }))
                        }
                    />
                    <textarea
                        value={editForm.remarks}
                        onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, remarks: event.target.value }))
                        }
                        className="min-h-[96px] w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2"
                        style={{ ['--tw-ring-color' as string]: T.primary }}
                        placeholder="Remarks"
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditEntry(null)}>
                            Cancel
                        </Button>
                        <Button
                            className="text-[#563526] hover:opacity-90"
                            style={{ backgroundColor: T.primary, borderColor: T.primaryBorder, borderWidth: 1 }}
                            onClick={() => void handleSaveEdit()}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete Vocabulary"
            >
                <p className="mb-6 text-sm text-muted-foreground">
                    Delete "{getVocabularyTranslation(deleteTarget || { vocabulary_translations: null })?.word || 'this word'}"?
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => void handleDelete()}>
                        Delete
                    </Button>
                </div>
            </Modal>
        </>
    );
}
