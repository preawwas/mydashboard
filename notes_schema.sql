-- Migration to create Notes system tables

-- 1. Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE account_type_enum AS ENUM ('Standard', 'Premium');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE note_status_enum AS ENUM ('New', 'In Progress', 'Urgent', 'Done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reminder_type_enum AS ENUM ('Daily', 'Weekly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Note Categories table
CREATE TABLE IF NOT EXISTS note_categories (
    note_category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color_code VARCHAR(7), -- Hex color e.g., #FF5733
    icon VARCHAR(50), -- Icon name or emoji
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Notes table
CREATE TABLE IF NOT EXISTS notes (
    note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note_category_id UUID REFERENCES note_categories(note_category_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT, -- Supports Markdown or HTML
    status note_status_enum DEFAULT 'New',
    is_favorite BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Reminders table
CREATE TABLE IF NOT EXISTS reminders (
    reminder_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(note_id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reminder_type reminder_type_enum DEFAULT 'Daily',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(note_id) -- 1 Note has at most 1 Deadline as per requirements
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE note_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
-- Note Categories policies
CREATE POLICY "Users can manage their own note_categories" ON note_categories
    FOR ALL USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can manage their own notes" ON notes
    FOR ALL USING (auth.uid() = user_id);

-- Reminders policies (via notes ownership)
CREATE POLICY "Users can manage reminders for their notes" ON reminders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.note_id = reminders.note_id 
            AND notes.user_id = auth.uid()
        )
    );

-- 7. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_note_categories_updated_at BEFORE UPDATE ON note_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. Seed default Note Categories for all existing users
INSERT INTO note_categories (user_id, name, color_code, icon)
SELECT u.id, cat.name, cat.color_code, cat.icon
FROM auth.users u
CROSS JOIN (VALUES
    ('Work',                '#F97316', '💼'),
    ('Study',               '#3B82F6', '📚'),
    ('Personal',            '#EC4899', '👤'),
    ('Finance',             '#10B981', '💰'),
    ('Ideas/Brainstorm',    '#F59E0B', '💡'),
    ('Draft/Writing',       '#8B5CF6', '✍️'),
    ('Resources/Knowledge', '#06B6D4', '📖'),
    ('Archive/Reference',   '#64748B', '🗂️')
) AS cat(name, color_code, icon)
ON CONFLICT DO NOTHING;
