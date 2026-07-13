-- ============================================================
-- Migration 052 — Result reactions in Group Chat
-- ============================================================
-- Exact-score "moments" are posted as chat_messages rows with
-- type='moment' (alongside the existing 'text' | 'gif' | 'system'),
-- using the same service-role/user_id=null insert path as the Daily
-- Challenge system-message nudge (migration 049). This migration only
-- adds the reaction layer on top — a limited emoji picker any group
-- member can use on any message.
--
-- group_id is denormalized onto message_reactions (derivable via
-- message_id -> chat_messages.group_id) purely so the client can filter
-- a realtime subscription with a simple `group_id=eq.<id>` predicate,
-- the same trick chat_messages itself relies on; the insert policy below
-- cross-checks it against the referenced message so it can never drift.

create table if not exists public.message_reactions (
  id         uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  group_id   uuid not null references public.groups(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  emoji      text not null check (emoji in ('🔥', '⚽', '😂', '👏')),
  created_at timestamptz not null default now(),
  unique (message_id, user_id, emoji)
);

create index if not exists message_reactions_message_id_idx on public.message_reactions (message_id);
create index if not exists message_reactions_group_id_idx   on public.message_reactions (group_id);

comment on column public.chat_messages.type is
  'One of "text" | "gif" | "system" | "moment". A "system" message has user_id = null and is rendered without an avatar/author (e.g. daily-challenge completion nudges). A "moment" message also has user_id = null and marks a shareable highlight (e.g. an exact-score prediction) that group members can react to via message_reactions.';

alter table public.message_reactions enable row level security;

create policy "Group members can read reactions"
  on public.message_reactions for select
  using (
    exists (
      select 1 from public.group_members
      where group_id = message_reactions.group_id
        and user_id = auth.uid()
    )
  );

create policy "Group members can react"
  on public.message_reactions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.group_members
      where group_id = message_reactions.group_id
        and user_id = auth.uid()
    )
    and exists (
      select 1 from public.chat_messages
      where id = message_reactions.message_id
        and group_id = message_reactions.group_id
    )
  );

create policy "Users remove their own reaction"
  on public.message_reactions for delete
  using (auth.uid() = user_id);

alter publication supabase_realtime add table message_reactions;
