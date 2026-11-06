"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

interface IncomingLike {
  id: string;
  from_user: string;
  element_type: string;
  comment: string | null;
  created_at: string;
  profile: {
    name: string;
    age: number;
    city: string;
    photos: string[];
    prompts: { prompt: string; answer: string }[];
  };
}

export default function LikesPage() {
  const [likes, setLikes] = useState<IncomingLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("likes")
        .select("id, from_user, element_type, element_idx, comment, created_at, profile:profiles!likes_from_user_fkey(name, age, city, photos, prompts)")
        .eq("to_user", user.id)
        .order("created_at", { ascending: false });

      setLikes((data as unknown as IncomingLike[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const likeback = async (likeId: string, fromUserId: string, fromProfile: IncomingLike["profile"]) => {
    await supabase.from("likes").upsert({
      from_user: userId,
      to_user: fromUserId,
      element_type: "photo",
      element_idx: 0,
    }, { onConflict: "from_user,to_user" });

    // Create match
    const [u1, u2] = [userId, fromUserId].sort();
    const { data: matchData } = await supabase.from("matches").upsert({ user1: u1, user2: u2 }, { onConflict: "user1,user2" }).select("id").single();

    // Remove from list
    setLikes((prev) => prev.filter((l) => l.id !== likeId));

    if (matchData?.id) router.push(`/messages/${matchData.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-6 px-4 max-w-sm mx-auto">
      <div className="mb-8">
        <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.4em] uppercase text-[#C9A84C] mb-1">Incoming</p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#F5F2EC]">
          {likes.length > 0 ? `${likes.length} ${likes.length === 1 ? "person likes" : "people like"} you.` : "Your likes."}
        </h1>
      </div>

      {loading && <div className="w-px h-10 bg-gradient-to-b from-[#C9A84C] to-transparent animate-pulse mx-auto mt-20" />}

      {!loading && likes.length === 0 && (
        <div className="text-center py-20">
          <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#F5F2EC] mb-2">Nothing yet.</p>
          <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F]">Go discover people first.</p>
        </div>
      )}

      <div className="space-y-3">
        {likes.map((like, i) => (
          <motion.div
            key={like.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border border-[#1A1A1A] overflow-hidden"
          >
            <div className="flex gap-4 p-4">
              {/* Blurred photo until they like back */}
              <div className="w-16 h-16 shrink-0 bg-[#111111] overflow-hidden relative">
                {like.profile?.photos?.[0] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={like.profile.photos[0]} alt="" className="w-full h-full object-cover blur-sm scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#C9A84C]/40 text-xl">◎</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#F5F2EC]">
                  {like.profile?.name}, {like.profile?.age}
                </p>
                <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F]">{like.profile?.city}</p>
                {like.comment && (
                  <p className="font-[family-name:var(--font-cormorant)] text-sm italic text-[#B0AA9E] mt-1 truncate">
                    &ldquo;{like.comment}&rdquo;
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-px border-t border-[#1A1A1A]">
              <button
                onClick={() => setLikes((prev) => prev.filter((l) => l.id !== like.id))}
                className="flex-1 font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] py-3 hover:text-[#B0AA9E] transition-colors"
              >
                Pass
              </button>
              <button
                onClick={() => likeback(like.id, like.from_user, like.profile)}
                className="flex-1 font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase bg-[#C9A84C] text-[#0A0A0A] py-3 font-semibold hover:bg-[#8A6E2F] transition-colors"
              >
                ♥ Match
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
