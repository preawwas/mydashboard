-- Migration to create Vocabulary Learning system tables
-- Run in Supabase SQL Editor (after notes_schema.sql if using shared updated_at trigger)

-- =============================================================================
-- 1. Vocabulary Categories
-- =============================================================================
CREATE TABLE IF NOT EXISTS vocabulary_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, name)
);

-- =============================================================================
-- 2. Vocabularies (1 row = 1 learning item)
-- =============================================================================
CREATE TABLE IF NOT EXISTS vocabularies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES vocabulary_categories(category_id) ON DELETE SET NULL,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    import_batch_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. Vocabulary Translations (1:1 with vocabularies)
-- =============================================================================
CREATE TABLE IF NOT EXISTS vocabulary_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocabulary_id UUID NOT NULL UNIQUE REFERENCES vocabularies(id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL,
    word VARCHAR(255) NOT NULL,
    pronunciation VARCHAR(255),
    meaning TEXT NOT NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 4. Vocabulary Reviews (5-round review tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS vocabulary_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocabulary_id UUID NOT NULL UNIQUE REFERENCES vocabularies(id) ON DELETE CASCADE,
    review_count SMALLINT NOT NULL DEFAULT 0 CHECK (review_count BETWEEN 0 AND 5),
    next_review_date DATE,
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 5. Indexes
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_vocab_user_category
    ON vocabularies (user_id, category_id);

CREATE INDEX IF NOT EXISTS idx_vocab_user_favorite
    ON vocabularies (user_id, is_favorite)
    WHERE is_favorite = TRUE;

CREATE INDEX IF NOT EXISTS idx_vocab_user_created
    ON vocabularies (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vocab_import_batch
    ON vocabularies (user_id, import_batch_id)
    WHERE import_batch_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_next_date
    ON vocabulary_reviews (next_review_date)
    WHERE next_review_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vocab_translations_language
    ON vocabulary_translations (language_code);

-- =============================================================================
-- 6. Row Level Security (RLS)
-- =============================================================================
ALTER TABLE vocabulary_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabularies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own vocabulary_categories"
    ON vocabulary_categories FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own vocabularies"
    ON vocabularies FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage translations of their vocabularies"
    ON vocabulary_translations FOR ALL USING (
        EXISTS (
            SELECT 1 FROM vocabularies v
            WHERE v.id = vocabulary_translations.vocabulary_id
            AND v.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage reviews of their vocabularies"
    ON vocabulary_reviews FOR ALL USING (
        EXISTS (
            SELECT 1 FROM vocabularies v
            WHERE v.id = vocabulary_reviews.vocabulary_id
            AND v.user_id = auth.uid()
        )
    );

-- =============================================================================
-- 7. updated_at triggers (reuses function from notes_schema.sql if present)
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vocabulary_categories_updated_at ON vocabulary_categories;
CREATE TRIGGER update_vocabulary_categories_updated_at
    BEFORE UPDATE ON vocabulary_categories
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_vocabularies_updated_at ON vocabularies;
CREATE TRIGGER update_vocabularies_updated_at
    BEFORE UPDATE ON vocabularies
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_vocabulary_translations_updated_at ON vocabulary_translations;
CREATE TRIGGER update_vocabulary_translations_updated_at
    BEFORE UPDATE ON vocabulary_translations
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_vocabulary_reviews_updated_at ON vocabulary_reviews;
CREATE TRIGGER update_vocabulary_reviews_updated_at
    BEFORE UPDATE ON vocabulary_reviews
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================================================
-- 8. Helper: advance review round + schedule next date
-- =============================================================================
CREATE OR REPLACE FUNCTION advance_vocabulary_review(p_vocabulary_id UUID)
RETURNS vocabulary_reviews AS $$
DECLARE
    result vocabulary_reviews;
BEGIN
    UPDATE vocabulary_reviews
    SET
        review_count = LEAST(review_count + 1, 5),
        last_reviewed_at = NOW(),
        next_review_date = CASE
            WHEN review_count + 1 >= 5 THEN NULL
            WHEN review_count + 1 = 1 THEN CURRENT_DATE + INTERVAL '1 day'
            WHEN review_count + 1 = 2 THEN CURRENT_DATE + INTERVAL '2 days'
            WHEN review_count + 1 = 3 THEN CURRENT_DATE + INTERVAL '4 days'
            WHEN review_count + 1 = 4 THEN CURRENT_DATE + INTERVAL '7 days'
            ELSE next_review_date
        END,
        updated_at = NOW()
    WHERE vocabulary_id = p_vocabulary_id
      AND review_count < 5
    RETURNING * INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 9. View: Review Dashboard (optional convenience for API)
-- =============================================================================
CREATE OR REPLACE VIEW vocabulary_review_dashboard AS
SELECT
    v.id AS vocabulary_id,
    v.user_id,
    v.category_id,
    c.name AS category_name,
    v.is_favorite,
    v.import_batch_id,
    t.language_code,
    t.word,
    t.pronunciation,
    t.meaning,
    t.remarks,
    r.review_count,
    r.next_review_date,
    r.last_reviewed_at,
    v.created_at,
    v.updated_at
FROM vocabularies v
JOIN vocabulary_translations t ON t.vocabulary_id = v.id
JOIN vocabulary_reviews r ON r.vocabulary_id = v.id
LEFT JOIN vocabulary_categories c ON c.category_id = v.category_id;
