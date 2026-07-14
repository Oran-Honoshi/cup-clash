import Link from "next/link";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { Trophy } from "lucide-react";
import type { CompetitionRow } from "@/lib/services/competitions";
import { zoneFontVars } from "@/lib/fonts/zone-fonts";

interface CompetitionsChipRowProps {
  competitions: CompetitionRow[];
  followedIds: Set<string>;
}

export function CompetitionsChipRow({ competitions, followedIds }: CompetitionsChipRowProps) {
  if (competitions.length === 0) return null;

  return (
    <div className={zoneFontVars}>
      <div style={{ fontFamily: "var(--font-zone-body)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mt)", marginBottom: 8 }}>
        Competitions
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {competitions.map((c) => {
          const following = followedIds.has(c.id);
          return (
            <Link
              key={c.id}
              href={`/standings?competition=${c.slug}`}
              className="shrink-0 flex items-center gap-2 rounded-full"
              style={{
                padding: "8px 14px",
                background: following ? "color-mix(in srgb, var(--ac) 10%, var(--sf))" : "var(--sf)",
                border: following ? "1px solid color-mix(in srgb, var(--ac) 30%, transparent)" : "1px solid var(--br)",
                textDecoration: "none",
              }}
            >
              {c.logoUrl ? (
                <FlagBadge code={c.logoUrl} size="sm" label={c.name} />
              ) : (
                <Trophy size={14} style={{ color: "var(--mt)" }} />
              )}
              <span style={{ fontFamily: "var(--font-zone-body)", fontSize: 12, fontWeight: 700, color: "var(--tx)", whiteSpace: "nowrap" }}>
                {c.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
