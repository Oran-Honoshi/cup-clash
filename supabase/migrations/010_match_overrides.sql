-- match_id is text (matches.id uses text PKs like "g001", "qf-01")
CREATE TABLE IF NOT EXISTS match_overrides (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  match_id   text NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  home_score int  NOT NULL,
  away_score int  NOT NULL,
  admin_id   uuid NOT NULL REFERENCES profiles(id),
  note       text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(group_id, match_id)
);

ALTER TABLE match_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage their group overrides"
ON match_overrides
FOR ALL
USING (
  auth.uid() = admin_id AND
  auth.uid() = (SELECT admin_id FROM groups WHERE id = group_id)
);

CREATE POLICY "Members can read their group overrides"
ON match_overrides
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = match_overrides.group_id
    AND user_id = auth.uid()
  )
);
