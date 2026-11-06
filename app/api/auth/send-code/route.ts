import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Sends a one-time 6-digit sign-in code via our own branded email (Resend).
// Doubles as the accepted-applicant gate: only emails on the accepted_emails
// allowlist ever get a code, and the code itself proves they own the inbox.
export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const supabase = createAdminClient();

  const { data: allowed } = await supabase
    .from("accepted_emails")
    .select("email")
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (!allowed) return NextResponse.json({ error: "Not accepted" }, { status: 403 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://primafacie.in";

  // generateLink doesn't send any email itself — it just mints a verification
  // record and hands back the underlying OTP (properties.email_otp), which we
  // deliver ourselves so the user only ever sees Prima Facie's own email.
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: normalizedEmail,
    options: { redirectTo: `${appUrl}/auth/callback` },
  });

  const code = linkData?.properties?.email_otp;
  if (linkError || !code) {
    console.error("Failed to generate sign-in code:", { email: normalizedEmail, error: linkError?.message });
    return NextResponse.json({ error: "Could not generate code" }, { status: 500 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY missing — cannot send sign-in code");
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@primafacie.in";
  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [normalizedEmail],
      subject: "Your sign-in code — Prima Facie",
      html: `
        <div style="background:#0A0A0A;color:#F5F2EC;font-family:'Georgia',serif;padding:48px 32px;max-width:560px;margin:0 auto;">
          <p style="color:#C9A84C;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;margin:0 0 32px;">Prima Facie</p>
          <h1 style="font-size:36px;font-weight:300;margin:0 0 16px;line-height:1.1;">Your sign-in code</h1>
          <p style="color:#B0AA9E;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;margin:0 0 28px;">
            Enter this on primafacie.in to continue:
          </p>
          <p style="font-family:Arial,sans-serif;font-size:42px;font-weight:700;letter-spacing:0.3em;color:#C9A84C;text-align:center;margin:0 0 28px;">
            ${code}
          </p>
          <p style="color:#8A6E2F;font-family:Arial,sans-serif;font-size:11px;line-height:1.6;margin:0;">
            Expires shortly · Didn't request this? Ignore this email.<br/>Prima Facie · primafacie.in
          </p>
        </div>`,
    }),
  });

  if (!emailRes.ok) {
    const body = await emailRes.text();
    console.error("Sign-in code email failed:", { status: emailRes.status, body });
    return NextResponse.json({ error: "Could not send code" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
