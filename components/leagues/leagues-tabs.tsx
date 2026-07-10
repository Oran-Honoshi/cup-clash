import Link from "next/link";

interface LeaguesTabsProps {
  active: "competitions" | "teams";
  basePath: string;
}

const TABS: Array<{ key: LeaguesTabsProps["active"]; label: string }> = [
  { key: "competitions", label: "Competitions" },
  { key: "teams", label: "Teams" },
];

export function LeaguesTabs({ active, basePath }: LeaguesTabsProps) {
  return (
    <div
      style={{
        gap: 8,
        display: "flex",
        maxWidth: 320,
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.key === "competitions" ? basePath : `${basePath}?tab=${tab.key}`}
            style={{
              flex: 1,
              padding: "7px 0",
              textAlign: "center",
              borderRadius: 10,
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              background: isActive ? "color-mix(in srgb, var(--ac) 15%, transparent)" : "var(--sf)",
              border: isActive ? "1px solid color-mix(in srgb, var(--ac) 35%, transparent)" : "1px solid var(--br)",
              boxShadow: isActive ? "0 2px 12px -1px color-mix(in srgb, var(--ac) 30%, transparent)" : "0 1px 6px -1px var(--shad)",
              color: isActive ? "var(--ac)" : "var(--mt)",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
