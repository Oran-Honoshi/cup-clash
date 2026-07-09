// Reusable "auth wall" pattern: when an anonymous visitor triggers an
// action that requires an account (e.g. Follow), we send them to signup
// with enough context to complete that action automatically right after
// auth succeeds — instead of just dropping them on signup with no context.
//
// signin/signup already support `?next=<path>` (see app/(auth)/signin,
// app/(auth)/signup, app/auth/callback/route.ts) and forward it through
// both the password and OAuth/email-confirmation flows unchanged. We piggy-
// back on that: the intended follow action is encoded as a `follow` query
// param on the *next* path itself, so it survives the round trip and is
// consumed once by <ConsumeFollowParam> on landing.

export type FollowType = "team" | "competition";

export interface FollowAction {
  type: FollowType;
  id: string;
}

export function buildAuthWallUrl(currentPathWithQuery: string, follow?: FollowAction): string {
  const url = new URL(currentPathWithQuery, "https://placeholder.local");
  if (follow) {
    url.searchParams.set("follow", `${follow.type}:${follow.id}`);
  }
  const next = `${url.pathname}${url.search}`;
  return `/signup?next=${encodeURIComponent(next)}`;
}

export function parseFollowParam(searchParams: URLSearchParams): FollowAction | null {
  const raw = searchParams.get("follow");
  if (!raw) return null;
  const [type, id] = raw.split(":");
  if ((type === "team" || type === "competition") && id) {
    return { type, id };
  }
  return null;
}
