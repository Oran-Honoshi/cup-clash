-- Adds the House Rules vs Customizable axis to groups, independent of group_mode/payment_model.
-- Additive + backward-compatible: every existing group gets 'customizable' and is unaffected.
ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS rules_mode text
  NOT NULL DEFAULT 'customizable'
  CHECK (rules_mode IN ('house_rules', 'customizable'));
