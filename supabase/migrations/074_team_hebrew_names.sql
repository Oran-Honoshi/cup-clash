-- ============================================================
-- Migration 074 — Hebrew team name aliases for Ligat Ha'al clubs.
--
-- Fixes a total tagging blackout for One (Hebrew), a Hebrew-language
-- news source: lib/services/news.ts's tag() substring-matches article
-- text against teams.name only, which is always the English/Latin
-- name. Hebrew-script articles can never contain that string, so
-- 1,545 One articles ingested over the last 30 days had zero team
-- tags — not just Maccabi Tel Aviv, every Israeli club.
--
-- Purely additive: new nullable column, only populated for the 14
-- current Ligat Ha'al clubs (the ones with real Hebrew news coverage
-- via One/Walla/Ynet). Not backfilled for the ~35 other Israeli teams
-- in the table (lower-division clubs pulled in incidentally via
-- fixture data) — no Hebrew source coverage for those, so no value
-- yet in aliasing them.
-- ============================================================

alter table public.teams
  add column if not exists hebrew_name text;

update public.teams set hebrew_name = v.hebrew_name
from (values
  ('Beitar Jerusalem',      'בית"ר ירושלים'),
  ('Bnei Sakhnin',          'בני סכנין'),
  ('Hapoel Beer Sheva',     'הפועל באר שבע'),
  ('Hapoel Haifa',          'הפועל חיפה'),
  ('Hapoel Katamon',        'הפועל קטמון ירושלים'),
  ('Hapoel Petah Tikva',    'הפועל פתח תקווה'),
  ('Hapoel Ramat Gan',      'הפועל רמת גן'),
  ('Hapoel Tel Aviv',       'הפועל תל אביב'),
  ('Ironi Kiryat Shmona',   'עירוני קריית שמונה'),
  ('Ironi Tiberias',        'עירוני טבריה'),
  ('Maccabi Haifa',         'מכבי חיפה'),
  ('Maccabi Netanya',       'מכבי נתניה'),
  ('Maccabi Petah Tikva',   'מכבי פתח תקווה'),
  ('Maccabi Tel Aviv',      'מכבי תל אביב')
) as v(name, hebrew_name)
where public.teams.name = v.name;
