"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function JoinButton({
  groupId, enrollmentFee, demoMode,
}: {
  groupId: string; enrollmentFee: number; demoMode: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const router = useRouter();

  const handleDemoJoin = async () => {
    setLoading(true); setError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch("/api/join-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) { setError(`Error: ${await res.text()}`); setLoading(false); return; }
      const data = await res.json();
      if (data.success) { window.location.replace("/dashboard"); }
      else { setError(data.error ?? "Failed to join"); setLoading(false); }
    } catch (e) {
      setError(e instanceof Error && e.name === "AbortError" ? "Request timed out" : "Unexpected error");
      setLoading(false);
    }
  };

  // Demo mode — no "Testing" label, just a clean join button
  if (demoMode) {
    return (
      <div className="space-y-2">
        <button onClick={handleDemoJoin} disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
          {loading ? "Joining..." : <>Join Free <ArrowRight size={15} /></>}
        </button>
        {error && (
          <p className="text-xs text-center rounded-lg px-3 py-2"
            style={{ color: "#dc2626", background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)" }}>
            {error}
          </p>
        )}
        <p className="text-center text-xs" style={{ color: "#94a3b8" }}>
          Early access · No payment required during beta
        </p>
      </div>
    );
  }

  return (
    <form action="/api/paddle" method="POST">
      <input type="hidden" name="groupId" value={groupId} />
      <button type="submit"
        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 4px 16px rgba(0,255,136,0.25)" }}>
        Join for ${enrollmentFee} <ArrowRight size={16} />
      </button>
    </form>
  );
}