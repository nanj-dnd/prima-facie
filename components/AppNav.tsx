"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

const NAV = [
  {
    href: "/discover",
    label: "Discover",
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? "#C9A84C" : "#8A6E2F"} strokeWidth={1.5}>
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/likes",
    label: "Likes",
    icon: (active: boolean) => (
      <svg width="22" height="22" fill={active ? "#C9A84C" : "none"} viewBox="0 0 24 24" stroke={active ? "#C9A84C" : "#8A6E2F"} strokeWidth={1.5}>
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/messages",
    label: "Messages",
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? "#C9A84C" : "#8A6E2F"} strokeWidth={1.5}>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? "#C9A84C" : "#8A6E2F"} strokeWidth={1.5}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function AppNav() {
  const pathname = usePathname();
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from("likes")
        .select("id", { count: "exact", head: true })
        .eq("to_user", user.id);
      setLikeCount(count ?? 0);
    })();
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-sm border-t border-[#1A1A1A] safe-area-inset-bottom">
      <div className="max-w-lg mx-auto flex">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-3 relative"
            >
              <div className="relative">
                {icon(active)}
                {href === "/likes" && likeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C9A84C] text-[#0A0A0A] rounded-full text-[9px] font-bold flex items-center justify-center font-[family-name:var(--font-montserrat)]">
                    {likeCount > 9 ? "9+" : likeCount}
                  </span>
                )}
              </div>
              <span className={`font-[family-name:var(--font-montserrat)] text-[9px] tracking-widest uppercase ${active ? "text-[#C9A84C]" : "text-[#8A6E2F]"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
