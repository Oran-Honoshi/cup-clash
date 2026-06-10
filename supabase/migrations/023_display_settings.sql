ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS show_prize_split      boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_entry_fee        boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_prize_pot        boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_buy_in_tracker   boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_payment_link     boolean NOT NULL DEFAULT true;
