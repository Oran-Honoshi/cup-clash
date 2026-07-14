import { AdminPanel }          from "@/components/admin/admin-panel";
import { ScoringRulesEditor }  from "@/components/admin/scoring-rules-editor";
import { GroupRulesEditor }    from "@/components/admin/group-rules-editor";
import { GroupStagePrizeEditor } from "@/components/admin/group-stage-prize-editor";
import { PickOverridesPanel }  from "@/components/admin/pick-overrides-panel";
import { MatchOverridePanel }  from "@/components/admin/match-override-panel";
import { WelcomeEmailSender }  from "@/components/admin/welcome-email-sender";
import { WinnerPoster }        from "@/components/export/winner-poster";
import { SplitPotPanel }       from "@/components/admin/split-pot-panel";
import type { Group, Member } from "@/lib/types";
import Link from "next/link";

interface AdminGroupSectorProps {
  group:         Group;
  members:       Member[];
  isOwner:       boolean;
  currentUserId: string;
  adminName:     string;
  finalLocked:   boolean;
  groupId:       string;
}

// Re-parented, unmodified content of the old standalone /admin/[groupId]
// page — kept as one shared component so the standalone route and the
// Group Detail "Admin" sub-sector render byte-identical output, including
// this internal anchor-pill sub-nav.
export function AdminGroupSector({ group, members, isOwner, currentUserId, adminName, finalLocked, groupId }: AdminGroupSectorProps) {
  const SECTIONS = [
    { id: "members",       label: "Members"     },
    { id: "money",         label: "Money"       },
    { id: "scoring",       label: "Scoring"     },
    { id: "overrides",     label: "Overrides"   },
    { id: "communication", label: "Message"     },
    { id: "export",        label: "Export"      },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-32">
      <div>
        <Link href={`/groups/${groupId}`}
          className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1"
          style={{ color: "#0891B2" }}>
          ← {group.name}
        </Link>
        <div className="label-caps mb-1">{group.name}</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight" style={{ color: "white" }}>
          Admin Panel
        </h1>
      </div>

      {/* Sticky sub-nav — anchors to each section below */}
      <div
        className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 flex items-center gap-1.5 overflow-x-auto"
        style={{
          background: "rgba(6,4,15,0.85)",
          backdropFilter: "blur(16px) saturate(160%)",
          WebkitBackdropFilter: "blur(16px) saturate(160%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          scrollbarWidth: "none",
        }}
      >
        {SECTIONS.map(s => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
          >
            {s.label}
          </a>
        ))}
      </div>

      {/* Member management */}
      <div id="members" style={{ scrollMarginTop: 64 }}>
        <AdminPanel group={group} initialMembers={members} isOwner={isOwner} currentUserId={currentUserId} />
      </div>

      {/* Money: pot split, buy-in/prize split, group stage prize */}
      <div id="money" className="space-y-6" style={{ scrollMarginTop: 64 }}>
        {/* Split the Pot — only relevant once the Final has been played and there's a genuine tie */}
        <SplitPotPanel
          groupId={groupId}
          members={members}
          payouts={group.payouts}
          payoutSplits={group.payoutSplits}
          buyInAmount={group.buyInAmount}
          currencySymbol={group.currencySymbol}
          finalLocked={finalLocked}
        />

        {/* Group settings: buy-in, prize split */}
        <GroupRulesEditor
          groupId={group.id}
          buyInAmount={group.buyInAmount}
          memberCount={members.length}
        />

        {/* Group stage prize */}
        <GroupStagePrizeEditor
          groupId={group.id}
          isCashGroup={!group.corporatePrize}
          currencySymbol={group.currencySymbol}
        />
      </div>

      {/* Scoring rules */}
      <div id="scoring" style={{ scrollMarginTop: 64 }}>
        <ScoringRulesEditor groupId={group.id} />
      </div>

      {/* Overrides: match results, tournament picks */}
      <div id="overrides" className="space-y-6" style={{ scrollMarginTop: 64 }}>
        {/* Match score overrides */}
        <div>
          <div className="label-caps mb-3">Correct a Match Result</div>
          <div className="rounded-2xl p-5"
            style={{
              background: "rgba(18,14,38,0.32)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid rgba(251,191,36,0.15)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
              borderRadius: 28,
            }}>
            <MatchOverridePanel groupId={groupId} />
          </div>
        </div>

        {/* Tournament pick overrides */}
        <div>
          <div className="label-caps mb-3">Tournament Pick Overrides</div>
          <div className="rounded-2xl p-5"
            style={{
              background: "rgba(18,14,38,0.32)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
              borderRadius: 28,
            }}>
            <PickOverridesPanel groupId={groupId} adminId={currentUserId} />
          </div>
        </div>
      </div>

      {/* Email members */}
      <div id="communication" style={{ scrollMarginTop: 64 }}>
        <WelcomeEmailSender group={group} members={members} adminName={adminName} />
      </div>

      {/* Export */}
      <div id="export" style={{ scrollMarginTop: 64 }}>
        <div className="label-caps mb-3">Export & Download</div>
        <WinnerPoster group={group} members={members} />
      </div>
    </div>
  );
}
