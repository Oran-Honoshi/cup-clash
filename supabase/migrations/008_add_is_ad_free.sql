-- Revenue model inversion: participation is free; $2 payment only removes ads.
-- is_ad_free=true means the member paid $2 to remove ads for the tournament.
-- Corporate groups grant ad-free via groups.is_corporate_paid (group-level flag).
alter table group_members
  add column if not exists is_ad_free boolean not null default false;
