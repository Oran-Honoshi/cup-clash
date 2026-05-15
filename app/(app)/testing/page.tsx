export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/services/user-group";

const ADMIN_EMAILS = [
  "lipinksy19@gmail.com",
  "oransch@gmail.com",
  "oran@honoshi.co.il",
];

export default async function TestingPage() {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile || !ADMIN_EMAILS.includes(userProfile.email ?? "")) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">Internal</div>
        <h1 className="font-display text-4xl uppercase" style={{ color: "#0F172A" }}>
          Testing Panel
        </h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          Admin only · {userProfile.email}
        </p>
      </div>
      <div className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,212,255,0.15)" }}>
        <p className="text-sm font-bold mb-2" style={{ color: "#0F172A" }}>
          ✓ Testing page access granted
        </p>
        <p className="text-sm" style={{ color: "#64748b" }}>
          The original testing tools are in your existing testing page component.
          This guard ensures only admin emails can see this page.
        </p>
      </div>
    </div>
  );
}