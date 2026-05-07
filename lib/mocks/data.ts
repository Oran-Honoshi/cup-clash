import type { Group, Match, Member } from "@/lib/types";

// Seed data — sourced from the project sample JSON.
// Replace `@/lib/services/groups.ts` with a Supabase implementation
// to switch over; this file stays as a fallback / dev seed.

export const MOCK_GROUP: Group = {
  id:                  "grp_titans",
  name:                "Tech Titans World Cup",
  admin:               "User_01",
  buyInAmount:         50,
  passkey:             "TITANS",
  maxMembers:          100,
  enrollmentFeeCents:  200,
  enrollmentDeadline:  null,
  payouts: { first: "60%", second: "30%", third: "10%" },
};

export const MOCK_MEMBERS: Member[] = [
  { id: "1", name: "Amit",   points: 145, paid: true,  country: "Argentina" },
  { id: "2", name: "Sarah",  points: 130, paid: false, country: "Brazil" },
  { id: "3", name: "John",   points: 95,  paid: true,  country: "England" },
  { id: "4", name: "Lior",   points: 88,  paid: true,  country: "Israel" },
  { id: "5", name: "Priya",  points: 72,  paid: true,  country: "France" },
  { id: "6", name: "Diego",  points: 65,  paid: false, country: "Spain" },
  { id: "7", name: "Hannah", points: 58,  paid: true,  country: "Germany" },
  { id: "8", name: "Marco",  points: 41,  paid: true,  country: "Italy" },
];

export const MOCK_MATCHES: Match[] = [
  {
    id: "m1",
    home: "Israel",
    away: "France",
    homeFlagCode: "il",
    awayFlagCode: "fr",
    time: "2026-06-12T20:00:00Z",
    stage: "Group",
  },
  {
    id: "m2",
    home: "Argentina",
    away: "Brazil",
    homeFlagCode: "ar",
    awayFlagCode: "br",
    time: "2026-06-13T18:00:00Z",
    stage: "Group",
  },
  {
    id: "m3",
    home: "England",
    away: "Spain",
    homeFlagCode: "gb-eng",
    awayFlagCode: "es",
    time: "2026-06-14T19:30:00Z",
    stage: "Group",
  },
];