import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const FROM_EMAIL = "Cup Clash <noreply@cupclash.live>";

function generateWelcomeHtml(data: {
  memberName: string;
  groupName: string;
  adminName: string;
  rulesText: string;
  buyInAmount: number;
  inviteCode: string;
  appUrl: string;
  scoringSystem: string;
  adminFee: number;
  payouts: { first: number; second: number; third: number };
}): string {
  const { memberName, groupName, adminName, rulesText, buyInAmount,
    inviteCode, appUrl, scoringSystem, adminFee, payouts } = data;
  const joinUrl = `${appUrl}/join/${inviteCode}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>You're invited to ${groupName}</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#00D4FF,#00FF88);padding:40px;text-align:center;">
    <h1 style="margin:0;color:#0B141B;font-size:32px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">
      CUP CLASH
    </h1>
    <p style="margin:8px 0 0;color:rgba(11,20,27,0.7);font-size:14px;">
      FIFA World Cup 2026 Prediction League
    </p>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:40px 40px 20px;">
    <h2 style="color:#0F172A;font-size:22px;margin:0 0 12px;">
      Hey ${memberName}! 👋
    </h2>
    <p style="color:#64748b;line-height:1.6;margin:0 0 16px;">
      <strong style="color:#0F172A;">${adminName}</strong> has invited you to join
      <strong style="color:#0F172A;">${groupName}</strong> — a private World Cup 2026
      prediction league on Cup Clash.
    </p>
    <p style="color:#64748b;line-height:1.6;margin:0;">
      Predict match scores, pick the tournament winner, and compete with your group
      across all 104 matches from June 11 to July 19, 2026.
    </p>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:20px 40px 30px;text-align:center;">
    <a href="${joinUrl}" style="display:inline-block;background:linear-gradient(135deg,#00FF88,#00D4FF);color:#0B141B;text-decoration:none;padding:16px 40px;border-radius:50px;font-weight:700;font-size:16px;text-transform:uppercase;letter-spacing:1px;">
      Join ${groupName} →
    </a>
    <p style="margin:12px 0 0;color:#94a3b8;font-size:12px;">
      Or enter passkey: <strong style="color:#0F172A;font-family:monospace;font-size:16px;">${inviteCode}</strong> at cupclash.live/join/enter
    </p>
  </td></tr>

  <!-- Group Rules -->
  <tr><td style="padding:0 40px 30px;">
    <div style="background:#f8fafc;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
      <h3 style="color:#0F172A;margin:0 0 16px;font-size:15px;text-transform:uppercase;letter-spacing:1px;">
        📋 Group Rules
      </h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${buyInAmount > 0 ? `<tr><td style="color:#64748b;padding:5px 0;font-size:14px;">Entry</td><td style="color:#0F172A;font-weight:700;text-align:right;font-size:14px;">$${buyInAmount} per player</td></tr>` : ""}
        ${adminFee > 0 ? `<tr><td style="color:#64748b;padding:5px 0;font-size:14px;">Admin fee</td><td style="color:#d97706;font-weight:700;text-align:right;font-size:14px;">${adminFee}% of pool</td></tr>` : ""}
        <tr><td style="color:#64748b;padding:5px 0;font-size:14px;">🥇 1st place</td><td style="color:#0F172A;font-weight:700;text-align:right;font-size:14px;">${payouts.first}% of pool</td></tr>
        <tr><td style="color:#64748b;padding:5px 0;font-size:14px;">🥈 2nd place</td><td style="color:#0F172A;font-weight:700;text-align:right;font-size:14px;">${payouts.second}% of pool</td></tr>
        <tr><td style="color:#64748b;padding:5px 0;font-size:14px;">🥉 3rd place</td><td style="color:#0F172A;font-weight:700;text-align:right;font-size:14px;">${payouts.third}% of pool</td></tr>
        <tr><td style="color:#64748b;padding:5px 0;font-size:14px;">Scoring</td><td style="color:#0F172A;font-weight:700;text-align:right;font-size:14px;">${scoringSystem}</td></tr>
      </table>
      ${rulesText ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;line-height:1.6;">${rulesText.replace(/\n/g, "<br>")}</div>` : ""}
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">
          All predictions lock 5 minutes before kickoff.
          Tournament picks (winner, top scorer, etc.) lock June 11.
        </p>
      </div>
    </div>
  </td></tr>

  <!-- Install PWA -->
  <tr><td style="padding:0 40px 30px;">
    <div style="background:rgba(0,212,255,0.06);border-radius:12px;padding:20px;border:1px solid rgba(0,212,255,0.2);text-align:center;">
      <p style="color:#0F172A;font-weight:700;margin:0 0 6px;font-size:14px;">📱 Add to your home screen</p>
      <p style="color:#64748b;font-size:12px;margin:0;line-height:1.5;">
        iOS: Tap Share → Add to Home Screen<br>
        Android: Tap Menu → Add to Home Screen
      </p>
    </div>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 40px 40px;text-align:center;border-top:1px solid #f1f5f9;">
    <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">
      You received this because ${adminName} invited you to their Cup Clash group.
    </p>
    <p style="color:#94a3b8;font-size:12px;margin:0;">
      <a href="${appUrl}" style="color:#0891B2;text-decoration:none;">cupclash.live</a>
      · <a href="${appUrl}/unsubscribe" style="color:#94a3b8;text-decoration:none;">Unsubscribe</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      memberEmails:  string[];
      memberNames:   string[];
      groupName:     string;
      adminName:     string;
      rulesText:     string;
      buyInAmount:   number;
      inviteCode:    string;
      scoringSystem: string;
      adminFee:      number;
      payouts: { first: number; second: number; third: number };
    };

    const appUrl = process.env.NEXT_PUBLIC_URL ?? "https://cupclash.live";

    if (!process.env.RESEND_API_KEY) {
      console.log("[Cup Clash] RESEND_API_KEY not set — preview mode");
      return NextResponse.json({
        sent: 0, failed: 0,
        message: "Preview mode: RESEND_API_KEY not configured in Vercel",
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const results = await Promise.allSettled(
      body.memberEmails.map((email, i) =>
        resend.emails.send({
          from:    FROM_EMAIL,
          to:      email,
          subject: `You're invited to ${body.groupName} on Cup Clash 🏆`,
          html:    generateWelcomeHtml({
            ...body,
            memberName: body.memberNames[i] ?? email.split("@")[0],
            appUrl,
          }),
        })
      )
    );

    const failed = results.filter(r => r.status === "rejected").length;
    const sent   = results.length - failed;

    return NextResponse.json({
      sent, failed,
      message: `Sent ${sent} of ${results.length} email${results.length !== 1 ? "s" : ""}`,
    });

  } catch (err) {
    console.error("Email route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}