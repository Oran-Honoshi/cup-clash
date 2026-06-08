-- ============================================================
-- Bonus Questions: custom per-group prediction questions
-- ============================================================

CREATE TABLE IF NOT EXISTS bonus_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  question text NOT NULL,
  question_type text NOT NULL CHECK (
    question_type IN ('open_text', 'player_pick', 'team_pick')
  ),
  points_awarded int NOT NULL DEFAULT 10,
  correct_answer text,
  is_resolved boolean NOT NULL DEFAULT false,
  lock_at timestamptz,
  created_at timestamptz DEFAULT now(),
  display_order int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bonus_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES bonus_questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  answer text NOT NULL,
  points_earned int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, user_id)
);

ALTER TABLE bonus_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read group bonus questions"
ON bonus_questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = bonus_questions.group_id
    AND user_id = auth.uid()
  )
);
CREATE POLICY "Admin can manage bonus questions"
ON bonus_questions FOR ALL USING (
  auth.uid() = (SELECT admin_id FROM groups WHERE id = group_id)
);

ALTER TABLE bonus_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own answers"
ON bonus_answers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can read all answers"
ON bonus_answers FOR SELECT USING (
  auth.uid() = (SELECT admin_id FROM groups WHERE id = group_id)
);
