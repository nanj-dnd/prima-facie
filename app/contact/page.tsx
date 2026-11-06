"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";

const SUBJECTS = [
  "General inquiry",
  "Application status",
  "Account issue",
  "Report a bug",
  "Media / press",
  "Partnership",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "We need your name.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Give us a real email.";
    if (!form.message.trim()) e.message = "Say something.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch {
      setErrors({ submit: "Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (f: string) =>
    `w-full bg-[#1A1A1A] border ${errors[f] ? "border-red-800" : "border-[#2A2A2A]"} text-[#F5F2EC] font-[family-name:var(--font-montserrat)] text-sm px-4 py-3.5 outline-none focus:border-[#C9A84C] transition-colors placeholder-[#3A3A3A]`;

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#0A0A0A] pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-20 items-start">
          {/* Left */}
          <div className="lg:sticky lg:top-32">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.5em] uppercase text-[#C9A84C] mb-4">
                Contact
              </p>
              <h1 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,5vw,4rem)] font-light leading-tight text-[#F5F2EC] mb-6">
                Say something.
              </h1>
              <p className="font-[family-name:var(--font-montserrat)] text-sm leading-relaxed text-[#B0AA9E] mb-10">
                We read every message. We don&apos;t promise to reply to all of them. That&apos;s not cruelty — that&apos;s honesty about our bandwidth.
              </p>

              <div className="space-y-4">
                {[
                  ["Application questions", "Check your email first. We send updates there."],
                  ["Bugs & issues", "Describe exactly what broke and on which device."],
                  ["Press & media", "We&apos;re interesting. We know. Send your credentials."],
                ].map(([title, note]) => (
                  <div key={title as string} className="border-l border-[#C9A84C]/20 pl-4">
                    <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#C9A84C] mb-1">
                      {title as string}
                    </p>
                    <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F] leading-relaxed">
                      {note as string}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            {sent ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 border border-[#C9A84C] flex items-center justify-center mx-auto mb-6">
                  <span className="text-[#C9A84C] text-xl">✦</span>
                </div>
                <p className="font-[family-name:var(--font-cormorant)] text-3xl text-[#F5F2EC] mb-3">Message received.</p>
                <p className="font-[family-name:var(--font-montserrat)] text-sm text-[#B0AA9E]">We&apos;ll get back to you if it warrants a reply.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] block mb-2">Name</label>
                  <input type="text" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }} placeholder="Your name" className={inputClass("name")} />
                  {errors.name && <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500 mt-1.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] block mb-2">Email</label>
                  <input type="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }} placeholder="your@email.com" className={inputClass("email")} />
                  {errors.email && <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500 mt-1.5">{errors.email}</p>}
                </div>

                <div>
                  <label className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] block mb-2">Subject</label>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={`${inputClass("subject")} cursor-pointer`}>
                    <option value="" className="bg-[#1A1A1A]">Select a topic</option>
                    {SUBJECTS.map((s) => <option key={s} value={s} className="bg-[#1A1A1A]">{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] block mb-2">Message</label>
                  <textarea value={form.message} onChange={(e) => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: "" }); }} rows={6} placeholder="What do you want to say?" className={`${inputClass("message")} resize-none`} />
                  {errors.message && <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500 mt-1.5">{errors.message}</p>}
                </div>

                {errors.submit && <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500">{errors.submit}</p>}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full bg-[#C9A84C] text-[#0A0A0A] font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase font-semibold py-4 hover:bg-[#8A6E2F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send message"}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
