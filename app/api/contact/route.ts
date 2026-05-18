import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      name:  string;
      email: string;
      phone: string;
      notes: string;
      type:  string;
    };

    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.log("Enterprise contact:", body);
      return NextResponse.json({ success: true });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from:    "Cup Clash <noreply@cupclash.live>",
      to:      "oran@honoshi.co.il",
      replyTo: body.email,
      subject: `🏢 Enterprise Enquiry — ${body.name} (${body.email})`,
      html: `
        <h2>New Enterprise Enquiry — Cup Clash</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold;color:#64748b">Name</td><td style="padding:8px">${body.name}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#64748b">Email</td><td style="padding:8px"><a href="mailto:${body.email}">${body.email}</a></td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#64748b">Phone</td><td style="padding:8px">${body.phone}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#64748b">Notes</td><td style="padding:8px">${body.notes || "—"}</td></tr>
        </table>
        <p style="margin-top:24px;color:#64748b;font-size:12px">Sent from cupclash.live enterprise contact form</p>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}