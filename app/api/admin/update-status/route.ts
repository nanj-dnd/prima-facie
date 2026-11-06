import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

function checkAuth(request: Request) {
  const auth = request.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

export async function POST(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await request.json();
  console.log("Admin update-status called:", { id, status, hasResendKey: !!process.env.RESEND_API_KEY });

  if (!id || !["pending", "accepted", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("applications").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch applicant details to send notification email
  const { data: applicant } = await supabase
    .from("applications")
    .select("name, email")
    .eq("id", id)
    .single();

  console.log("Applicant found:", { email: applicant?.email, name: applicant?.name });

  // Use production domain, never localhost
  const appUrl = process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://primafacie.in";

  // When accepting: add their email to the allowlist that signals the platform
  // they're cleared to create an account and sign in (the sign-in page checks this).
  if (status === "accepted" && applicant?.email) {
    const { error: allowError } = await supabase
      .from("accepted_emails")
      .upsert({ email: applicant.email.trim().toLowerCase() }, { onConflict: "email" });
    if (allowError) console.error("Failed to add to accepted_emails:", allowError.message);
    else console.log("Added to accepted_emails:", applicant.email);
  }

  // Send email via Resend if configured (fire-and-forget — don't block the response)
  if (applicant?.email && process.env.RESEND_API_KEY && (status === "accepted" || status === "rejected")) {
    console.log("Sending email to:", applicant.email, "status:", status);
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@primafacie.in";
    const firstName = applicant.name.split(" ")[0];

    const emailContent =
      status === "accepted"
        ? {
            subject: "You're in. — Prima Facie",
            html: `
              <div style="background:#0A0A0A;color:#F5F2EC;font-family:'Georgia',serif;padding:48px 32px;max-width:560px;margin:0 auto;">
                <p style="color:#C9A84C;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;margin:0 0 32px;">Prima Facie</p>
                <h1 style="font-size:42px;font-weight:300;margin:0 0 24px;line-height:1.1;">You passed.</h1>
                <p style="color:#B0AA9E;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;margin:0 0 16px;">
                  ${firstName}, the council voted. The verdict is in your favour.
                </p>
                <p style="color:#B0AA9E;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;margin:0 0 32px;">
                  Welcome to Prima Facie. Don't waste it. Head to the site and click <strong style="color:#F5F2EC;">Sign in</strong> with this email address to set up your profile.
                </p>
                <a href="${appUrl}" style="display:inline-block;background:#C9A84C;color:#0A0A0A;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;font-weight:700;padding:14px 32px;text-decoration:none;">
                  Go to primafacie.in →
                </a>
                <p style="color:#8A6E2F;font-family:Arial,sans-serif;font-size:11px;margin:40px 0 0;">
                  Prima Facie · primafacie.in
                </p>
              </div>`,
          }
        : {
            subject: "Not this time. — Prima Facie",
            html: `
              <div style="background:#0A0A0A;color:#F5F2EC;font-family:'Georgia',serif;padding:48px 32px;max-width:560px;margin:0 auto;">
                <p style="color:#C9A84C;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;margin:0 0 32px;">Prima Facie</p>
                <h1 style="font-size:42px;font-weight:300;margin:0 0 24px;line-height:1.1;">Not this time.</h1>
                <p style="color:#B0AA9E;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;margin:0 0 16px;">
                  ${firstName}, the council voted. This time, it didn't go your way.
                </p>
                <p style="color:#B0AA9E;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;margin:0 0 32px;">
                  You can reapply in 30 days. The ₹9 is non-refundable, as stated. No appeals.
                </p>
                <p style="color:#8A6E2F;font-family:Arial,sans-serif;font-size:11px;margin:40px 0 0;">
                  Prima Facie · primafacie.in · All decisions are final.
                </p>
              </div>`,
          };

    console.log("About to fetch Resend API with:", { from: fromEmail, to: applicant.email, subject: emailContent.subject });
    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [applicant.email],
          subject: emailContent.subject,
          html: emailContent.html,
        }),
      });
      const emailBody = await emailRes.text();
      if (!emailRes.ok) {
        console.error("Email send failed:", { status: emailRes.status, statusText: emailRes.statusText, body: emailBody });
      } else {
        console.log("Email sent to:", applicant.email);
      }
    } catch (err: any) {
      console.error("Email fetch error:", err?.message || err);
    }
  }

  return NextResponse.json({ success: true });
}
