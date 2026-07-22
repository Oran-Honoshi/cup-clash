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

export type FollowType = "team" | "competition" | "country";

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
  if ((type === "team" || type === "competition" || type === "country") && id) {
    return { type, id };
  }
  return null;
}

// Same "resume after auth" idea, for the Daily Challenge's anonymous-solve
// flow: unlike Follow, the pending action here (persisting a client-side
// guess history) doesn't fit the FollowAction{type,id} shape, so it gets its
// own parallel `puzzle` param rather than being force-fit into `follow`.
export function buildDailyPuzzleAuthWallUrl(currentPathWithQuery: string, challengeDate: string): string {
  const url = new URL(currentPathWithQuery, "https://placeholder.local");
  url.searchParams.set("puzzle", challengeDate);
  const next = `${url.pathname}${url.search}`;
  return `/signup?next=${encodeURIComponent(next)}`;
}

export function parsePuzzleParam(searchParams: URLSearchParams): string | null {
  return searchParams.get("puzzle");
}

// Same idea again for Match Duel invite links (/duel/[token]): the token is
// already in the path, so this doesn't carry new information across the
// signup round trip — its job is to signal "the visitor arrived here
// specifically to accept" so /duel/[token] can auto-accept on landing
// instead of making them find the Accept button a second time.
export function buildMatchDuelAuthWallUrl(currentPathWithQuery: string, token: string): string {
  const url = new URL(currentPathWithQuery, "https://placeholder.local");
  url.searchParams.set("duel", token);
  const next = `${url.pathname}${url.search}`;
  return `/signup?next=${encodeURIComponent(next)}`;
}

export function parseMatchDuelParam(searchParams: URLSearchParams): string | null {
  return searchParams.get("duel");
}
