"use client";

import { motion } from "framer-motion";

export interface Profile {
  id: string;
  name: string;
  age: number;
  city: string;
  gender: string;
  photos: string[];
  prompts: { prompt: string; answer: string }[];
}

interface LikeTarget {
  type: "photo" | "prompt";
  index: number;
  preview: string;
}

interface Props {
  profile: Profile;
  onLike: (target: LikeTarget) => void;
  onPass: () => void;
}

function HeartButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="w-10 h-10 bg-[#0A0A0A]/80 backdrop-blur-sm border border-[#C9A84C]/40 flex items-center justify-center hover:bg-[#C9A84C] hover:border-[#C9A84C] transition-colors duration-200 group"
    >
      <span className="text-[#C9A84C] group-hover:text-[#0A0A0A] transition-colors">♥</span>
    </motion.button>
  );
}

export default function ProfileCard({ profile, onLike, onPass }: Props) {
  const { name, age, city, photos, prompts } = profile;

  // Build sections: interleave photos and prompts like Hinge
  const sections: Array<{ kind: "photo" | "info" | "prompt"; idx: number }> = [];
  sections.push({ kind: "photo", idx: 0 });
  sections.push({ kind: "info", idx: 0 });

  const maxPrompts = Math.min(prompts?.length ?? 0, 3);
  const extraPhotos = photos?.slice(1) ?? [];

  for (let i = 0; i < maxPrompts; i++) {
    if (extraPhotos[i]) sections.push({ kind: "photo", idx: i + 1 });
    sections.push({ kind: "prompt", idx: i });
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="space-y-px">
        {sections.map((s, si) => {
          if (s.kind === "photo") {
            const url = photos?.[s.idx];
            if (!url) return null;
            return (
              <div key={`photo-${s.idx}`} className="relative bg-[#111111] aspect-[4/5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-3 right-3">
                  <HeartButton onClick={() => onLike({ type: "photo", index: s.idx, preview: url })} />
                </div>
              </div>
            );
          }

          if (s.kind === "info") {
            return (
              <div key="info" className="bg-[#111111] px-5 py-5">
                <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#F5F2EC] leading-none">
                  {name}, <span className="text-[#C9A84C]">{age}</span>
                </h2>
                <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.3em] uppercase text-[#8A6E2F] mt-2">
                  {city}
                </p>
                <div className="w-8 h-px bg-[#C9A84C]/40 mt-4" />
              </div>
            );
          }

          if (s.kind === "prompt") {
            const p = prompts?.[s.idx];
            if (!p) return null;
            return (
              <div key={`prompt-${s.idx}`} className="relative bg-[#111111] px-5 py-6 min-h-[140px] flex flex-col justify-between">
                <div>
                  <p className="font-[family-name:var(--font-montserrat)] text-[9px] tracking-[0.3em] uppercase text-[#C9A84C]/60 mb-3">
                    {p.prompt}
                  </p>
                  <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#F5F2EC] leading-snug">
                    {p.answer}
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                  <HeartButton onClick={() => onLike({ type: "prompt", index: s.idx, preview: p.answer })} />
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Pass button */}
      <div className="px-5 py-6 bg-[#0A0A0A] flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPass}
          className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] border border-[#2A2A2A] px-12 py-3 hover:border-[#C9A84C]/30 hover:text-[#B0AA9E] transition-colors"
        >
          Pass
        </motion.button>
      </div>
    </div>
  );
}
