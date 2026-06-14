const STORAGE_KEY = "cupclash_selected_group";

export function saveSelectedGroup(groupId: string): void {
  try { localStorage.setItem(STORAGE_KEY, groupId); } catch {}
}

export function loadSelectedGroup(): string | null {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
