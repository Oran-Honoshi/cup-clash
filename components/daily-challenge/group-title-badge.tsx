"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import type { GroupTitle } from "@/lib/services/group-titles";

// Small pill for "The Oracle" / "The Inverter" — the same live-computed
// Group Titles wherever a member's name appears (Leaderboard row, podium,
// Player Drawer). Each mount does its own fetch of the group's current
// holders and checks itself against `userId`; titles are cheap to compute
// (see lib/services/group-titles.ts) and this keeps parent components from
// having to thread title data through props just to render a badge.

export const TITLE_EMOJI: Record<GroupTitle, string> = { oracle: "🔮", inverter: "🔄" };

// Fetches the whole group's current title holders once and returns a
// userId → title lookup — callers that render many rows (a leaderboard
// list) do one fetch and a plain object lookup per row, rather than one
// hook call (and one request) per row, which would violate the rules of
// hooks inside a .map().
export function useGroupTitles(groupId: string | undefined): Record<string, GroupTitle> {
  const [byUser, setByUser] = useState<Record<string, GroupTitle>>({});

  useEffect(() => {
    if (!groupId) { setByUser({}); return; }
    let cancelled = false;
    fetch(`/api/groups/${groupId}/titles`)
      .then(r => r.json())
      .then((data: { titles: { title: GroupTitle; userId: string }[] }) => {
        if (cancelled) return;
        const map: Record<string, GroupTitle> = {};
        for (const t of data.titles ?? []) map[t.userId] = t.title;
        setByUser(map);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [groupId]);

  return byUser;
}

export function GroupTitleBadge({ title }: { title: GroupTitle | null }) {
  const { t } = useLocale();
  if (!title) return null;
  return (
    <span
      className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0 inline-flex items-center gap-1"
      style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}
      title={t(title === "oracle" ? "dc_title_oracle" : "dc_title_inverter")}
    >
      <span aria-hidden>{TITLE_EMOJI[title]}</span>
      {t(title === "oracle" ? "dc_title_oracle" : "dc_title_inverter")}
    </span>
  );
}
