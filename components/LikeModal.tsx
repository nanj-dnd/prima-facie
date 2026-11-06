"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LikeTarget {
  type: "photo" | "prompt";
  index: number;
  preview: string; // photo URL or prompt answer text
}

interface Props {
  target: LikeTarget | null;
  onConfirm: (comment: string) => void;
  onCancel: () => void;
}

export default function LikeModal({ target, onConfirm, onCancel }: Props) {
  const [comment, setComment] = useState("");

  const handleConfirm = () => {
    onConfirm(comment.trim());
    setComment("");
  };

  return (
    <AnimatePresence>
      {target && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111111] border border-[#1A1A1A] w-full max-w-sm"
          >
            {/* Preview of what they're liking */}
            <div className="border-b border-[#1A1A1A] p-5">
              {target.type === "photo" ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={target.preview} alt="" className="w-full h-32 object-cover" />
              ) : (
                <p className="font-[family-name:var(--font-cormorant)] text-lg italic text-[#F5F2EC] leading-snug">
                  &ldquo;{target.preview}&rdquo;
                </p>
              )}
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] block mb-2">
                  Add a comment (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 150))}
                  rows={3}
                  placeholder="Say something. Or don't."
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F2EC] font-[family-name:var(--font-montserrat)] text-sm px-4 py-3 outline-none focus:border-[#C9A84C] transition-colors resize-none placeholder-[#3A3A3A]"
                />
                <p className="font-[family-name:var(--font-montserrat)] text-[9px] text-[#3A3A3A] text-right mt-1">{comment.length}/150</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] border border-[#2A2A2A] py-3 hover:border-[#C9A84C]/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase bg-[#C9A84C] text-[#0A0A0A] py-3 font-semibold hover:bg-[#8A6E2F] transition-colors"
                >
                  ♥ Send like
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
