-- ============================================================
-- Migration 041 — News source expansion (Phase 2, Step 5)
-- Purely additive. Feed URLs verified live/valid RSS 2.0 on 2026-07-09.
-- sport5.co.il intentionally excluded — no RSS/Atom feed exists (checked
-- ~20 common paths, homepage <link rel="alternate"> tags, robots.txt,
-- and the Wayback Machine — no hit anywhere).
-- ============================================================

insert into public.news_sources (name, rss_url)
select v.name, v.rss_url
from (values
  ('90min',                'https://www.90min.com/posts.rss'),
  ('Sports Mole Football', 'https://www.sportsmole.co.uk/football/rss.xml'),
  ('One (Hebrew)',         'https://www.one.co.il/rss')
) as v(name, rss_url)
where not exists (
  select 1 from public.news_sources n where n.name = v.name
);
