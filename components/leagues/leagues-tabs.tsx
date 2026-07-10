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
        background: "var(--nv, var(--sf))",
        borderRadius: 10,
        border: "1px solid var(--br)",
        overflow: "hidden",
        padding: 3,
        gap: 2,
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
              borderRadius: 7,
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              background: isActive ? "color-mix(in srgb, var(--ac) 15%, transparent)" : "transparent",
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
