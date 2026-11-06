"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import AppNav from "@/components/AppNav";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/sign-in");
        return;
      }
      // If they don't have a profile yet and aren't on the setup page
      if (!pathname.includes("/profile/setup")) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.session.user.id)
          .maybeSingle();
        if (!prof) {
          router.replace("/profile/setup");
          return;
        }
      }
      setReady(true);
    });
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-px h-10 bg-gradient-to-b from-[#C9A84C] to-transparent animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="pb-20">{children}</div>
      <AppNav />
    </div>
  );
}
