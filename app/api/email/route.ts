import { NextRequest, NextResponse } from "next/server";

/**
 * Welcome Email API
 *
 * SETUP GUIDE (do this when ready to send real emails):
 * 1. Go to resend.com → sign up → get API key
 * 2. Add to .env.local: RESEND_API_KEY=re_...
 * 3. Add to Vercel env vars: RESEND_API_KEY
 * 4. Verify your domain in Resend (Settings → Domains → Add)
 * 5. Update FROM_EMAIL below to your verified domain
 * 6. npm install resend
 *
 * For now: logs the email to console and returns success.
 */

const FROM_EMAIL = "Cup Clash <noreply@cupclash.com>"; // update after domain verification

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
  const {
    memberName, groupName, adminName, rulesText, buyInAmount,
    inviteCode, appUrl, scoringSystem, adminFee, payouts,
  } = data;

  const joinUrl = `${appUrl}/join/${inviteCode}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>You're invited to ${groupName}</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;color:#E2E8F0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#2A398D,#E61D25);padding:40px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:36px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">
      CUP CLASH
    </h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
      FIFA World Cup 2026 Prediction League
    </p>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:40px 40px 20px;">
    <h2 style="color:#fff;font-size:24px;margin:0 0 12px;">
      Hey ${memberName}! 👋
    </h2>
    <p style="color:#94A3B8;line-height:1.6;margin:0 0 16px;">
      <strong style="color:#E2E8F0;">${adminName}</strong> has invited you to join
      <strong style="color:#E2E8F0;">${groupName}</strong> — a private World Cup 2026
      prediction league on Cup Clash.
    </p>
    <p style="color:#94A3B8;line-height:1.6;margin:0;">
      Predict match scores, pick the tournament winner, and compete with your group
      across all 104 matches from June 11 to July 19, 2026.
    </p>
  </td></tr>

  <!-- CTA Button -->
  <tr><td style="padding:20px 40px 30px;text-align:center;">
    <a href="${joinUrl}" style="display:inline-block;background:linear-gradient(135deg,#2A398D,#E61D25);color:#fff;text-decoration:none;padding:16px 40px;border-radius:50px;font-weight:700;font-size:16px;text-transform:uppercase;letter-spacing:1px;">
      Join ${groupName} →
    </a>
    <p style="margin:12px 0 0;color:#64748B;font-size:12px;">
      Or enter invite code: <strong style="color:#E2E8F0;">${inviteCode}</strong>
    </p>
  </td></tr>

  <!-- Group Rules -->
  <tr><td style="padding:0 40px 30px;">
    <div style="background:#1E293B;border-radius:12px;padding:24px;border:1px solid rgba(255,255,255,0.08);">
      <h3 style="color:#fff;margin:0 0 16px;font-size:16px;text-transform:uppercase;letter-spacing:1px;">
        📋 Group Rules
      </h3>

      <table width="100%" cellpadding="0" cellspacing="0">
        ${buyInAmount > 0 ? `<tr><td style="color:#94A3B8;padding:6px 0;font-size:14px;">Buy-in</td><td style="color:#E2E8F0;font-weight:700;text-align:right;font-size:14px;">$${buyInAmount} per player</td></tr>` : ""}
        ${adminFee > 0 ? `<tr><td style="color:#94A3B8;padding:6px 0;font-size:14px;">Admin fee</td><td style="color:#F59E0B;font-weight:700;text-align:right;font-size:14px;">${adminFee}% of pot</td></tr>` : ""}
        <tr><td style="color:#94A3B8;padding:6px 0;font-size:14px;">1st place</td><td style="color:#E2E8F0;font-weight:700;text-align:right;font-size:14px;">${payouts.first}% of pot</td></tr>
        <tr><td style="color:#94A3B8;padding:6px 0;font-size:14px;">2nd place</td><td style="color:#E2E8F0;font-weight:700;text-align:right;font-size:14px;">${payouts.second}% of pot</td></tr>
        <tr><td style="color:#94A3B8;padding:6px 0;font-size:14px;">3rd place</td><td style="color:#E2E8F0;font-weight:700;text-align:right;font-size:14px;">${payouts.third}% of pot</td></tr>
        <tr><td style="color:#94A3B8;padding:6px 0;font-size:14px;">Scoring</td><td style="color:#E2E8F0;font-weight:700;text-align:right;font-size:14px;">${scoringSystem}</td></tr>
      </table>

      ${rulesText ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);color:#94A3B8;font-size:14px;line-height:1.6;">${rulesText.replace(/\n/g, "<br>")}</div>` : ""}

      <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
        <p style="color:#64748B;font-size:12px;margin:0;">
          <strong style="color:#94A3B8;">Scoring system (3/2/1):</strong><br>
          3 pts exact score · 2 pts correct team + exact goals · 1 pt correct outcome<br>
          All predictions lock 5 minutes before kickoff.
        </p>
      </div>
    </div>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 40px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="color:#475569;font-size:12px;margin:0 0 8px;">
      You received this because ${adminName} invited you to their Cup Clash group.
    </p>
    <p style="color:#475569;font-size:12px;margin:0;">
      <a href="${appUrl}" style="color:#6366F1;text-decoration:none;">cupclash.com</a>
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
      memberEmails: string[];
      memberNames: string[];
      groupName: string;
      adminName: string;
      rulesText: string;
      buyInAmount: number;
      inviteCode: string;
      scoringSystem: string;
      adminFee: number;
      payouts: { first: number; second: number; third: number };
    };

    const appUrl = process.env.NEXT_PUBLIC_URL ?? "https://cupclash.com";

    // If Resend is configured, send real emails
    if (process.env.RESEND_API_KEY) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Resend } = require("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const results = await Promise.allSettled(
        body.memberEmails.map((email, i) =>
          resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: `You're invited to ${body.groupName} on Cup Clash 🏆`,
            html: generateWelcomeHtml({
              ...body,
              memberName: body.memberNames[i] ?? email.split("@")[0],
              appUrl,
            }),
          })
        )
      );

      const failed = results.filter(r => r.status === "rejected").length;
      return NextResponse.json({
        sent: results.length - failed,
        failed,
        message: `Sent ${results.length - failed} of ${results.length} emails`,
      });
    }

    // No Resend configured — log and return mock success
    console.log("[Cup Clash] Welcome email would be sent to:", body.memberEmails);
    console.log("[Cup Clash] Group:", body.groupName, "| Admin:", body.adminName);

    return NextResponse.json({
      sent: body.memberEmails.length,
      failed: 0,
      message: `Preview mode: ${body.memberEmails.length} email(s) logged (Resend not configured)`,
      preview: generateWelcomeHtml({
        ...body,
        memberName: body.memberNames[0] ?? "Member",
        appUrl,
      }),
    });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}
