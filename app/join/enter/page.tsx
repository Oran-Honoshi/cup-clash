"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/logo";

export default function JoinEnterPage() {
  const [passkey, setPasskey] = useState("");
  const [error,   setError]   = useState<string | null>(null);
  const router = useRouter();

  const handleJoin = () => {
    const clean = passkey.trim().toUpperCase();
    if (clean.length < 4) {
      setError("Please enter a valid passkey");
      return;
    }
    router.push(`/join/${clean}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#F8FAFC" }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center">
          <Logo size="lg" />
          <p className="mt-2 text-sm" style={{ color: "#64748b" }}>Join a group</p>
        </div>

        <Card variant="glass" className="p-6 space-y-4">
          <div>
            <h2 className="font-display text-2xl uppercase" style={{ color: "#0F172A" }}>
              Enter Passkey
            </h2>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>
              Ask your group admin for the 6-letter passkey.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }}>
              <AlertCircle size={15} />{error}
            </div>
          )}

          <div className="relative">
            <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="ABC123"
              value={passkey}
              onChange={e => setPasskey(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              maxLength={8}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border font-mono font-bold tracking-widest uppercase text-center"
              style={{
                background: "white",
                borderColor: "#e2e8f0",
                color: "#0F172A",
                fontSize: "1.5rem",
                outline: "none",
              }}
              onFocus={e => (e.target.style.borderColor = "#00D4FF")}
              onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          <Button onClick={handleJoin} disabled={passkey.trim().length < 4}
            size="lg" className="w-full" rightIcon={<ArrowRight size={16} />}>
            Find Group
          </Button>
        </Card>

        <p className="text-center text-sm" style={{ color: "#94a3b8" }}>
          Don&apos;t have a passkey?{" "}
          <a href="/create-group" style={{ color: "#0891B2", fontWeight: "bold" }}>
            Create your own group
          </a>
        </p>
      </div>
    </div>
  );
}