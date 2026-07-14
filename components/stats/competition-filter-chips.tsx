import Link from "next/link";
import type { CompetitionRow } from "@/lib/services/competitions";

// New for the Statistician zone — a horizontal chip row filtering the
// standings table below via `?competition=<slug>`, in the same visual
// vocabulary as Newsroom's filter pill and Standings' CompetitionPicker.
export function CompetitionFilterChips({
  competitions,
  activeSlug,
}: {
  competitions: CompetitionRow[];
  activeSlug?: string;
}) {
  if (competitions.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {competitions.map((c) => {
        const isActive = c.slug === activeSlug;
        return (
          <Link
            key={c.id}
            href={`/stats?competition=${c.slug}`}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
            style={{
              background: isActive ? "var(--ac)" : "var(--ip)",
              color: isActive ? "#03110c" : "var(--t2)",
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
