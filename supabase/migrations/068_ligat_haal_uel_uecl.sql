-- ============================================================
-- Migration 068 — Expanded competition coverage: Ligat Ha'al,
-- UEFA Europa League, UEFA Europa Conference League.
--
-- Data-ingestion only. Purely additive seed rows following the exact
-- pattern from migration 037/065 — no schema change needed
-- (`competitions.type` check constraint already allows
-- 'league'/'cup'/'tournament'). `country` backfill is a separate
-- migration (see follow-up in the country-follow model work).
--
-- Verified live via API-Football on 2026-07-22: Ligat Ha'al (league id
-- 383) has 182 real fixtures including Hapoel Beer Sheva, Maccabi Tel
-- Aviv, Beitar Jerusalem, Maccabi Haifa. UEFA Europa League (id 3) and
-- UEFA Europa Conference League (id 848) are both mid-qualifying-rounds
-- for the 2026/27 season, with Maccabi Tel Aviv in UEL and Beitar
-- Jerusalem in UECL.
-- ============================================================

insert into public.competitions (name, type)
select v.name, v.type
from (values
  ('Ligat Ha''al',                    'league'),
  ('UEFA Europa League',              'cup'),
  ('UEFA Europa Conference League',   'cup')
) as v(name, type)
where not exists (
  select 1 from public.competitions c where c.name = v.name
);
