ALTER TABLE groups
ADD COLUMN IF NOT EXISTS group_mode text NOT NULL
DEFAULT 'standard'
CHECK (group_mode IN ('standard', 'corporate', 'friendly'));

ALTER TABLE groups
ADD COLUMN IF NOT EXISTS winner_message text;
