-- ============================================================
-- Migration 038 — News articles dedupe index
-- Supports the fetcher's upsert-on-conflict(link_url) dedupe so
-- re-running the cron never creates duplicate rows.
-- ============================================================

create unique index if not exists news_articles_link_url_key
  on public.news_articles (link_url);
