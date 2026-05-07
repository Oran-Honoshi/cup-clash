import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface PushPayload {
  userIds: string[];
  title:   string;
  body:    string;
  url?:    string;
  tag?:    string;
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidPublic  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidEmail   = process.env.VAPID_EMAIL ?? "mailto:hello@cupclash.live";

  if (!vapidPrivate || !vapidPublic) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 503 });
  }

  const { userIds, title, body, url, tag } = await request.json() as PushPayload;

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: subs } = await sb
    .from("push_subscriptions")
    .select("*")
    .in("user_id", userIds);

  if (!subs?.length) return NextResponse.json({ sent: 0 });

  const pkg = "web-push";
  const webPush = await import(pkg as string).catch(() => null) as {
    setVapidDetails: (e: string, p: string, s: string) => void;
    sendNotification: (sub: object, payload: string) => Promise<unknown>;
  } | null;

  if (!webPush) return NextResponse.json({ error: "npm install web-push" }, { status: 503 });

  webPush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);
  const payload = JSON.stringify({ title, body, url: url ?? "/dashboard", tag: tag ?? "cupclash", icon: "/icons/icon-192.png" });

  let sent = 0;
  await Promise.allSettled(subs.map(async sub => {
    try {
      await webPush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } }, payload);
      sent++;
    } catch (e) {
      if ((e as { statusCode?: number }).statusCode === 410) {
        await sb.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
    }
  }));

  return NextResponse.json({ sent, total: subs.length });
}