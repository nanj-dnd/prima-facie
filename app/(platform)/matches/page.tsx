"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";

interface Match {
  id: string;
  other: { id: string; name: string; age: number; city: string; photos: string[] };
  created_at: string;
  lastMessage?: string;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("matches")
        .select("id, created_at, user1, user2, p1:profiles!matches_user1_fkey(id, name, age, city, photos), p2:profiles!matches_user2_fkey(id, name, age, city, photos)")
        .or(`user1.eq.${user.id},user2.eq.${user.id}`)
        .order("created_at", { ascending: false });

      const shaped = (data ?? []).map((m: Record<string, unknown>) => {
        const isUser1 = m.user1 === user.id;
        const other = (isUser1 ? m.p2 : m.p1) as Match["other"];
        return { id: m.id as string, other, created_at: m.created_at as string };
      });

      setMatches(shaped);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-6 px-4 max-w-sm mx-auto">
      <div className="mb-8">
        <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.4em] uppercase text-[#C9A84C] mb-1">Connections</p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#F5F2EC]">
          {matches.length > 0 ? `${matches.length} match${matches.length !== 1 ? "es" : ""}.` : "Your matches."}
        </h1>
      </div>

      {loading && <div className="w-px h-10 bg-gradient-to-b from-[#C9A84C] to-transparent animate-pulse mx-auto mt-20" />}

      {!loading && matches.length === 0 && (
        <div className="text-center py-20">
          <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#F5F2EC] mb-2">No matches yet.</p>
          <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F] mb-6">Go back to discover.</p>
          <Link href="/discover" className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase border border-[#C9A84C] text-[#C9A84C] px-6 py-2.5 hover:bg-[#C9A84C] hover:text-[#0A0A0A] transition-colors">
            Discover
          </Link>
        </div>
      )}

      <div className="space-y-px">
        {matches.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link href={`/messages/${m.id}`} className="flex items-center gap-4 p-4 border border-[#1A1A1A] hover:border-[#C9A84C]/20 transition-colors group">
              <div className="w-14 h-14 shrink-0 bg-[#111111] overflow-hidden">
                {m.other?.photos?.[0]
                  ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.other.photos[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full flex items-center justify-center"><span className="text-[#C9A84C]/40">◎</span></div>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#F5F2EC]">{m.other?.name}, {m.other?.age}</p>
                <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F]">{m.other?.city}</p>
              </div>
              <span className="text-[#C9A84C]/40 group-hover:text-[#C9A84C] transition-colors">→</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
