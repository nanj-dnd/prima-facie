import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: signups, error } = await supabase
    .from("notification_signups")
    .select("email");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!signups?.length) return NextResponse.json({ sent: 0 });

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@primafacie.in";
  let sent = 0;

  for (const { email } of signups) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: "Applications open in one hour. — Prima Facie",
          html: `
            <div style="background:#0A0A0A;color:#F5F2EC;font-family:'Georgia',serif;padding:48px 32px;max-width:560px;margin:0 auto;">
              <p style="color:#C9A84C;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;margin:0 0 32px;">Prima Facie</p>
              <h1 style="font-size:42px;font-weight:300;margin:0 0 24px;line-height:1.1;">One hour.</h1>
              <p style="color:#B0AA9E;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;margin:0 0 16px;">
                Applications open tonight at 11:59 PM. You asked us to remind you.
              </p>
              <p style="color:#B0AA9E;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;margin:0 0 32px;">
                500 spots per city. 250 men, 250 women. Once it's full, it's full.
              </p>
              <a href="https://primafacie.in/apply" style="display:inline-block;background:#C9A84C;color:#0A0A0A;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;font-weight:700;padding:14px 32px;text-decoration:none;">
                Apply at 11:59 PM →
              </a>
              <p style="color:#3A3A3A;font-family:Arial,sans-serif;font-size:11px;margin:40px 0 0;">
                You signed up for this reminder. Prima Facie · primafacie.in
              </p>
            </div>`,
        }),
      });
      if (res.ok) sent++;
    } catch (e) {
      console.error("Failed to send to", email, e);
    }
  }

  console.log(`Notifications sent: ${sent}/${signups.length}`);
  return NextResponse.json({ sent, total: signups.length });
}
