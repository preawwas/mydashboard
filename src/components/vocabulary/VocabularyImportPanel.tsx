'use client';

import React, { useMemo, useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Select,
    Table,
} from '@/components/ui';
import { Download, Upload, Plus, FileSpreadsheet } from 'lucide-react';
import {
    downloadCsvTemplate,
    getVocabularyReview,
    getVocabularyTranslation,
    parseVocabularyCsv,
    VOCABULARY_LANGUAGE_OPTIONS,
} from '@/lib/vocabulary-helpers';
import { VOCABULARY_THEME as T } from '@/lib/vocabulary-theme';
import { useToastStore } from '@/lib/store';
import { VocabularyCategory, VocabularyEntry, VocabularyFormData } from '@/types';
import VocabularyHoverWord from './VocabularyHoverWord';

interface VocabularyImportPanelProps {
    categories: VocabularyCategory[];
    recentEntries: VocabularyEntry[];
    saving: boolean;
    onCreate: (form: VocabularyFormData) => Promise<void>;
    onImportFile: (rows: ReturnType<typeof parseVocabularyCsv>) => Promise<void>;
}

const EMPTY_FORM: VocabularyFormData = {
    categoryName: '',
    languageCode: 'en',
    word: '',
    pronunciation: '',
    meaning: '',
    remarks: '',
};

export default function VocabularyImportPanel({
    categories,
    recentEntries,
    saving,
    onCreate,
    onImportFile,
}: VocabularyImportPanelProps) {
    const { addToast } = useToastStore();
    const [form, setForm] = useState<VocabularyFormData>(EMPTY_FORM);
    const [useNewCategory, setUseNewCategory] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const categoryOptions = useMemo(
        () => categories.map((category) => ({ value: category.name, label: category.name })),
        [categories]
    );

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!form.word.trim() || !form.meaning.trim()) {
            addToast('Word and meaning are required', 'error');
            return;
        }

        try {
            await onCreate({
                ...form,
                categoryName: form.categoryName.trim() || 'General',
            });
            setForm(EMPTY_FORM);
            addToast('Vocabulary added successfully', 'success');
        } catch (error) {
            addToast(error instanceof Error ? error.message : 'Failed to add vocabulary', 'error');
        }
    };

    const processFile = async (file: File) => {
        const isCsv = file.name.toLowerCase().endsWith('.csv');
        if (!isCsv) {
            addToast('Please upload a .csv file. XLSX can be exported to CSV first.', 'warning');
            return;
        }

        try {
            const text = await file.text();
            const rows = parseVocabularyCsv(text);
            if (rows.length === 0) {
                addToast('No valid rows found in file', 'error');
                return;
            }
            await onImportFile(rows);
            addToast(`Imported ${rows.length} vocabulary item(s)`, 'success');
        } catch (error) {
            addToast(error instanceof Error ? error.message : 'Import failed', 'error');
        }
    };

    const recentColumns = [
        {
            key: 'category',
            header: 'Category',
            render: (item: VocabularyEntry) =>
                item.vocabulary_categories?.name || 'General',
        },
        {
            key: 'language',
            header: 'Lang',
            render: (item: VocabularyEntry) => getVocabularyTranslation(item)?.language_code || '-',
        },
        {
            key: 'word',
            header: 'Vocab',
            render: (item: VocabularyEntry) => {
                const translation = getVocabularyTranslation(item);
                return (
                    <VocabularyHoverWord
                        word={translation?.word || ''}
                        languageCode={translation?.language_code}
                        pronunciation={translation?.pronunciation}
                        meaning={translation?.meaning}
                        showLanguageTag={false}
                    />
                );
            },
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
            key: 'review',
            header: 'Review',
            render: (item: VocabularyEntry) => {
                const review = getVocabularyReview(item);
                return `${review?.review_count ?? 0}/5`;
            },
        },
    ];

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white/90">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#563526]">
                        <FileSpreadsheet className="h-5 w-5" style={{ color: T.accentStrong }} />
                        File Import
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => downloadCsvTemplate()}
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download CSV Template
                        </Button>
                    </div>

                    <label
                        htmlFor="vocabulary-file-upload"
                        onDragOver={(event) => {
                            event.preventDefault();
                            setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(event) => {
                            event.preventDefault();
                            setDragActive(false);
                            const file = event.dataTransfer.files?.[0];
                            if (file) void processFile(file);
                        }}
                        className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                            dragActive
                                ? 'bg-[#E8E6F4]'
                                : 'border-[#D1D5DB] bg-[#FAFAFA]'
                        }`}
                        style={{
                            borderColor: dragActive ? T.primaryBorder : undefined,
                        }}
                        onMouseEnter={(e) => {
                            if (!dragActive) {
                                e.currentTarget.style.borderColor = T.primaryBorder;
                                e.currentTarget.style.backgroundColor = T.surface;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!dragActive) {
                                e.currentTarget.style.borderColor = '';
                                e.currentTarget.style.backgroundColor = '';
                            }
                        }}
                    >
                        <Upload className="mb-3 h-8 w-8" style={{ color: T.accentStrong }} />
                        <p className="text-sm font-semibold text-[#563526]">
                            Drop & Upload CSV File
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Columns: category, language_code, word, pronunciation, meaning, remarks
                        </p>
                        <input
                            id="vocabulary-file-upload"
                            type="file"
                            accept=".csv,text/csv"
                            className="hidden"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) void processFile(file);
                                event.target.value = '';
                            }}
                        />
                    </label>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white/90">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#563526]">
                        <Plus className="h-5 w-5" style={{ color: T.accentStrong }} />
                        Manual Entry
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#563526]">Category</label>
                            <div className="flex gap-2">
                                {!useNewCategory ? (
                                    <Select
                                        value={form.categoryName}
                                        onChange={(value) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                categoryName: value,
                                            }))
                                        }
                                        options={[
                                            { value: '', label: 'Select category' },
                                            ...categoryOptions,
                                        ]}
                                        className="flex-1"
                                    />
                                ) : (
                                    <Input
                                        value={form.categoryName}
                                        onChange={(event) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                categoryName: event.target.value,
                                            }))
                                        }
                                        placeholder="New category name"
                                        className="flex-1"
                                    />
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setUseNewCategory((prev) => !prev)}
                                >
                                    {useNewCategory ? 'Existing' : 'New'}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#563526]">Language</label>
                            <Select
                                value={form.languageCode}
                                onChange={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        languageCode: value,
                                    }))
                                }
                                options={VOCABULARY_LANGUAGE_OPTIONS.map((option) => ({
                                    value: option.value,
                                    label: option.label,
                                }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#563526]">Vocab</label>
                            <Input
                                value={form.word}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, word: event.target.value }))
                                }
                                placeholder="Word or phrase"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#563526]">Pronunciation</label>
                            <Input
                                value={form.pronunciation}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        pronunciation: event.target.value,
                                    }))
                                }
                                placeholder="Your reading / romaji / pinyin"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-[#563526]">Meaning</label>
                            <Input
                                value={form.meaning}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, meaning: event.target.value }))
                                }
                                placeholder="Translation or definition"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-[#563526]">Remarks</label>
                            <textarea
                                value={form.remarks}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, remarks: event.target.value }))
                                }
                                placeholder="Memory notes or example sentence"
                                className="min-h-[96px] w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#B9B4D8]"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="gap-2 text-[#563526] hover:opacity-90"
                                style={{ backgroundColor: T.primary, borderColor: T.primaryBorder, borderWidth: 1 }}
                            >
                                <Plus className="h-4 w-4" />
                                {saving ? 'Saving...' : 'Add Vocabulary'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white/90">
                <CardHeader>
                    <CardTitle className="text-[#563526]">Recent Imports</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table
                        data={recentEntries}
                        columns={recentColumns}
                        keyExtractor={(item) => item.id}
                        emptyMessage="No vocabulary added yet"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
