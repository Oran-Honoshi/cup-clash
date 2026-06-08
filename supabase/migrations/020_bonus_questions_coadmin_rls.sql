-- Allow co-admins (role='admin'/'owner' in group_members) to manage bonus questions
DROP POLICY IF EXISTS "Admin can manage bonus questions" ON bonus_questions;

CREATE POLICY "Admin can manage bonus questions"
ON bonus_questions FOR ALL
USING (
  auth.uid() = (SELECT admin_id FROM groups WHERE id = group_id)
  OR EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = bonus_questions.group_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'owner')
  )
)
WITH CHECK (
  auth.uid() = (SELECT admin_id FROM groups WHERE id = group_id)
  OR EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = bonus_questions.group_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'owner')
  )
);

-- Allow co-admins to manage match overrides
DROP POLICY IF EXISTS "Admin can manage their group overrides" ON match_overrides;

CREATE POLICY "Admin can manage their group overrides"
ON match_overrides FOR ALL
USING (
  auth.uid() = (SELECT admin_id FROM groups WHERE id = group_id)
  OR EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = match_overrides.group_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'owner')
  )
)
WITH CHECK (
  auth.uid() = (SELECT admin_id FROM groups WHERE id = group_id)
  OR EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = match_overrides.group_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'owner')
  )
);
