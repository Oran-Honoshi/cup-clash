import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId") ?? "grp_titans";

  // In production: fetch from Supabase
  // For now: generate mock CSV
  const rows = [
    ["Rank", "Name", "Country", "Points", "Exact Scores", "Correct Outcomes", "Paid"],
    ["1", "Amit",  "Argentina", "145", "8",  "24", "Yes"],
    ["2", "Sarah", "Brazil",    "130", "6",  "22", "No"],
    ["3", "John",  "England",   "95",  "4",  "18", "Yes"],
  ];

  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="cupclash-leaderboard-${groupId}.csv"`,
    },
  });
}
