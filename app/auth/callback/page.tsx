"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    (async () => {
      // Handle PKCE code exchange (Supabase v2 default)
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) { setStatus("Verification failed. Try signing in."); return; }
        if (data.session) return handleSession(data.session.user.id);
      }

      // Fallback: implicit flow (hash tokens)
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const access = hash.get("access_token");
      const refresh = hash.get("refresh_token") ?? "";
      if (access) {
        const { data } = await supabase.auth.setSession({ access_token: access, refresh_token: refresh });
        if (data.session) return handleSession(data.session.user.id);
      }

      // Try existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return handleSession(session.user.id);

      setStatus("No valid session found. Please sign in.");
      setTimeout(() => router.replace("/sign-in"), 2000);
    })();

    async function handleSession(userId: string) {
      const { data } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
      router.replace(data ? "/discover" : "/profile/setup");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <div className="w-px h-10 bg-gradient-to-b from-[#C9A84C] to-transparent mx-auto mb-6 animate-pulse" />
        <p className="font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase text-[#8A6E2F]">{status}</p>
      </div>
    </div>
  );
}
