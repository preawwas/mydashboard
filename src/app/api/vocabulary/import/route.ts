import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/api-middleware';
import { AuthUser } from '@/types';
import {
    createImportBatchId,
    createVocabularyEntry,
} from '@/lib/vocabulary-service';

export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
    try {
        const supabase = createSupabaseAdminClient();
        const body = await request.json();
        const rows = body.rows as Array<{
            category?: string;
            categoryName?: string;
            language_code?: string;
            languageCode?: string;
            word?: string;
            pronunciation?: string;
            meaning?: string;
            remarks?: string;
        }>;

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No rows to import' },
                { status: 400 }
            );
        }

        const importBatchId = createImportBatchId();
        const createdIds: string[] = [];
        const errors: string[] = [];

        for (let index = 0; index < rows.length; index += 1) {
            const row = rows[index];
            const word = row.word?.trim();
            const meaning = row.meaning?.trim();

            if (!word || !meaning) {
                errors.push(`Row ${index + 1}: word and meaning are required`);
                continue;
            }

            try {
                const id = await createVocabularyEntry(supabase, user.id, {
                    categoryName: row.categoryName || row.category || 'General',
                    languageCode: row.languageCode || row.language_code || 'en',
                    word,
                    pronunciation: row.pronunciation,
                    meaning,
                    remarks: row.remarks,
                    importBatchId,
                });
                createdIds.push(id);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                errors.push(`Row ${index + 1}: ${message}`);
            }
        }

        const { data: importedRows, error } = await supabase
            .from('vocabularies')
            .select(`
                id,
                user_id,
                category_id,
                is_favorite,
                import_batch_id,
                created_at,
                updated_at,
                vocabulary_categories ( category_id, name ),
                vocabulary_translations (
                    id,
                    language_code,
                    word,
                    pronunciation,
                    meaning,
                    remarks
                ),
                vocabulary_reviews (
                    review_count,
                    next_review_date,
                    last_reviewed_at
                )
            `)
            .eq('user_id', user.id)
            .eq('import_batch_id', importBatchId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch imported vocabularies error:', error);
        }

        if (createdIds.length === 0) {
            return NextResponse.json(
                { success: false, error: errors[0] || 'Import failed', errors },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                importBatchId,
                createdCount: createdIds.length,
                rows: importedRows ?? [],
                errors,
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
});
