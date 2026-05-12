"use client";

import { useState } from "react";
import { ArrowRight, FlaskConical } from "lucide-react";
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
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch("/api/join-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const text = await res.text();
        setError(`Server error ${res.status}: ${text}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.success) {
        window.location.replace("/dashboard");
      } else {
        setError(data.error ?? "Failed to join — check console");
        setLoading(false);
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        setError("Request timed out. Check your connection and try again.");
      } else {
        setError(`Unexpected error: ${e instanceof Error ? e.message : String(e)}`);
      }
      setLoading(false);
    }
  };

  if (demoMode) {
    return (
      <div className="space-y-2">
        <button onClick={handleDemoJoin} disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
          <FlaskConical size={16} />
          {loading ? "Joining..." : "Join Free (Testing Mode)"}
          {!loading && <ArrowRight size={16} />}
        </button>
        {error && (
          <p className="text-xs text-center rounded-lg px-3 py-2"
            style={{ color: "#dc2626", background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)" }}>
            {error}
          </p>
        )}
        <p className="text-center text-xs" style={{ color: "#94a3b8" }}>
          🧪 Demo mode — no payment required
        </p>
      </div>
    );
  }

  return (
    <form action="/api/paddle" method="POST">
      <input type="hidden" name="groupId" value={groupId} />
      <button type="submit"
        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
        Join for ${enrollmentFee} <ArrowRight size={16} />
      </button>
    </form>
  );
}