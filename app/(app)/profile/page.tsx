export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

// Profile is now a tab inside the consolidated Settings screen — see
// components/settings/settings-client.tsx. Kept as a redirect (not deleted)
// so existing bookmarks/links keep working.
export default function ProfilePage() {
  redirect("/settings?tab=profile");
}
