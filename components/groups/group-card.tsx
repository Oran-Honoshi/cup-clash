import Link from "next/link";
import { Users, ArrowRight, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ShareGroup } from "@/components/sharing/share-group";

interface GroupCardProps {
  id:             string;
  name:           string;
  passkey:        string;
  adminName:      string;
  memberCount:    number;
  buyInAmount:    number;    // real per-group buy-in, dollars — never a hardcoded value
  groupType:      string;    // "tournament" | "single_match"
  isAdmin:        boolean;
  isAdFree:       boolean;
  paymentLink:    string | null;
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 32%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}

export function GroupCard({
  id, name, passkey, adminName, memberCount, buyInAmount,
  groupType, isAdmin, isAdFree, paymentLink,
}: GroupCardProps) {
  const hasBuyIn   = buyInAmount > 0;
  const typeLabel  = groupType === "single_match" ? "Single Match" : "Full Tournament";

  return (
    <Card variant="glass" className="overflow-hidden" style={{ background: "var(--sf)", border: "1px solid var(--br)", boxShadow: "0 4px 24px var(--shad)" }}>
      <div className="h-1" style={{ background: "linear-gradient(90deg, transparent, var(--ac), transparent)" }} />

      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--dv)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {isAdmin && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
                  style={{ color: "var(--sc)", background: "color-mix(in srgb, var(--sc) 14%, transparent)", border: "1px solid color-mix(in srgb, var(--sc) 32%, transparent)" }}>
                  <ShieldCheck size={10} /> Admin
                </span>
              )}
            </div>
            <h2 className="font-display text-xl uppercase font-black truncate" style={{ color: "var(--tx)" }}>{name}</h2>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--ft)" }}>Passkey</div>
            <div className="font-mono font-black tracking-widest" style={{ fontSize: 22, color: "var(--ac)" }}>{passkey}</div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x" style={{ borderColor: "var(--dv)" }}>
        <div className="px-4 py-3 text-center">
          <Users size={15} className="mx-auto mb-1" style={{ color: "var(--ac)" }} />
          <div className="font-display text-lg font-black leading-tight" style={{ color: "var(--tx)" }}>{memberCount}</div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--ft)" }}>Members</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="font-display text-lg font-black leading-tight" style={{ color: hasBuyIn ? "var(--sc)" : "var(--tx)" }}>
            {hasBuyIn ? `$${buyInAmount}` : "Free"}
          </div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--ft)" }}>Entry</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="font-display text-lg font-black leading-tight" style={{ color: "var(--tx)" }}>
            {groupType === "single_match" ? "1 Match" : "2026 WC"}
          </div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--ft)" }}>{typeLabel}</div>
        </div>
      </div>

      {/* Entry-type badges */}
      <div className="px-4 py-3 flex items-center gap-2 flex-wrap border-t" style={{ borderColor: "var(--dv)" }}>
        {hasBuyIn ? (
          <Pill label={`Prize Pot $${buyInAmount}`} color="var(--sc)" />
        ) : (
          <Pill label="Free" color="var(--mt)" />
        )}
        {isAdFree && <Pill label="★ Ad-free" color="var(--ac)" />}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex gap-2 border-t" style={{ borderColor: "var(--dv)" }}>
        <Link href={`/groups/${id}`} className="flex-1">
          <button className="w-full py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
            style={{ background: "var(--ac)", color: "var(--at)" }}>
            View <ArrowRight size={14} />
          </button>
        </Link>
        <ShareGroup groupName={name} adminName={adminName} passkey={passkey} compact paymentLink={paymentLink} />
        {isAdmin && (
          <Link href={`/admin/${id}`}>
            <button className="px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider"
              style={{ background: "color-mix(in srgb, var(--ac) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--ac) 30%, transparent)", color: "var(--ac)" }}>
              Admin
            </button>
          </Link>
        )}
      </div>
    </Card>
  );
}
