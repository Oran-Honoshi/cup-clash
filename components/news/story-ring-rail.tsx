import Link from "next/link";
import type { CompetitionRow } from "@/lib/services/competitions";

// Instagram-style "story ring" rail — one avatar per competition, linking to
// the competition-filtered feed (`?competition=<id>`, already supported by
// app/news/page.tsx's existing team/competition filter). Purely a nav
// shortcut; no new filtering logic lives here.
export function StoryRingRail({
  competitions,
  activeCompetitionId,
}: {
  competitions: CompetitionRow[];
  activeCompetitionId?: string;
}) {
  if (competitions.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      <RingLink
        href="/news"
        label="All"
        active={!activeCompetitionId}
        content={<Newspaper />}
      />
      {competitions.map((c) => (
        <RingLink
          key={c.id}
          href={`/news?competition=${c.id}`}
          label={c.name}
          active={activeCompetitionId === c.id}
          content={
            c.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.logoUrl} alt="" className="w-full h-full object-contain rounded-full" />
            ) : (
              <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>
                {c.name.charAt(0)}
              </span>
            )
          }
        />
      ))}
    </div>
  );
}

function Newspaper() {
  return <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>#</span>;
}

function RingLink({
  href,
  label,
  active,
  content,
}: {
  href: string;
  label: string;
  active: boolean;
  content: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 shrink-0"
      style={{ width: 64, textDecoration: "none" }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
        style={{
          padding: 2,
          background: active
            ? "linear-gradient(135deg, var(--ac), color-mix(in srgb, var(--ac) 40%, #00FF88))"
            : "var(--br)",
        }}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
          style={{ background: "var(--sf)", color: "var(--ac)" }}
        >
          {content}
        </div>
      </div>
      <span
        className="truncate w-full text-center"
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 10,
          fontWeight: active ? 800 : 600,
          color: active ? "var(--tx)" : "var(--mt)",
        }}
      >
        {label}
      </span>
    </Link>
  );
}
