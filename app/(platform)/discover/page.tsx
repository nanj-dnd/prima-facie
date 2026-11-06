"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase-client";
import ProfileCard, { type Profile } from "@/components/ProfileCard";
import LikeModal from "@/components/LikeModal";

interface LikeTarget {
  type: "photo" | "prompt";
  index: number;
  preview: string;
}

interface MatchResult {
  name: string;
  photo: string;
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [idx, setIdx] = useState(0);
  const [likeTarget, setLikeTarget] = useState<LikeTarget | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [direction, setDirection] = useState<1 | -1>(1);

  const loadProfiles = useCallback(async (uid: string, city: string) => {
    // Get IDs already liked by this user
    const { data: liked } = await supabase
      .from("likes")
      .select("to_user")
      .eq("from_user", uid);
    const likedIds = liked?.map((l) => l.to_user) ?? [];

    let query = supabase
      .from("profiles")
      .select("*")
      .eq("city", city)
      .eq("is_active", true)
      .neq("id", uid)
      .limit(30);

    if (likedIds.length > 0) {
      query = query.not("id", "in", `(${likedIds.join(",")})`);
    }

    const { data } = await query;
    setProfiles(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: me } = await supabase.from("profiles").select("city").eq("id", user.id).single();
      if (me) loadProfiles(user.id, me.city);
    })();
  }, [loadProfiles]);

  const advance = () => {
    setDirection(1);
    setIdx((i) => i + 1);
  };

  const handleLike = async (comment: string) => {
    if (!likeTarget || !profiles[idx]) return;
    const target = profiles[idx];

    await supabase.from("likes").upsert({
      from_user: userId,
      to_user: target.id,
      element_type: likeTarget.type,
      element_idx: likeTarget.index,
      comment: comment || null,
    }, { onConflict: "from_user,to_user" });

    // Check reciprocal like
    const { data: reciprocal } = await supabase
      .from("likes")
      .select("id")
      .eq("from_user", target.id)
      .eq("to_user", userId)
      .maybeSingle();

    if (reciprocal) {
      // Create match (sorted IDs for uniqueness)
      const [u1, u2] = [userId, target.id].sort();
      const { error: matchErr } = await supabase.from("matches").upsert({ user1: u1, user2: u2 }, { onConflict: "user1,user2" });
      if (!matchErr) {
        setMatch({ name: target.name, photo: target.photos?.[0] ?? "" });
        setTimeout(() => { setMatch(null); advance(); }, 3000);
        setLikeTarget(null);
        return;
      }
    }

    setLikeTarget(null);
    advance();
  };

  const current = profiles[idx];

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-6">
      {/* Header */}
      <div className="px-5 mb-4 flex items-center justify-between">
        <p className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-[#C9A84C]">Prima Facie</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="w-px h-10 bg-gradient-to-b from-[#C9A84C] to-transparent animate-pulse" />
        </div>
      )}

      {!loading && !current && (
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
          <div className="w-16 h-16 border border-[#1A1A1A] flex items-center justify-center mx-auto mb-6">
            <span className="text-[#C9A84C]/40 text-2xl">◎</span>
          </div>
          <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#F5F2EC] mb-2">You&apos;ve seen everyone.</p>
          <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F] leading-relaxed">
            Come back tomorrow. New profiles are added as more people get in.
          </p>
        </div>
      )}

      {!loading && current && (
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProfileCard
              profile={current}
              onLike={(target) => setLikeTarget(target)}
              onPass={() => { setDirection(1); advance(); }}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Like modal */}
      <LikeModal target={likeTarget} onConfirm={handleLike} onCancel={() => setLikeTarget(null)} />

      {/* Match celebration */}
      <AnimatePresence>
        {match && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center px-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="space-y-6"
            >
              <div className="w-20 h-20 border border-[#C9A84C] flex items-center justify-center mx-auto">
                {match.photo
                  ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={match.photo} alt="" className="w-full h-full object-cover opacity-80" />
                  : <span className="text-[#C9A84C] text-3xl">♥</span>}
              </div>
              <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.4em] uppercase text-[#C9A84C]">
                It&apos;s a match
              </p>
              <p className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#F5F2EC]">
                You and {match.name}.
              </p>
              <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F]">
                Say something. Don&apos;t waste it.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
