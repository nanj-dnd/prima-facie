"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase-client";

const PROMPTS = [
  "The most spontaneous thing I've done",
  "A non-negotiable for me is",
  "I'll know it's time to delete this app when",
  "My most controversial opinion",
  "The way to win me over is",
  "Right now I'm obsessed with",
  "My ideal Sunday looks like",
  "I'm the type of person who",
  "Two truths and a lie",
  "We'll get along if",
  "My simple pleasures",
  "I'm secretly good at",
  "My friends would describe me as",
  "I want someone who",
  "I go crazy for",
  "Something nobody knows about me",
  "I can't stop talking about",
  "My love language is",
  "I'm weirdly attracted to",
  "My biggest green flag is",
  "A perfect day for me includes",
  "I'm still figuring out",
  "I know it's going well when",
  "The most Delhi NCR / Mumbai thing about me",
  "I'd rather spend Saturday",
];

type Step = 1 | 2;

export default function ProfileSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [photos, setPhotos] = useState<string[]>([]); // public URLs
  const [uploading, setUploading] = useState<number | null>(null);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loginCode, setLoginCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── Photo upload ─────────────────────────────────────────────────────────────
  const uploadPhoto = useCallback(async (file: File, slot: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUploading(slot);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("prima-facie-profiles")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadErr) { setError("Photo upload failed. Try again."); setUploading(null); return; }

    const { data: { publicUrl } } = supabase.storage.from("prima-facie-profiles").getPublicUrl(path);
    console.log("Photo uploaded:", { path, publicUrl });

    setPhotos((prev) => {
      const updated = [...prev];
      updated[slot] = publicUrl;
      return updated;
    });
    setUploading(null);
  }, []);

  const togglePrompt = (p: string) => {
    setSelectedPrompts((prev) => {
      if (prev.includes(p)) return prev.filter((x) => x !== p);
      if (prev.length >= 3) return prev;
      return [...prev, p];
    });
  };

  // ── Save profile ─────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    const validPhotos = photos.filter(Boolean);
    if (validPhotos.length < 6) { setError("Add all 6 photos. No exceptions."); return; }
    if (selectedPrompts.length < 3) { setError("Choose 3 prompts and write answers."); return; }
    const unanswered = selectedPrompts.filter((p) => !answers[p]?.trim());
    if (unanswered.length) { setError("Answer all 3 prompts."); return; }
    if (!loginCode || loginCode.length !== 6 || !/^\d{6}$/.test(loginCode)) { setError("Create a 6-digit code (numbers only)."); return; }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/sign-in"); return; }

    // Get their application details (any status)
    const { data: app } = await supabase
      .from("applications")
      .select("name, age, city, gender")
      .eq("email", user.email ?? "")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const promptData = selectedPrompts.map((p) => ({ prompt: p, answer: answers[p].trim() }));

    const { error: insertErr } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      name: app?.name ?? user.email?.split("@")[0] ?? "Member",
      age: app?.age ?? 24,
      city: app?.city ?? "Mumbai",
      gender: app?.gender ?? "Unknown",
      photos: validPhotos,
      prompts: promptData,
      login_code: loginCode,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    if (insertErr) { setError(insertErr.message); setSaving(false); return; }
    router.replace("/discover");
  };

  const photoSlotClass = "aspect-square border border-[#2A2A2A] bg-[#111111] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#C9A84C]/40 transition-colors relative";

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 pt-12 pb-8 max-w-sm mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.4em] uppercase text-[#C9A84C] mb-2">
          Step {step} of 2
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#F5F2EC]">
          {step === 1 ? "Add your photos." : "Your prompts."}
        </h1>
        <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F] mt-2">
          {step === 1
            ? "Up to 6 photos. First one is your primary. Make it count."
            : "Choose 3. Write honest answers. People will like these."}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* 6-slot photo grid */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <label key={i} className={photoSlotClass}>
                  {photos[i] ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photos[i]} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 font-[family-name:var(--font-montserrat)] text-[8px] tracking-widest uppercase bg-[#C9A84C] text-[#0A0A0A] px-1 py-0.5">
                          Main
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[#3A3A3A] text-xl">
                      {uploading === i ? "..." : "+"}
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadPhoto(f, i);
                    }}
                  />
                </label>
              ))}
            </div>

            <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F] mb-6 leading-relaxed">
              Clear face in the first photo. No group shots as your first photo. No filter abuse.
            </p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            {/* Selected prompts with answer inputs */}
            {selectedPrompts.map((p, i) => (
              <div key={p} className="border border-[#C9A84C]/20 p-4">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#C9A84C] flex-1 pr-4">{p}</p>
                  <button onClick={() => togglePrompt(p)} className="text-[#8A6E2F] hover:text-red-500 transition-colors text-xs">✕</button>
                </div>
                <textarea
                  value={answers[p] ?? ""}
                  onChange={(e) => setAnswers({ ...answers, [p]: e.target.value.slice(0, 150) })}
                  rows={2}
                  placeholder="Your answer..."
                  className="w-full bg-transparent border-b border-[#2A2A2A] focus:border-[#C9A84C] text-[#F5F2EC] font-[family-name:var(--font-cormorant)] text-lg italic py-1 outline-none transition-colors placeholder-[#3A3A3A] resize-none"
                />
                <p className="font-[family-name:var(--font-montserrat)] text-[9px] text-[#3A3A3A] text-right mt-1">
                  {(answers[p] ?? "").length}/150
                </p>
              </div>
            ))}

            {selectedPrompts.length < 3 && (
              <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#C9A84C] text-center">
                Choose {3 - selectedPrompts.length} more prompt{3 - selectedPrompts.length !== 1 ? "s" : ""}
              </p>
            )}

            {/* Prompt picker */}
            <div className="space-y-1 max-h-64 overflow-y-auto mb-6">
              {PROMPTS.filter((p) => !selectedPrompts.includes(p)).map((p) => (
                <button
                  key={p}
                  onClick={() => togglePrompt(p)}
                  disabled={selectedPrompts.length >= 3}
                  className="w-full text-left font-[family-name:var(--font-montserrat)] text-xs text-[#B0AA9E] px-4 py-3 border border-[#1A1A1A] hover:border-[#C9A84C]/30 hover:text-[#F5F2EC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Login code setup */}
            <div>
              <label className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] block mb-2">
                Create a 6-digit code (to sign in later)
              </label>
              <input
                type="text"
                maxLength={6}
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F2EC] font-[family-name:var(--font-montserrat)] text-center text-lg tracking-widest px-4 py-3 outline-none focus:border-[#C9A84C] transition-colors placeholder-[#3A3A3A]"
              />
              <p className="font-[family-name:var(--font-montserrat)] text-[9px] text-[#8A6E2F] mt-1">
                Numbers only. You'll use this code to sign in.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500 mt-4">{error}</p>}

      <div className="mt-8 flex gap-3">
        {step === 2 && (
          <button onClick={() => setStep(1)} className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] hover:text-[#C9A84C] transition-colors">
            ← Back
          </button>
        )}
        <button
          onClick={() => {
            if (step === 1) {
              if (photos.filter(Boolean).length === 0) { setError("Add at least one photo."); return; }
              setError("");
              setStep(2);
            } else {
              saveProfile();
            }
          }}
          disabled={saving}
          className="ml-auto font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase bg-[#C9A84C] text-[#0A0A0A] px-10 py-3.5 font-semibold hover:bg-[#8A6E2F] transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : step === 1 ? "Continue →" : "Enter Prima Facie"}
        </button>
      </div>
    </div>
  );
}
