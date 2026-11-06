"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase-client";
import { type Profile } from "@/components/ProfileCard";
import ProfileCard from "@/components/ProfileCard";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      setLoading(false);
    })();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/sign-in");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-6 pb-6 max-w-sm mx-auto px-0">
      <div className="px-4 mb-6 flex items-center justify-between">
        <div>
          <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.4em] uppercase text-[#C9A84C] mb-1">Your profile</p>
          <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F]">This is what others see.</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/profile/setup")}
            className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase border border-[#C9A84C]/40 text-[#C9A84C] px-4 py-2 hover:border-[#C9A84C] transition-colors"
          >
            Edit
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={signOut}
            className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase border border-[#2A2A2A] text-[#8A6E2F] px-4 py-2 hover:border-[#C9A84C]/30 transition-colors"
          >
            Sign out
          </motion.button>
        </div>
      </div>

      {loading && <div className="w-px h-10 bg-gradient-to-b from-[#C9A84C] to-transparent animate-pulse mx-auto mt-20" />}

      {!loading && !profile && (
        <div className="text-center py-20 px-4">
          <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#F5F2EC] mb-3">No profile yet.</p>
          <button onClick={() => router.push("/profile/setup")} className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase bg-[#C9A84C] text-[#0A0A0A] px-8 py-3 font-semibold">
            Set up profile
          </button>
        </div>
      )}

      {!loading && profile && (
        <ProfileCard
          profile={profile}
          onLike={() => {}}
          onPass={() => {}}
        />
      )}
    </div>
  );
}
