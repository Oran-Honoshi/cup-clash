import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";

export const metadata: Metadata = {
  title: "Football News — Cup Clash",
  description: "The latest football news from around the world, aggregated in one feed. World Cup 2026, Premier League, La Liga, Serie A, Bundesliga, Ligue 1 and Champions League headlines.",
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <PublicHeader active="/news" />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
