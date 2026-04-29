"use client";

import { useRef } from "react";
import { Trophy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/ui/member-avatar";
import type { Member } from "@/lib/types";
import type { Group } from "@/lib/types";

interface WinnerPosterProps {
  group: Group;
  members: Member[];
}

export function WinnerPoster({ group, members }: WinnerPosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const sorted = [...members].sort((a, b) => b.points - a.points);
  const winner = sorted[0];

  const downloadPoster = async () => {
    if (!posterRef.current) return;

    // Use html2canvas if available, otherwise guide user
    try {
      const pkg = "html2canvas";
      const mod = await import(pkg as string) as { default: (el: HTMLElement, opts?: object) => Promise<HTMLCanvasElement> };
      const canvas = await mod.default(posterRef.current, { backgroundColor: "#0A0A0A", scale: 2 });

      // Download as PNG
      const link = document.createElement("a");
      link.download = `cupclash-winners-${group.name.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // html2canvas not installed — show instructions
      alert("To download the poster, install html2canvas:\nnpm install html2canvas\n\nOr take a screenshot of the poster below.");
    }
  };

  if (!winner) return null;

  const RANK_MEDALS = ["🥇", "🥈", "🥉"];
  const RANK_COLORS = ["#D4AF37", "#C0C0C0", "#CD7F32"];

  return (
    <div className="space-y-4">
      {/* Poster preview */}
      <div
        ref={posterRef}
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #0A0A0A 0%, #0F172A 50%, #0A0A0A 100%)",
          border: "2px solid rgba(212,175,55,0.3)",
          fontFamily: "Arial, sans-serif",
          minHeight: 400,
        }}
      >
        {/* Gold top bar */}
        <div style={{ height: 4, background: "linear-gradient(90deg, #2A398D, #D4AF37, #E61D25)" }} />

        <div className="flex" style={{ padding: 32 }}>
          {/* Left: Winner */}
          <div className="flex flex-col items-center justify-center text-center"
            style={{ minWidth: 200, paddingRight: 32, borderRight: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
            <MemberAvatar name={winner.name} avatarUrl={winner.avatarUrl} size="xl" ring />
            <div style={{ color: "#D4AF37", fontWeight: 900, fontSize: 22, marginTop: 12, textTransform: "uppercase" }}>
              {winner.name}
            </div>
            <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 4 }}>{winner.country}</div>
            <div style={{ color: "#D4AF37", fontWeight: 900, fontSize: 36, marginTop: 8 }}>
              {winner.points}
              <span style={{ color: "#64748B", fontSize: 16, fontWeight: 400 }}> pts</span>
            </div>
            <div style={{ color: "#D4AF37", fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginTop: 4 }}>
              Champion
            </div>
          </div>

          {/* Right: Leaderboard */}
          <div style={{ flex: 1, paddingLeft: 32 }}>
            {/* Logo */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ color: "#fff", fontWeight: 900, fontSize: 20, textTransform: "uppercase", letterSpacing: 2 }}>
                  CUP CLASH
                </div>
                <div style={{ color: "#64748B", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                  World Cup 2026
                </div>
              </div>
              <div style={{ color: "#64748B", fontSize: 11, textAlign: "right" }}>
                {group.name}<br />Final Standings
              </div>
            </div>

            {/* Rankings */}
            {sorted.slice(0, 8).map((m, i) => (
              <div key={m.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 0",
                borderBottom: i < sorted.slice(0, 8).length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <span style={{ color: RANK_COLORS[i] ?? "#64748B", fontWeight: 900, fontSize: 16, width: 28 }}>
                  {i < 3 ? RANK_MEDALS[i] : `${i + 1}`}
                </span>
                <span style={{ color: "#E2E8F0", fontWeight: 700, fontSize: 14, flex: 1 }}>{m.name}</span>
                <span style={{ color: "#94A3B8", fontSize: 12 }}>{m.country}</span>
                <span style={{ color: i === 0 ? "#D4AF37" : "#E2E8F0", fontWeight: 900, fontSize: 16, minWidth: 50, textAlign: "right" }}>
                  {m.points}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ padding: "12px 32px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#475569", fontSize: 11 }}>cupclash.com</div>
          <div style={{ color: "#475569", fontSize: 11 }}>FIFA World Cup 2026</div>
        </div>
      </div>

      {/* Download buttons */}
      <div className="flex gap-3">
        <Button onClick={downloadPoster} size="sm" leftIcon={<Download size={14} />} className="flex-1">
          Download PNG
        </Button>
        <a href={`/api/export/csv?groupId=${group.id}`} download>
          <Button variant="outline" size="sm" leftIcon={<Download size={14} />}>
            Export CSV
          </Button>
        </a>
      </div>

      <p className="text-[11px] text-pitch-500 text-center">
        Print the poster and hang it up — or send it to the group chat!
      </p>
    </div>
  );
}
