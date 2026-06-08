import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function sbAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function sbAnon() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authErr } = await sbAnon().auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { questionId: string; correctAnswer: string };
  const { questionId, correctAnswer } = body;

  if (!questionId || !correctAnswer?.trim()) {
    return NextResponse.json({ error: "questionId and correctAnswer are required" }, { status: 400 });
  }

  const sb = sbAdmin();

  // Load question and verify caller is admin of its group
  const { data: question } = await sb
    .from("bonus_questions")
    .select("id, group_id, question_type, points_awarded, is_resolved")
    .eq("id", questionId)
    .single();

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const q = question as {
    id: string;
    group_id: string;
    question_type: string;
    points_awarded: number;
    is_resolved: boolean;
  };

  const { data: group } = await sb
    .from("groups")
    .select("admin_id")
    .eq("id", q.group_id)
    .single();

  const isOwner = (group as { admin_id: string } | null)?.admin_id === user.id;
  if (!isOwner) {
    const { data: membership } = await sb
      .from("group_members")
      .select("role")
      .eq("group_id", q.group_id)
      .eq("user_id", user.id)
      .maybeSingle();
    const role = (membership as { role: string } | null)?.role;
    if (role !== "admin" && role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (q.is_resolved) {
    return NextResponse.json({ error: "Question already resolved" }, { status: 400 });
  }

  // Find matching answers (case-insensitive for open_text)
  const { data: answers } = await sb
    .from("bonus_answers")
    .select("id, user_id, answer")
    .eq("question_id", questionId);

  const allAnswers = (answers ?? []) as Array<{ id: string; user_id: string; answer: string }>;

  const correctLower = correctAnswer.trim().toLowerCase();
  const matchingIds = allAnswers
    .filter(a => {
      if (q.question_type === "open_text") {
        return a.answer.trim().toLowerCase() === correctLower;
      }
      return a.answer.trim().toLowerCase() === correctLower;
    })
    .map(a => a.id);

  // Award points to matching answers
  if (matchingIds.length > 0) {
    await sb
      .from("bonus_answers")
      .update({ points_earned: q.points_awarded } as Record<string, number>)
      .in("id", matchingIds);
  }

  // Mark question as resolved with the correct answer
  await sb
    .from("bonus_questions")
    .update({
      is_resolved: true,
      correct_answer: correctAnswer.trim(),
    } as Record<string, unknown>)
    .eq("id", questionId);

  return NextResponse.json({
    success: true,
    totalAnswers: allAnswers.length,
    correctCount: matchingIds.length,
    pointsAwarded: q.points_awarded,
  });
}
