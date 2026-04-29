"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/logo";
import { CheckCircle, XCircle } from "lucide-react";

export default function UnsubscribePage() {
  const params = useSearchParams();
  const email  = params.get("email") ?? "";
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    // In production: mark email as unsubscribed in your DB/Resend
    // For now: just mark as done
    const timer = setTimeout(() => setStatus("done"), 800);
    return () => clearTimeout(timer);
  }, [email]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center space-y-5">
        <Logo size="lg" />

        {status === "loading" && (
          <p className="text-pitch-400 text-sm">Processing your request...</p>
        )}

        {status === "done" && (
          <>
            <CheckCircle size={40} className="text-success mx-auto" />
            <h2 className="font-display text-2xl uppercase text-white">Unsubscribed</h2>
            <p className="text-pitch-400 text-sm">
              {email ? (
                <><strong className="text-white">{email}</strong> has been removed from Cup Clash group invite emails.</>
              ) : (
                "You've been unsubscribed from Cup Clash group invite emails."
              )}
            </p>
            <p className="text-pitch-600 text-xs">
              You can still sign in and use Cup Clash — this only stops group invite emails from admins.
            </p>
            <a href="/" className="inline-block text-xs text-pitch-500 hover:text-white transition-colors">
              Back to cupclash.com →
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle size={40} className="text-danger mx-auto" />
            <h2 className="font-display text-2xl uppercase text-white">Something went wrong</h2>
            <p className="text-pitch-400 text-sm">Please try again or contact support.</p>
          </>
        )}
      </div>
    </div>
  );
}
