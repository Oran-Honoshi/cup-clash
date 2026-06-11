-- Deleted accounts archive table
CREATE TABLE IF NOT EXISTS deleted_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_user_id uuid NOT NULL,
  email text NOT NULL,
  name text,
  deleted_at timestamptz DEFAULT now(),
  deleted_by uuid,
  reason text,
  group_memberships jsonb,
  predictions jsonb,
  profile_data jsonb
);

ALTER TABLE deleted_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only service role can access deleted accounts"
  ON deleted_accounts FOR ALL
  USING (false);

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
