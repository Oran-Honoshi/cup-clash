import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { getCurrentUserProfile } from "@/lib/services/user-group";

export const metadata: Metadata = {
  title: "Leagues & Competitions — Cup Clash",
  description: "Follow World Cup 2026, Premier League, La Liga, Serie A, Bundesliga, Ligue 1 and the UEFA Champions League for news and scores.",
};

export default async function LeaguesLayout({ children }: { children: React.ReactNode }) {
  const userProfile = await getCurrentUserProfile();
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <PublicHeader
        active="/leagues"
        user={userProfile ? { name: userProfile.name, avatarUrl: userProfile.avatarUrl } : null}
      />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
