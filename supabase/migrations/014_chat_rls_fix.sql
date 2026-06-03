-- Drop the conflicting policies
DROP POLICY IF EXISTS "Paid members can send messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can send chat messages" ON chat_messages;

-- Add correct policy: only group members can send messages
CREATE POLICY "Group members can send messages"
ON chat_messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = chat_messages.group_id
    AND user_id = auth.uid()
    AND can_predict = true
  )
);

-- Make sure read policy exists
DROP POLICY IF EXISTS "Members can read group chat" ON chat_messages;
DROP POLICY IF EXISTS "Users can read group chat" ON chat_messages;
DROP POLICY IF EXISTS "Group members can read messages" ON chat_messages;
CREATE POLICY "Group members can read messages"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = chat_messages.group_id
    AND user_id = auth.uid()
  )
);

-- Enable Realtime on chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
