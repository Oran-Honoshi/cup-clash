-- competitions.confederation has been null for every row since the column
-- was added in 037_news_multi_league_foundation.sql — nothing in the app
-- reads/filters on it (confirmed: only passthrough in lib/services/
-- competitions.ts and lib/services/reference-cache.ts, and an explicit
-- comment in components/leagues/competition-picker.tsx noting it's
-- unpopulated and falling back to country instead). Backfill real values
-- for every competition currently tracked.
--
-- World Cup 2026 and International Friendlies are FIFA-organized, not
-- confederation-scoped, so they deliberately stay null here — same
-- convention 069_country_follow_model.sql already established for
-- competitions.country on confederation-wide comps (UCL/UEL/UECL/
-- Libertadores/Sudamericana don't belong to one country; WC2026/
-- Friendlies don't belong to one confederation). Introducing a 'FIFA'
-- value would conflate the global governing body with an actual
-- confederation, which is what this column is documented to hold
-- (see the original "e.g. UEFA, CONMEBOL" comment on the column).

-- UEFA
update public.competitions set confederation = 'UEFA' where name = 'Premier League';
update public.competitions set confederation = 'UEFA' where name = 'La Liga';
update public.competitions set confederation = 'UEFA' where name = 'Serie A';
update public.competitions set confederation = 'UEFA' where name = 'Bundesliga';
update public.competitions set confederation = 'UEFA' where name = 'Ligue 1';
update public.competitions set confederation = 'UEFA' where name = 'FA Cup';
update public.competitions set confederation = 'UEFA' where name = 'Copa del Rey';
update public.competitions set confederation = 'UEFA' where name = 'Coppa Italia';
update public.competitions set confederation = 'UEFA' where name = 'DFB-Pokal';
update public.competitions set confederation = 'UEFA' where name = 'Coupe de France';
update public.competitions set confederation = 'UEFA' where name = 'League Cup';
update public.competitions set confederation = 'UEFA' where name = 'UEFA Champions League';
update public.competitions set confederation = 'UEFA' where name = 'UEFA Europa League';
update public.competitions set confederation = 'UEFA' where name = 'UEFA Europa Conference League';
update public.competitions set confederation = 'UEFA' where name = 'Ligat Ha''al';
update public.competitions set confederation = 'UEFA' where name = 'Israel State Cup';

-- CONMEBOL
update public.competitions set confederation = 'CONMEBOL' where name = 'Copa Libertadores';
update public.competitions set confederation = 'CONMEBOL' where name = 'Copa Sudamericana';
update public.competitions set confederation = 'CONMEBOL' where name = 'Brazil Serie A';
update public.competitions set confederation = 'CONMEBOL' where name = 'Copa do Brasil';

-- CONCACAF
update public.competitions set confederation = 'CONCACAF' where name = 'MLS';
update public.competitions set confederation = 'CONCACAF' where name = 'US Open Cup';

-- World Cup 2026 and International Friendlies intentionally left null.
