"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Users } from "lucide-react";

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
  const router = useRouter();
  const active = groups.find(g => g.id === activeGroupId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all"
        style={{
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(0,212,255,0.25)",
          boxShadow: "0 2px 8px rgba(0,212,255,0.08)",
        }}>
        <Users size={15} style={{ color: "#0891B2" }} />
        <div className="text-left">
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#0891B2" }}>Group</div>
          <div className="text-sm font-black max-w-[140px] truncate" style={{ color: "#0F172A" }}>
            {active?.name}
          </div>
        </div>
        <ChevronDown size={14} style={{
          color: "#94a3b8",
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 0.2s",
        }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-64 rounded-2xl overflow-hidden z-20"
            style={{ background: "white", border: "1px solid rgba(0,212,255,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
            <div className="px-4 py-2.5 border-b text-[10px] font-bold uppercase tracking-widest"
              style={{ borderColor: "#f1f5f9", color: "#94a3b8" }}>
              Switch group
            </div>
            {groups.map(g => (
              <button
                key={g.id}
                onClick={() => {
                  setOpen(false);
                  router.push(`${basePath}?group=${g.id}`);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-all border-b last:border-0"
                style={{
                  borderColor: "#f8fafc",
                  background: g.id === activeGroupId ? "rgba(0,212,255,0.04)" : undefined,
                }}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: "#0F172A" }}>{g.name}</div>
                  <div className="text-xs font-mono" style={{ color: "#94a3b8" }}>{g.passkey}</div>
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