"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Users } from "lucide-react";
import { FOCUS_RING, FOCUS_RING_INSET } from "@/lib/a11y";
import { saveSelectedGroup } from "@/lib/group-storage";

type HoverMap = Record<string, boolean>;

interface DashboardGroupPickerProps {
  groups:        Array<{ id: string; name: string; passkey: string }>;
  activeGroupId: string;
  basePath?:     string; // e.g. "/dashboard" or "/leaderboard" or "/predictions"
}

export function DashboardGroupPicker({
  groups,
  activeGroupId,
  basePath = "/dashboard",
}: DashboardGroupPickerProps) {
  const [open, setOpen] = useState(false);

  // Escape closes the dropdown when it's open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const [hovered, setHovered] = useState<HoverMap>({});
  const router = useRouter();
  const active = groups.find(g => g.id === activeGroupId);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Switch group, currently ${active?.name ?? "none"}`}
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all ${FOCUS_RING}`}
        style={{
          background: "rgba(18,14,38,0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0,212,255,0.25)",
          boxShadow: "0 2px 8px rgba(0,212,255,0.08)",
        }}>
        <Users size={15} style={{ color: "#0891B2" }} />
        <div className="text-left">
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#0891B2" }}>Group</div>
          <div className="text-sm font-black max-w-[140px] truncate" style={{ color: "white" }}>
            {active?.name}
          </div>
        </div>
        <ChevronDown size={14} style={{
          color: "rgba(255,255,255,0.4)",
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 0.2s",
        }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-64 rounded-2xl overflow-hidden z-20"
            style={{ background: "rgba(10,8,24,0.96)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
            <div className="px-4 py-2.5 border-b text-[10px] font-bold uppercase tracking-widest"
              style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}>
              Switch group
            </div>
            {groups.map(g => (
              <button
                key={g.id}
                type="button"
                role="option"
                aria-selected={g.id === activeGroupId}
                onClick={() => {
                  setOpen(false);
                  saveSelectedGroup(g.id);
                  router.push(`${basePath}?group=${g.id}`);
                }}
                onMouseEnter={() => setHovered(h => ({ ...h, [g.id]: true }))}
                onMouseLeave={() => setHovered(h => ({ ...h, [g.id]: false }))}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b last:border-0 ${FOCUS_RING_INSET}`}
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  background: g.id === activeGroupId ? "rgba(0,212,255,0.08)" : hovered[g.id] ? "rgba(255,255,255,0.05)" : undefined,
                }}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: "white" }}>{g.name}</div>
                  <div className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>{g.passkey}</div>
                </div>
                {g.id === activeGroupId && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: "rgba(0,212,255,0.1)", color: "#0891B2" }}>Active</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}