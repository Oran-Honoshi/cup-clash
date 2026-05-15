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

  // Dynamically import to keep testing tools out of public bundle
  const { default: TestingContent } = await import("./testing-content");
  return <TestingContent />;
}