"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type CheckState = "idle" | "checking" | "blocked" | "confirm" | "deleting" | "error";

interface BlockingGroup {
  id: string;
  name: string;
}

const CONFIRM_WORD = "DELETE";

export function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<CheckState>("idle");
  const [blockingGroups, setBlockingGroups] = useState<BlockingGroup[]>([]);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const openModal = async () => {
    setOpen(true);
    setState("checking");
    setError(null);
    try {
      const res = await fetch("/api/account/delete");
      const data = await res.json() as { blockingGroups?: BlockingGroup[]; error?: string };
      if (!res.ok) { setError(data.error ?? "Something went wrong"); setState("error"); return; }
      if (data.blockingGroups && data.blockingGroups.length > 0) {
        setBlockingGroups(data.blockingGroups);
        setState("blocked");
      } else {
        setState("confirm");
      }
    } catch {
      setError("Couldn't reach the server. Try again.");
      setState("error");
    }
  };

  const closeModal = () => {
    setOpen(false);
    setState("idle");
    setConfirmText("");
    setError(null);
  };

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_WORD) return;
    setState("deleting");
    setError(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmText }),
      });
      const data = await res.json() as { success?: boolean; error?: string; blockingGroups?: BlockingGroup[] };
      if (!res.ok) {
        if (data.blockingGroups) { setBlockingGroups(data.blockingGroups); setState("blocked"); return; }
        setError(data.error ?? "Failed to delete account");
        setState("confirm");
        return;
      }

      const sb = createClient();
      await sb.auth.signOut();
      try { localStorage.clear(); sessionStorage.clear(); } catch {}
      window.location.replace("/account-deleted");
    } catch {
      setError("Couldn't reach the server. Try again.");
      setState("confirm");
    }
  };

  return (
    <>
      <div style={{ marginTop: 32 }}>
        <div className="label-caps mb-3" style={{ color: "#f87171" }}>Danger Zone</div>
        <div
          style={{
            padding: 20, borderRadius: 22,
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <Trash2 size={16} style={{ color: "#f87171" }} />
            <span className="font-display text-lg uppercase tracking-tight" style={{ color: "#f87171" }}>
              Delete My Account
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
            Permanently deletes your account and profile. This cannot be undone.
          </p>
          <button
            onClick={openModal}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
            style={{
              padding: "11px 18px", borderRadius: 10,
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.35)",
              color: "#fca5a5",
              cursor: "pointer",
              fontFamily: "var(--font-ui)",
            }}
          >
            <Trash2 size={14} /> Delete My Account
          </button>
        </div>
      </div>

      {open && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: "rgba(18,14,38,0.98)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.12)" }}>
                  <AlertTriangle size={18} style={{ color: "#f87171" }} />
                </div>
                <div>
                  <div className="font-display text-lg uppercase font-black text-white">Delete Account?</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>This cannot be undone</div>
                </div>
              </div>
              <button onClick={closeModal} style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {state === "checking" && (
              <div className="flex items-center justify-center gap-2 py-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Loader2 size={16} className="animate-spin" /> Checking your groups…
              </div>
            )}

            {state === "error" && (
              <>
                <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
                <button onClick={closeModal} className="w-full py-3 rounded-xl font-bold text-sm" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                  Close
                </button>
              </>
            )}

            {state === "blocked" && (
              <>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                  You&apos;re the sole admin of {blockingGroups.length === 1 ? "a group" : "these groups"} that still {blockingGroups.length === 1 ? "has" : "have"} other members. Transfer admin to someone else before deleting your account &mdash; otherwise the group and everyone&apos;s entry tracking would be left without an owner.
                </p>
                <div className="space-y-2">
                  {blockingGroups.map(g => (
                    <Link
                      key={g.id}
                      href={`/groups/${g.id}`}
                      onClick={closeModal}
                      className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold"
                      style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}
                    >
                      {g.name} <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Manage →</span>
                    </Link>
                  ))}
                </div>
                <button onClick={closeModal} className="w-full py-3 rounded-xl font-bold text-sm" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                  Close
                </button>
              </>
            )}

            {(state === "confirm" || state === "deleting") && (
              <>
                <ul className="text-sm space-y-1.5" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
                  <li>&bull; Your profile, photo, and personal details are permanently erased.</li>
                  <li>&bull; Your past predictions stay in group history under &ldquo;Deleted User&rdquo; so other members&apos; leaderboards and entry records aren&apos;t affected.</li>
                  <li>&bull; Your account is permanently banned &mdash; you won&apos;t be able to sign back in with this email.</li>
                </ul>
                <div>
                  <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Type DELETE to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value)}
                    disabled={state === "deleting"}
                    placeholder="DELETE"
                    autoCapitalize="characters"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontFamily: "var(--font-ui)" }}
                  />
                </div>
                {error && <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    disabled={state === "deleting"}
                    className="flex-1 py-3 rounded-xl font-bold text-sm"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={confirmText !== CONFIRM_WORD || state === "deleting"}
                    className="flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-40"
                    style={{ background: "rgba(239,68,68,0.3)", border: "1px solid rgba(239,68,68,0.45)", color: "#fca5a5" }}
                  >
                    {state === "deleting" ? "Deleting…" : "Delete Forever"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
