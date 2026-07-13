import type { SupabaseClient } from "@supabase/supabase-js";

// Automated ("system") messages into a group's chat feed — e.g. the Daily
// Challenge "Dave solved today's puzzle in 2 guesses" nudge. Requires a
// service-role client (see migration 049: chat_messages.user_id is nullable
// specifically for this, and only a service-role insert can bypass the
// "auth.uid() = user_id" RLS policy that real user messages are still
// bound by).
export async function postSystemMessage(sbAdminClient: SupabaseClient, groupId: string, content: string): Promise<void> {
  await sbAdminClient.from("chat_messages").insert({
    group_id: groupId,
    user_id: null,
    type: "system",
    content,
  });
}
