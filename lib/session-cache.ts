// Simple in-memory cache for client-fetched data that outlives a component's
// mount lifecycle — e.g. Group Detail's sub-sector tabs unmount/remount their
// content on every tab switch (see group-detail-client.tsx), which without
// this re-fetches everything from scratch on every revisit. Not persisted
// anywhere — cleared on full page reload, which is fine for this use case.
const cache = new Map<string, unknown>();

export function getSessionCached<T>(key: string): T | undefined {
  return cache.has(key) ? (cache.get(key) as T) : undefined;
}

export function setSessionCached<T>(key: string, value: T): void {
  cache.set(key, value);
}
