import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Account Deleted | Cup Clash",
  description: "Your Cup Clash account has been deleted.",
};

export default function AccountDeletedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
      <div className="max-w-md mx-auto px-5 py-16 text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full flex items-center justify-center" style={{ background: "rgba(8,145,178,0.1)" }}>
          <CheckCircle2 size={32} style={{ color: "#0891B2" }} />
        </div>

        <h1 className="font-display text-3xl uppercase font-black mb-3" style={{ color: "#0F172A" }}>
          Your account has been deleted
        </h1>

        <p className="text-base leading-relaxed mb-8" style={{ color: "#475569" }}>
          Your personal information has been removed and your account can no longer be signed into.
          Historical predictions in groups you were part of remain visible to other members under a generic
          &ldquo;Deleted User&rdquo; label, so their leaderboard and entry history stays intact.
        </p>

        <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest"
          style={{ background: "#0891B2", color: "#fff" }}>
          Back to Cup Clash
        </Link>
      </div>
    </div>
  );
}
