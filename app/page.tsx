"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { fetchApplicationsOpen } from "./apply/page";

// ─── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12 },
  }),
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} variants={fadeUp} custom={delay} initial="hidden" animate={inView ? "visible" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 80]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-[#C9A84C]/30 to-transparent" />
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-[#C9A84C]/30 to-transparent" />

      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col items-center">
          <motion.p variants={fadeUp} custom={0} className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.5em] uppercase text-[#C9A84C] mb-6">
            Mumbai · Delhi NCR · Bangalore · Hyderabad · Chennai · Pune · Kolkata · Kochi
          </motion.p>

          <motion.h1 variants={fadeUp} custom={1} className="font-[family-name:var(--font-cormorant)] text-[clamp(4rem,14vw,11rem)] font-light leading-none tracking-tight text-[#F5F2EC] mb-4">
            Prima<br />
            <em className="text-[#C9A84C] italic">Facie</em>
          </motion.h1>

          <motion.div variants={fadeUp} custom={2} className="w-24 h-px bg-[#C9A84C] my-8" />

          <motion.p variants={fadeUp} custom={3} className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl font-light text-[#B0AA9E] max-w-xl leading-relaxed">
            At first sight. We decide if you&apos;re attractive enough to be here.
          </motion.p>

          <motion.div variants={fadeUp} custom={4} className="flex flex-col sm:flex-row gap-4 mt-12">
            <Link href="/apply" className="font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase bg-[#C9A84C] text-[#0A0A0A] px-10 py-4 font-semibold hover:bg-[#8A6E2F] transition-colors duration-300">
              Apply — ₹9
            </Link>
            <a href="/#how-it-works" className="font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase border border-[#C9A84C]/40 text-[#C9A84C] px-10 py-4 hover:border-[#C9A84C] transition-colors duration-300">
              How it works
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-[family-name:var(--font-montserrat)] text-[9px] tracking-widest uppercase text-[#8A6E2F]">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-px h-8 bg-gradient-to-b from-[#C9A84C] to-transparent" />
      </motion.div>
    </section>
  );
}

// ─── First Batch Banner ───────────────────────────────────────────────────────
function FirstBatch() {
  return (
    <section className="relative py-20 bg-[#0D0D0D] border-t border-b border-[#C9A84C]/20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#C9A84C06_0%,_transparent_70%)]" />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <FadeUp>
          <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.5em] uppercase text-[#C9A84C] mb-6">
            Founding Batch · Limited
          </p>
        </FadeUp>
        <FadeUp delay={1}>
          <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.8rem,7vw,5.5rem)] font-light leading-none text-[#F5F2EC] mb-4">
            500 per city.<br />
            <em className="text-[#C9A84C] italic">No more.</em>
          </h2>
        </FadeUp>
        <FadeUp delay={2}>
          <p className="font-[family-name:var(--font-montserrat)] text-sm text-[#B0AA9E] leading-relaxed max-w-lg mx-auto mb-12">
            Each city gets 500 spots. First batch. Strictly enforced.
          </p>
        </FadeUp>
        <FadeUp delay={3}>
          <div className="flex items-center justify-center gap-0">
            <div className="flex-1 max-w-[200px] border border-[#C9A84C]/30 p-8 text-center">
              <p className="font-[family-name:var(--font-cormorant)] text-6xl font-light text-[#C9A84C] leading-none mb-3">250</p>
              <div className="w-8 h-px bg-[#C9A84C]/40 mx-auto mb-3" />
              <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.3em] uppercase text-[#8A6E2F]">Men</p>
            </div>
            <div className="w-px h-24 bg-[#C9A84C]/20" />
            <div className="flex-1 max-w-[200px] border border-[#C9A84C]/30 p-8 text-center">
              <p className="font-[family-name:var(--font-cormorant)] text-6xl font-light text-[#C9A84C] leading-none mb-3">250</p>
              <div className="w-8 h-px bg-[#C9A84C]/40 mx-auto mb-3" />
              <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.3em] uppercase text-[#8A6E2F]">Women</p>
            </div>
          </div>
        </FadeUp>
        <FadeUp delay={4}>
          <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F] mt-10 tracking-wide">
            Per city. Once it&apos;s full, it&apos;s full. No exceptions. No waitlist.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Manifesto ────────────────────────────────────────────────────────────────
function Manifesto() {
  return (
    <section className="relative py-32 bg-[#0A0A0A] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#C9A84C08_0%,_transparent_70%)]" />
      <div className="max-w-4xl mx-auto px-6">
        <FadeUp className="mb-10">
          <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.5em] uppercase text-[#C9A84C]">Manifesto</p>
        </FadeUp>
        <FadeUp delay={1}>
          <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,6vw,5rem)] font-light leading-tight text-[#F5F2EC] mb-10">
            Every dating app filters by looks.<br />
            <em className="text-[#C9A84C] italic">We just don&apos;t lie about it.</em>
          </h2>
        </FadeUp>
        <FadeUp delay={2}>
          <p className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl font-light leading-relaxed text-[#B0AA9E] max-w-3xl">
            You&apos;re attractive, or you&apos;re not. Prima Facie doesn&apos;t pretend otherwise.
          </p>
        </FadeUp>
        <FadeUp delay={2.5} className="mt-10">
          <div className="border-l border-[#C9A84C]/30 pl-6 max-w-xl">
            <p className="font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase text-[#C9A84C] mb-2">
              No paid marketing. Ever.
            </p>
            <p className="font-[family-name:var(--font-montserrat)] text-xs leading-relaxed text-[#8A6E2F]">
              Hot people tell other hot people. Every person here found out through someone already inside. That&apos;s not a strategy. It&apos;s a feature.
            </p>
          </div>
        </FadeUp>
        <FadeUp delay={3} className="mt-16">
          <div className="border-l-2 border-[#C9A84C] pl-8">
            <p className="font-[family-name:var(--font-cormorant)] text-lg md:text-xl font-light italic text-[#B0AA9E] leading-relaxed">
              &ldquo;The most honest dating app ever built — or the most offensive. Depends entirely on how you feel about mirrors.&rdquo;
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { number: "01", title: "Apply", body: "₹9 non-refundable. Submit your photo. We judge it.", note: "No refunds. No appeals. That's the deal." },
    { number: "02", title: "The Council votes", body: "Your application goes to existing members. They cast a verdict. Majority rules. You get an email either way.", note: "Democracy for the attractive." },
    { number: "03", title: "Match", body: "Curated pool. 1:1 ratio enforced per city. Everyone here earned their place.", note: "No filler. No charity matches." },
  ];

  return (
    <section id="how-it-works" className="py-32 bg-[#111111] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <FadeUp className="mb-20 text-center">
          <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.5em] uppercase text-[#C9A84C] mb-4">The Process</p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,6vw,4.5rem)] font-light text-[#F5F2EC]">How it works</h2>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-0">
          {steps.map((step, i) => (
            <FadeUp key={step.number} delay={i + 1}>
              <div className="relative p-10 border border-[#1A1A1A] group hover:border-[#C9A84C]/30 transition-colors duration-500 h-full">
                <p className="font-[family-name:var(--font-cormorant)] text-7xl font-light text-[#C9A84C]/10 absolute top-6 right-8 group-hover:text-[#C9A84C]/20 transition-colors duration-500">{step.number}</p>
                <div className="relative z-10">
                  <div className="w-8 h-px bg-[#C9A84C] mb-8" />
                  <h3 className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#F5F2EC] mb-4">{step.title}</h3>
                  <p className="font-[family-name:var(--font-montserrat)] text-sm leading-relaxed text-[#B0AA9E] mb-6">{step.body}</p>
                  <p className="font-[family-name:var(--font-cormorant)] text-base italic text-[#C9A84C]/60">{step.note}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── The Council ──────────────────────────────────────────────────────────────
function Council() {
  return (
    <section className="relative py-32 bg-[#0A0A0A] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#C9A84C06_0%,_transparent_60%)]" />
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <FadeUp>
          <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.5em] uppercase text-[#C9A84C] mb-4">Community vetting</p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,5vw,4rem)] font-light leading-tight text-[#F5F2EC] mb-6">
            Your fate is in<br /><em className="text-[#C9A84C] italic">their hands.</em>
          </h2>
          <p className="font-[family-name:var(--font-montserrat)] text-sm leading-relaxed text-[#B0AA9E]">
            Your application doesn&apos;t go to a faceless algorithm or a bored intern. It goes to them — the people already inside. Prima Facie&apos;s founding members review each applicant and cast a vote. Majority decides. There is no appeal.
          </p>
          <p className="font-[family-name:var(--font-montserrat)] text-sm leading-relaxed text-[#B0AA9E] mt-4">
            This is how exclusivity actually works. Not a waitlist. Not a random shuffle. A verdict from people who earned their place exactly the way you&apos;re trying to.
          </p>
        </FadeUp>

        <FadeUp delay={2}>
          <div className="space-y-4">
            {[
              ["The bar is set by the bar", "Members vote based on their own standard. No rubric. No criteria. Pure instinct."],
              ["Anonymous and binding", "Voters are not disclosed. Results are final. This is not a democracy with appeals."],
              ["Existing members set the tone", "The people already here define what Prima Facie looks like. You are applying to their world."],
            ].map(([title, body]) => (
              <div key={title as string} className="border border-[#1A1A1A] p-5 hover:border-[#C9A84C]/20 transition-colors duration-500">
                <p className="font-[family-name:var(--font-cormorant)] text-lg text-[#F5F2EC] mb-2">{title as string}</p>
                <p className="font-[family-name:var(--font-montserrat)] text-xs leading-relaxed text-[#B0AA9E]">{body as string}</p>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, body, delay }: { icon: string; title: string; body: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} variants={fadeUp} custom={delay} initial="hidden" animate={inView ? "visible" : "hidden"}
      className="p-6 bg-[#0A0A0A] border-r border-b border-[#1A1A1A] hover:bg-[#111111] transition-colors duration-300 group">
      <span className="text-xl text-[#C9A84C]/40 mb-4 block group-hover:text-[#C9A84C]/70 transition-colors duration-300">{icon}</span>
      <h4 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-[#F5F2EC] mb-2">{title}</h4>
      <p className="font-[family-name:var(--font-montserrat)] text-xs leading-relaxed text-[#B0AA9E]">{body}</p>
    </motion.div>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const categories = [
    {
      name: "Matching & Pool Quality",
      features: [
        { icon: "✦", title: "Verified attractiveness", body: "Every profile manually reviewed. No catfishing. No exceptions." },
        { icon: "⊕", title: "1:1 gender ratio", body: "Enforced per city. Men don't drown. Women don't get bombarded. Radical concept." },
        { icon: "◈", title: "No algorithm", body: "You see people. They see you. No black box deciding your worth for you." },
        { icon: "◎", title: "City-level matching", body: "Mumbai matches in Mumbai. Your pool is local, real, and meetable." },
      ],
    },
    {
      name: "Messaging",
      features: [
        { icon: "◉", title: "Message anyone, anytime", body: "You earned your place. So did they. Message freely — no match required." },
        { icon: "◯", title: "Block & disappear", body: "Block someone and you vanish from their feed entirely. Not \"hidden.\" Gone." },
        { icon: "◐", title: "No read receipts by default", body: "You decide if people know you've read their message. Anxiety is optional." },
        { icon: "◑", title: "Incognito browsing", body: "Browse profiles without triggering a \"seen\" notification. Look without being seen looking." },
      ],
    },
    {
      name: "Privacy & Safety",
      features: [
        { icon: "◫", title: "Photo privacy mode", body: "Your photos are blurred to everyone until you mutually show interest. Nobody's screenshotting your face to send to their group chat." },
        { icon: "⊘", title: "No social login", body: "We don't touch your Instagram, LinkedIn, or Facebook. Your social life is yours." },
        { icon: "◻", title: "Profile not searchable", body: "You cannot be found by name, number, or email. You exist on Prima Facie only within Prima Facie." },
        { icon: "◐", title: "Screenshot detection", body: "We detect and flag screenshot attempts within the app. We can't stop them all. But we make people think twice." },
      ],
    },
    {
      name: "Data & Security",
      features: [
        { icon: "◬", title: "No data sold. Ever.", body: "We make money from ₹9 applications and ₹5,999 subscriptions. Not from selling your face to advertisers." },
        { icon: "◭", title: "Photos deleted post-rejection", body: "If you're rejected, your photos are deleted within 48 hours. We don't keep a database of people we said no to." },
        { icon: "◈", title: "End-to-end encrypted messages", body: "Your conversations are unreadable to us. We don't want to read them. We genuinely don't care what you're saying." },
        { icon: "⊛", title: "Two-factor authentication", body: "Your account is yours. We make it hard for anyone else to get in." },
        { icon: "◆", title: "Annual third-party security audit", body: "We hire people to try to break us. Then we fix what they find. Results published publicly." },
      ],
    },
    {
      name: "Moderation & Trust",
      features: [
        { icon: "⊟", title: "Real humans review reports", body: "Not a bot. An actual person reads every report within 24 hours." },
        { icon: "⊠", title: "Zero tolerance: explicit unsolicited content", body: "First offence is a permanent ban. We don't do warnings for this." },
        { icon: "⊡", title: "ID-verified age gate", body: "Everyone on this platform is 18–28. Verified. Not self-reported." },
        { icon: "⊞", title: "Community decides who's in", body: "Existing members vote on applications. The gatekeepers are the people already inside." },
      ],
    },
  ];

  return (
    <section id="features" className="py-32 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6">
        <FadeUp className="mb-20 text-center">
          <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.5em] uppercase text-[#C9A84C] mb-4">What you get</p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,6vw,4.5rem)] font-light text-[#F5F2EC]">Features</h2>
        </FadeUp>
        <div className="space-y-20">
          {categories.map((cat, catIdx) => (
            <div key={cat.name}>
              <FadeUp delay={catIdx * 0.5}>
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-8 h-px bg-[#C9A84C]" />
                  <h3 className="font-[family-name:var(--font-montserrat)] text-[11px] tracking-[0.4em] uppercase text-[#C9A84C]">{cat.name}</h3>
                </div>
              </FadeUp>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#1A1A1A]">
                {cat.features.map((f, i) => (
                  <FeatureCard key={f.title} icon={f.icon} title={f.title} body={f.body} delay={(catIdx + i) * 0.08} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Apply CTA ────────────────────────────────────────────────────────────────
function ApplyCTA() {
  return (
    <section id="apply" className="py-32 bg-[#111111]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <FadeUp>
          <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.5em] uppercase text-[#C9A84C] mb-4">Application</p>
        </FadeUp>
        <FadeUp delay={1}>
          <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,6vw,5rem)] font-light leading-tight text-[#F5F2EC] mb-6">
            Think you have what it takes?
          </h2>
        </FadeUp>
        <FadeUp delay={2}>
          <p className="font-[family-name:var(--font-montserrat)] text-sm leading-relaxed text-[#B0AA9E] max-w-lg mx-auto mb-4">
            Submit your photo. We judge it. Our council votes. You find out within 72 hours.
          </p>
          <p className="font-[family-name:var(--font-montserrat)] text-[11px] text-[#C9A84C]/70 tracking-wide mb-12">
            500 per city · 250 men · 250 women · No exceptions.
          </p>
        </FadeUp>
        <FadeUp delay={3} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/apply" className="font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase bg-[#C9A84C] text-[#0A0A0A] px-12 py-5 font-semibold hover:bg-[#8A6E2F] transition-colors duration-300 w-full sm:w-auto text-center">
            Apply — ₹9
          </Link>
          <div className="border border-[#1A1A1A] px-8 py-5 text-center">
            <p className="font-[family-name:var(--font-cormorant)] text-3xl text-[#C9A84C] font-light">₹9</p>
            <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F] mt-1">Non-refundable. All decisions final.</p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Premium ──────────────────────────────────────────────────────────────────
function Premium() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showClosed, setShowClosed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchApplicationsOpen().then((o) => { if (!cancelled) setOpen(o); });
    return () => { cancelled = true; };
  }, []);

  const handleClick = () => {
    if (open) {
      router.push("/apply?premium=true");
    } else {
      setShowClosed(true);
      setTimeout(() => setShowClosed(false), 4000);
    }
  };

  return (
    <section id="premium" className="relative py-32 bg-[#0A0A0A] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_#C9A84C0A_0%,_transparent_60%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <FadeUp>
          <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.5em] uppercase text-[#C9A84C] mb-6">Premium Access</p>
        </FadeUp>
        <FadeUp delay={1}>
          <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,7vw,5.5rem)] font-light leading-tight text-[#F5F2EC] mb-6">
            Didn&apos;t make the cut?
          </h2>
        </FadeUp>
        <FadeUp delay={2}>
          <p className="font-[family-name:var(--font-montserrat)] text-sm leading-relaxed text-[#B0AA9E] max-w-xl mx-auto mb-12">
            Some problems can be solved with money. ₹5,999/month gets you in for further consideration. We won&apos;t lie — money opens doors. It always has. The pool is the same. The honesty isn&apos;t going anywhere.
          </p>
        </FadeUp>
        <FadeUp delay={3}>
          <div className="border border-[#C9A84C]/20 p-10 max-w-md mx-auto mb-10">
            <p className="font-[family-name:var(--font-cormorant)] text-6xl font-light text-[#C9A84C] mb-2">₹5,999</p>
            <p className="font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase text-[#8A6E2F]">per month</p>
            <div className="w-full h-px bg-[#1A1A1A] my-6" />
            <ul className="space-y-3 text-left">
              {["Access to the full pool", "Same review. Different outcome.", "No algorithm. No preferential placement.", "Cancel anytime. The honesty stays."].map((item) => (
                <li key={item} className="font-[family-name:var(--font-montserrat)] text-xs text-[#B0AA9E] flex items-start gap-3">
                  <span className="text-[#C9A84C] mt-0.5 shrink-0">✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </FadeUp>
        <FadeUp delay={4}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className="font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase border border-[#C9A84C] text-[#C9A84C] px-12 py-5 hover:bg-[#C9A84C] hover:text-[#0A0A0A] transition-colors duration-300 cursor-pointer"
          >
            Throw money at this problem
          </motion.button>
          <AnimatePresence>
            {showClosed && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-[family-name:var(--font-montserrat)] text-[11px] text-[#C9A84C]/70 mt-5 tracking-wide"
              >
                Applications open Sunday at 11:59 PM. Come back then.
              </motion.p>
            )}
          </AnimatePresence>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#111111] border-t border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="max-w-xs">
            <p className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-widest text-[#C9A84C] mb-4">
              Prima Facie
            </p>
            <p className="font-[family-name:var(--font-cormorant)] text-base italic text-[#B0AA9E] leading-relaxed">
              &ldquo;We judge books by their covers. So does everyone else.&rdquo;
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[["Privacy Policy", "/privacy"], ["Terms", "/terms"], ["Contact", "/contact"]].map(([label, href]) => (
              <Link key={label as string} href={href as string} className="font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase text-[#8A6E2F] hover:text-[#C9A84C] transition-colors">
                {label as string}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[#1A1A1A]">
          <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F] leading-relaxed max-w-2xl">
            Prima Facie does not sell user data. No paid marketing — ever. Photos of rejected applicants are deleted within 48 hours. Rejected applicants may reapply monthly. This platform is intended for adults aged 18–28 only.
          </p>
          <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#3A3A3A] mt-4">
            © {new Date().getFullYear()} Prima Facie · primafacie.in · All decisions are final.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Page() {
  return (
    <main>
      <Nav />
      <Hero />
      <FirstBatch />
      <Manifesto />
      <HowItWorks />
      <Council />
      <Features />
      <ApplyCTA />
      <Premium />
      <Footer />
    </main>
  );
}
