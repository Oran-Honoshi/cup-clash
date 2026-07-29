-- ============================================================
-- Migration 075 — Additional verified Hebrew-language football RSS
-- sources, following up on the hebrew_name tagging fix (074).
--
-- All three URLs curl-verified live (HTTP 200, today's articles)
-- before insertion:
--   - Walla Sport: Israeli football category feed
--   - Walla Sport: World football category feed
--   - Ynet Sport: general sport feed
-- Sport5 and Israel Hayom were checked and rejected — no working
-- football-specific RSS available (Sport5 has none; Israel Hayom's
-- sport paths 403, only a noisy mixed-content general feed exists).
-- ============================================================

insert into public.news_sources (name, rss_url)
select v.name, v.rss_url
from (values
  ('Walla Sport - Israeli Football (Hebrew)', 'https://rss.walla.co.il/feed/156'),
  ('Walla Sport - World Football (Hebrew)',   'https://rss.walla.co.il/feed/316'),
  ('Ynet Sport (Hebrew)',                     'https://www.ynet.co.il/Integration/StoryRss3.xml')
) as v(name, rss_url)
where not exists (
  select 1 from public.news_sources n where n.name = v.name
);
