"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, LogIn, KeyRound, ArrowRight, X, AlertCircle } from "lucide-react";
import { BallLoader } from "@/components/ui/BallLoader";

// Bottom sheet passkey entry, mirroring the real join flow at /join/[code]
// (which resolves against the groups.passkey column — never invite_code).
function JoinGroupSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (open) { setPasskey(""); setError(null); setLoading(false); } }, [open]);

  if (!mounted || !open) return null;

  const handleJoin = () => {
    const clean = passkey.trim().toUpperCase();
    if (clean.length < 4) {
      setError("Please enter a valid passkey");
      return;
    }
    setLoading(true);
    router.push(`/join/${clean}`);
  };

  return createPortal(
    <div
      className="fixed inset-0 flex flex-col justify-end"
      style={{ zIndex: 9998, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-t-3xl w-full max-w-lg mx-auto"
        style={{ background: "var(--nv)", border: "1px solid var(--br)", boxShadow: "0 -8px 40px var(--shad)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--mt)" }} />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b" style={{ borderColor: "var(--dv)" }}>
          <span className="font-display text-lg uppercase font-black tracking-wide" style={{ color: "var(--tx)" }}>
            Join a Group
          </span>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-xl"
            style={{ background: "var(--ip)", color: "var(--mt)" }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <p className="text-sm" style={{ color: "var(--t2)" }}>
            Ask your group admin for the 6-letter passkey.
          </p>

          {error && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
              style={{ background: "color-mix(in srgb, #dc2626 10%, transparent)", border: "1px solid color-mix(in srgb, #dc2626 30%, transparent)", color: "#dc2626" }}>
              <AlertCircle size={15} />{error}
            </div>
          )}

          <div className="relative">
            <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--mt)" }} />
            <input
              type="text"
              placeholder="ABC123"
              value={passkey}
              onChange={e => { setPasskey(e.target.value.toUpperCase()); setError(null); }}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              maxLength={8}
              autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-xl border font-mono font-black tracking-widest uppercase text-center"
              style={{ background: "var(--ip)", borderColor: "var(--br)", color: "var(--tx)", fontSize: "1.5rem", outline: "none" }}
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={passkey.trim().length < 4 || loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            style={{ background: "var(--ac)", color: "var(--at)" }}
          >
            {loading ? <><BallLoader size="inline" label={null} /> Finding group...</> : <>Find Group <ArrowRight size={16} /></>}
          </button>
        </div>

        <div style={{ height: "env(safe-area-inset-bottom, 12px)", minHeight: 12 }} />
      </div>
    </div>,
    document.body
  );
}

export function GroupsHeaderActions() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setSheetOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
        style={{ background: "color-mix(in srgb, var(--ac) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--ac) 35%, transparent)", color: "var(--ac)" }}
      >
        <LogIn size={15} /> Join Group
      </button>
      <Link href="/create-group">
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
          style={{ background: "var(--ac)", color: "var(--at)", boxShadow: "0 4px 16px color-mix(in srgb, var(--ac) 35%, transparent)" }}
        >
          <Plus size={16} /> New Group
        </button>
      </Link>

      <JoinGroupSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
