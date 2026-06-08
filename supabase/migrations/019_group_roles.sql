ALTER TABLE group_members
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member'
CHECK (role IN ('member', 'admin', 'owner'));

-- Set all current group creators as 'owner'
UPDATE group_members gm
SET role = 'owner'
FROM groups g
WHERE gm.user_id = g.admin_id
AND gm.group_id = g.id;
