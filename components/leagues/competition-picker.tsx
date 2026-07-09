import Link from "next/link";
import { Trophy } from "lucide-react";
import type { CompetitionRow } from "@/lib/services/competitions";
import { WORLD_CUP_SLUG } from "@/lib/services/competitions";
import { FollowButton } from "@/components/leagues/follow-button";

interface CompetitionPickerProps {
  competitions: CompetitionRow[];
  activeSlug: string;
  basePath: string;
  userId: string | null;
  followedCompetitionIds: Set<string>;
  variant?: "chips" | "cards";
}

export function CompetitionPicker({
  competitions, activeSlug, basePath, userId, followedCompetitionIds, variant = "chips",
}: CompetitionPickerProps) {
  if (variant === "cards") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {competitions.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 p-4"
            style={{ background: "var(--sf)", border: "1px solid var(--br)", borderRadius: "var(--hr)" }}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center shrink-0 rounded-xl"
                style={{ width: 40, height: 40, background: "var(--ip)", color: "var(--ac)" }}>
                <Trophy size={18} />
              </div>
              <div className="min-w-0">
                <div className="font-bold truncate" style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--tx)" }}>
                  {c.name}
                </div>
                <div className="uppercase tracking-widest" style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700, color: "var(--mt)" }}>
                  {c.slug === WORLD_CUP_SLUG ? "Tournament" : c.type}
                </div>
              </div>
            </div>
            <FollowButton
              type="competition"
              id={c.id}
              userId={userId}
              initialFollowing={followedCompetitionIds.has(c.id)}
              compact
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {competitions.map((c) => {
        const active = c.slug === activeSlug;
        return (
          <Link
            key={c.id}
            href={`${basePath}?competition=${c.slug}`}
            className="inline-flex items-center gap-1.5 transition-all"
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              fontWeight: 700,
              padding: "8px 14px",
              borderRadius: 100,
              background: active ? "var(--ac)" : "var(--sf)",
              color: active ? "var(--at)" : "var(--t2)",
              border: active ? "1px solid var(--ac)" : "1px solid var(--br)",
              textDecoration: "none",
            }}
          >
            {c.name}
          </Link>
        );
      })}
    </div>
  );
}
