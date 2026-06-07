ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS currency       text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS currency_symbol text NOT NULL DEFAULT '$',
  ADD COLUMN IF NOT EXISTS payment_link   text;
