"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [step, setStep] = useState<"email" | "code" | "verify">("email");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) redirectAfterAuth(data.session.user.id);
      else setCheckingSession(false);
    });
  }, []);

  const redirectAfterAuth = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
    router.replace(data ? "/discover" : "/profile/setup");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Enter your email."); return; }
    setLoading(true);
    setError("");

    // Check profile first (returning user)
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", email.trim().toLowerCase()).maybeSingle();
    if (profile) {
      setStep("code");
      setLoading(false);
      return;
    }

    // No profile yet — send a one-time code. The endpoint itself checks the
    // accepted_emails allowlist, so a single call both verifies "accepted" and
    // proves they own the inbox once they enter the code back.
    const res = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok && data.success) {
      setStep("verify");
      return;
    }
    if (res.status === 403) {
      setError("Email not found. Apply first and get accepted.");
      return;
    }
    setError("Couldn't send your code. Try again in a moment.");
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode || verifyCode.length !== 6) { setError("Enter the 6-digit code from your email."); return; }
    setLoading(true);
    setError("");

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: verifyCode,
      type: "email",
    });

    setLoading(false);
    if (verifyError || !data.session) {
      setError("Incorrect or expired code. Try again.");
      return;
    }
    await redirectAfterAuth(data.session.user.id);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) { setError("Enter a valid 6-digit code."); return; }
    setLoading(true);
    setError("");

    // Get user profile with the code
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("profiles").select("id, login_code").eq("email", email).maybeSingle();

    // If no auth user, we need to find the user_id from email
    const { data: emailProfile } = await supabase.from("profiles").select("id, login_code").eq("email", email).single();

    if (!emailProfile) {
      setError("Profile not found.");
      setLoading(false);
      return;
    }

    if (emailProfile.login_code !== code) {
      setError("Incorrect code.");
      setLoading(false);
      return;
    }

    // Create session using the user_id from profile
    const { data: { session }, error: signInError } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (signInError) {
      // Fallback: try to get existing user
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      const existingUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

      if (existingUser) {
        await redirectAfterAuth(existingUser.id);
      } else {
        setError("Could not sign in. Try applying again.");
      }
      setLoading(false);
      return;
    }

    await redirectAfterAuth(emailProfile.id);
  };

  const inputClass = "w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F2EC] font-[family-name:var(--font-montserrat)] text-sm px-4 py-3.5 outline-none focus:border-[#C9A84C] transition-colors placeholder-[#3A3A3A]";

  if (checkingSession) {
    return <div className="min-h-screen bg-[#0A0A0A]" />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <Link href="/" className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-widest text-[#C9A84C] block mb-10">
          Prima Facie
        </Link>

        <motion.form
          onSubmit={step === "email" ? handleEmailSubmit : step === "verify" ? handleVerifySubmit : handleCodeSubmit}
          noValidate
          className="space-y-4"
        >
          {step === "email" && (
            <div>
              <label className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className={inputClass}
                autoFocus
              />
            </div>
          )}

          {step === "verify" && (
            <>
              <div>
                <label className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] block mb-2">
                  Your sign-in code
                </label>
                <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F] mb-3 leading-relaxed">
                  Sent to <span className="text-[#C9A84C]">{email}</span> — enter it below.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  required
                  className={`${inputClass} text-center text-lg tracking-widest font-semibold`}
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => { setStep("email"); setVerifyCode(""); setError(""); }}
                className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F] hover:text-[#C9A84C] transition-colors"
              >
                ← Use a different email
              </button>
            </>
          )}

          {step === "code" && (
            <>
              <div>
                <label className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] block mb-2">
                  Your 6-digit code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  required
                  className={`${inputClass} text-center text-lg tracking-widest font-semibold`}
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => { setStep("email"); setCode(""); setError(""); }}
                className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F] hover:text-[#C9A84C] transition-colors"
              >
                ← Change email
              </button>
            </>
          )}

          {error && <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500">{error}</p>}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-[#C9A84C] text-[#0A0A0A] font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase font-semibold py-4 hover:bg-[#8A6E2F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "..." : step === "email" ? "Continue" : "Sign in"}
          </motion.button>

          <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F] text-center leading-relaxed">
            Only accepted applicants can sign in.
          </p>
        </motion.form>
      </motion.div>
    </div>
  );
}
