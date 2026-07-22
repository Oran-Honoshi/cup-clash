export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { XCircle, Swords } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getInviteByToken, acceptMatchDuelInvite } from "@/lib/services/match-duels";
import { formatMatchDuelDate } from "@/lib/formatMatchDuelDate";
import { Logo } from "@/components/logo";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { FlagBadge } from "@/components/ui/FlagBadge";
import { MatchDuelAuthButtons } from "@/components/game/match-duel-auth-buttons";
import { MatchDuelAcceptButton } from "@/components/game/match-duel-accept-button";
import { serverT } from "@/lib/server-locale";

const surface = { background: "var(--sf)", border: "1px solid var(--br)", borderRadius: 22 } as const;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-safe-top" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm space-y-5">
        <Logo size="lg" className="justify-center" />
        {children}
      </div>
    </div>
  );
}

// Public landing page for Match Duel invite links — reads the pending row
// by opaque token via service role before the visitor is identified, same
// convention as /join/[code]'s findGroup(). Standalone/no-app-shell like
// /join, since a Match Duel invite may reach someone with no account yet.
export default async function DuelInvitePage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { duel?: string };
}) {
  const invite = await getInviteByToken(params.token);

  if (!invite) {
    return (
      <Shell>
        <div className="p-8 text-center space-y-4" style={surface}>
          <XCircle size={40} className="mx-auto" style={{ color: "#f87171" }} />
          <h1 className="font-display text-2xl uppercase font-black" style={{ color: "var(--tx)" }}>
            {serverT("match_duel_invalid_title")}
          </h1>
          <p className="text-sm" style={{ color: "var(--t2)" }}>{serverT("match_duel_invalid_body")}</p>
        </div>
      </Shell>
    );
  }

  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (user && user.id === invite.challenger.id) {
    return (
      <Shell>
        <div className="p-8 text-center space-y-4" style={surface}>
          <Swords size={32} className="mx-auto" style={{ color: "var(--ac)" }} />
          <p className="text-sm" style={{ color: "var(--t2)" }}>{serverT("match_duel_own_invite")}</p>
          <Link href="/game" className="text-sm font-bold" style={{ color: "var(--ac)" }}>
            {serverT("match_duel_back_to_game")}
          </Link>
        </div>
      </Shell>
    );
  }

  // Auto-accept: the visitor round-tripped through signup specifically to
  // accept this invite (see buildMatchDuelAuthWallUrl — same `duel` param
  // parseMatchDuelParam reads elsewhere, checked directly here since this
  // server component already has searchParams as a plain object).
  if (user && invite.claimable && searchParams.duel === params.token) {
    const result = await acceptMatchDuelInvite(user.id, params.token);
    if (result.ok) redirect("/game");
  }

  return (
    <Shell>
      <div className="p-6 space-y-5" style={surface}>
        <div className="text-center space-y-3">
          <UserAvatar name={invite.challenger.name} avatarUrl={invite.challenger.avatarUrl} size="md" />
          <div>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--t2)" }}>
              {serverT("match_duel_invited_by")}
            </div>
            <h1 className="font-display text-2xl uppercase font-black" style={{ color: "var(--tx)" }}>
              {invite.challenger.name}
            </h1>
          </div>
        </div>

        <div className="p-4 rounded-xl space-y-2" style={{ background: "var(--ip)" }}>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {invite.match.homeFlagCode && <FlagBadge code={invite.match.homeFlagCode} label={invite.match.home} size="sm" />}
            <span className="text-sm font-bold" style={{ color: "var(--tx)" }}>{invite.match.home} vs {invite.match.away}</span>
            {invite.match.awayFlagCode && <FlagBadge code={invite.match.awayFlagCode} label={invite.match.away} size="sm" />}
          </div>
          <div className="text-center text-xs" style={{ color: "var(--mt)" }}>{formatMatchDuelDate(invite.match.kickoffAt)}</div>
        </div>

        {!invite.claimable ? (
          <p className="text-sm text-center" style={{ color: "var(--t2)" }}>{serverT("match_duel_already_claimed")}</p>
        ) : user ? (
          <MatchDuelAcceptButton token={params.token} />
        ) : (
          <MatchDuelAuthButtons token={params.token} />
        )}

        <p className="text-center text-xs" style={{ color: "var(--mt)" }}>{serverT("match_duel_lock_note")}</p>
      </div>
    </Shell>
  );
}
