// Add this component to app/join/[code]/page.tsx
// Replace the existing payment button section

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
    const res = await fetch("/api/join-free", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId }),
    });
    const data = await res.json();
    if (data.success) {
      router.push("/dashboard");
    } else {
      setError(data.error ?? "Failed to join");
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
        {error && <p className="text-xs text-center" style={{ color: "#dc2626" }}>{error}</p>}
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
        style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B", boxShadow: "0 4px 16px rgba(0,255,136,0.25)" }}>
        Join for ${enrollmentFee} <ArrowRight size={16} />
      </button>
    </form>
  );
}