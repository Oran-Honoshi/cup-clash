import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function sendMessage(chatId: number | string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

interface TelegramUpdate {
  message?: {
    chat:  { id: number };
    text?: string;
    from?: { id: number; first_name?: string };
  };
}

export async function POST(req: NextRequest) {
  let update: TelegramUpdate;
  try {
    update = await req.json() as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId = message.chat.id;
  const text   = message.text ?? "";

  if (text.startsWith("/start")) {
    // Deep link payload: /start USER_ID
    const parts  = text.trim().split(" ");
    const userId = parts[1] ?? null;

    if (userId) {
      const { error } = await sbAdmin()
        .from("profiles")
        .update({ telegram_chat_id: String(chatId) })
        .eq("id", userId);

      if (error) {
        await sendMessage(chatId, "⚠️ Could not link your account. Please try again from the Cup Clash notifications page.");
        return NextResponse.json({ ok: true });
      }

      await sendMessage(
        chatId,
        "✅ You're connected! You'll get match reminders 1 hour before kickoff when you haven't predicted yet."
      );
    } else {
      await sendMessage(
        chatId,
        "👋 Welcome to CupClash Predictions Bot!\n\nTo connect your account, go to cupclash.live, open your notification settings, and click Connect Telegram."
      );
    }

    return NextResponse.json({ ok: true });
  }

  // Any other message
  await sendMessage(chatId, "Use Cup Clash at cupclash.live to manage your predictions.");
  return NextResponse.json({ ok: true });
}
