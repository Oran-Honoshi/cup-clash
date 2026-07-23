export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { WORLD_CUP_SLUG } from "@/lib/services/competitions";

// Scores is now the Done tab of the consolidated Schedule view — see
// components/schedule/schedule-client.tsx. Kept as a redirect (not deleted)
// so existing bookmarks/links keep working. Forwards `competition` (defaults
// to World Cup, matching this page's old default) and `follow` (in-flight
// auth-wall round trips started before this redirect existed).
export default function ScoresPage({
  searchParams,
}: {
  searchParams: { competition?: string; follow?: string };
}) {
  const params = new URLSearchParams();
  params.set("tab", "done");
  params.set("competition", searchParams.competition ?? WORLD_CUP_SLUG);
  if (searchParams.follow) params.set("follow", searchParams.follow);

  redirect(`/schedule?${params.toString()}`);
}
