-- Remove orphaned predictions for deleted groups before adding FK
DELETE FROM group_predictions
WHERE group_id NOT IN (SELECT id FROM groups);

ALTER TABLE group_predictions
  ADD CONSTRAINT group_predictions_group_id_fkey
  FOREIGN KEY (group_id) REFERENCES groups(id)
  ON DELETE CASCADE;
