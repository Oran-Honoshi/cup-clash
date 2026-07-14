"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";

interface GroupSwitcherControlProps {
  currentGroupId: string;
  allGroups:      Array<{ id: string; name: string; passkey: string }>;
  activeTab:      string;
}

// Lightweight tap-to-swap group switcher for the Group Detail header — per
// the Phase 2 decision, this replaces the full-width horizontal
// GroupSwipeSelector pattern in this context (Group Detail is a path-param
// route per group, not a query-param one, so switching still navigates,
// but via a small anchored dropdown rather than a swipe carousel taking up
// header space). Preserves the current sub-sector across the switch.
export function GroupSwitcherControl({ currentGroupId, allGroups, activeTab }: GroupSwitcherControlProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (allGroups.length <= 1) return null;

  function handleSelect(id: string) {
    setOpen(false);
    if (id === currentGroupId) return;
    router.push(`/groups/${id}?tab=${activeTab}`);
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Switch group"
        aria-expanded={open}
        className="flex items-center justify-center h-8 w-8 rounded-full transition-all"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
      >
        <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.6)", transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.15s" }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 z-30 w-56 rounded-2xl p-1.5 max-h-72 overflow-y-auto"
          style={{
            background: "rgba(18,14,38,0.98)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {allGroups.map(g => {
            const active = g.id === currentGroupId;
            return (
              <button
                key={g.id}
                onClick={() => handleSelect(g.id)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{ background: active ? "rgba(0,212,255,0.1)" : "transparent" }}
              >
                <span className="flex-1 min-w-0 text-sm font-bold truncate" style={{ color: active ? "#00D4FF" : "white" }}>
                  {g.name}
                </span>
                {active && <Check size={14} style={{ color: "#00D4FF", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
