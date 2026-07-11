-- ============================================================
-- Migration 046 — News source expansion (round 2)
-- Purely additive. Feed URLs verified live/valid RSS 2.0 on 2026-07-11
-- (current items with today's pubDate at verification time).
--
-- Requested but NOT added, with reasons:
--   ESPN (soccer/football)   — every espn.com/espnfc.com RSS path
--                              (incl. the redirect target) returns
--                              HTTP 202 with an empty body and an
--                              x-amzn-waf-action: challenge header —
--                              blocked by ESPN's bot-detection WAF,
--                              no content retrievable.
--   L'Équipe (France)        — no documented public RSS endpoint;
--                              lequipe.fr/rss.html and every guessed
--                              /rss/*.xml path 404. The only reachable
--                              feed (dwh.lequipe.fr/api/edito/rss, an
--                              undocumented internal API) mixes
--                              cycling/tennis/general news in with
--                              football and intermittently 503s on
--                              other path values — not a stable,
--                              football-dedicated public feed.
--   Gazzetta dello Sport     — gazzetta.it/rss/calcio.xml (and the
--   (Italy)                    other /rss/*.xml paths tried) return
--                              HTTP 200 but stale content: items dated
--                              Jan 2024 mixed with a single Mar 2026
--                              entry, unchanged across repeated
--                              fetches — the feed is not being kept
--                              current.
-- ============================================================

insert into public.news_sources (name, rss_url)
select v.name, v.rss_url
from (values
  ('Marca',  'https://www.marca.com/rss/futbol.xml'),
  ('Kicker', 'https://newsfeed.kicker.de/news/fussball')
) as v(name, rss_url)
where not exists (
  select 1 from public.news_sources n where n.name = v.name
);
