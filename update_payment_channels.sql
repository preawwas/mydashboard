
-- 1) Add is_system column to payment_channels
ALTER TABLE payment_channels ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;

-- 2) Create UNIQUE index for user's payment channels (allows duplicates for master data if user_id is NULL)
CREATE UNIQUE INDEX IF NOT EXISTS payment_channels_user_name_idx
  ON payment_channels(user_id, lower(name));

-- 3) Trigger to auto-update updated_at (if not already exists from previous scripts)
CREATE OR REPLACE FUNCTION trigger_set_updated_at_payment_channels()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_updated_at_on_payment_channels ON payment_channels;
CREATE TRIGGER set_updated_at_on_payment_channels
  BEFORE UPDATE ON payment_channels
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at_payment_channels();

-- 4) Update RLS Policies
-- Enable RLS
ALTER TABLE payment_channels ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them safely
DROP POLICY IF EXISTS "Users can manage their own payment channels" ON payment_channels;
DROP POLICY IF EXISTS payment_channels_select_policy ON payment_channels;
DROP POLICY IF EXISTS payment_channels_insert_policy ON payment_channels;
DROP POLICY IF EXISTS payment_channels_update_policy ON payment_channels;
DROP POLICY IF EXISTS payment_channels_delete_policy ON payment_channels;

-- SELECT: Allow reading own rows OR master rows (user_id IS NULL)
CREATE POLICY payment_channels_select_policy ON payment_channels
  FOR SELECT TO authenticated
  USING (user_id IS NULL OR user_id = (SELECT auth.uid()));

-- INSERT: Allow inserting only if user_id = auth.uid()
CREATE POLICY payment_channels_insert_policy ON payment_channels
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- UPDATE: Allow updating only own rows
CREATE POLICY payment_channels_update_policy ON payment_channels
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- DELETE: Allow deleting only own rows
CREATE POLICY payment_channels_delete_policy ON payment_channels
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));
