import type { Group, Member } from "@/lib/types";
import { MOCK_GROUP, MOCK_MEMBERS } from "@/lib/mocks/data";

// SERVICE LAYER
// -------------
// Every data-access path in the app goes through these functions.
// When Supabase lands, replace the bodies with Supabase queries —
// the call sites and types do not change.
//
// Example future implementation:
//   export async function getGroup(id: string) {
//     const { data, error } = await supabase
//       .from("groups").select("*").eq("id", id).single();
//     if (error) throw error;
//     return data as Group;
//   }

export async function getGroup(id: string): Promise<Group> {
  // Mock: ignore id, return the seeded group
  void id;
  return MOCK_GROUP;
}

export async function getMembers(groupId: string): Promise<Member[]> {
  void groupId;
  return [...MOCK_MEMBERS].sort((a, b) => b.points - a.points);
}

export async function getLeaderboard(groupId: string, limit = 3): Promise<Member[]> {
  const members = await getMembers(groupId);
  return members.slice(0, limit);
}
