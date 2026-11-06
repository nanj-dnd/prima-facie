"use client";

import { useRef, useState, useCallback, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/Nav";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4;
type Gender = "Man" | "Woman" | "Non-binary" | "";

interface FormData {
  name: string;
  email: string;
  age: string;
  city: string;
  gender: Gender;
  photos: (File | null)[];
  selfieBlob: Blob | null;
  selfieDataUrl: string;
}

const CITIES = ["Mumbai", "Delhi NCR", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Kochi"];
const STEP_LABELS = ["Details", "Photos", "Selfie", "Pay"];

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-16">
      {STEP_LABELS.map((label, i) => {
        const n = (i + 1) as Step;
        const done = current > n;
        const active = current === n;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 flex items-center justify-center text-xs font-[family-name:var(--font-montserrat)] font-semibold transition-colors duration-300 ${
                  done
                    ? "bg-[#C9A84C] text-[#0A0A0A]"
                    : active
                    ? "border border-[#C9A84C] text-[#C9A84C]"
                    : "border border-[#2A2A2A] text-[#3A3A3A]"
                }`}
              >
                {done ? "✓" : n}
              </div>
              <span
                className={`font-[family-name:var(--font-montserrat)] text-[9px] tracking-widest uppercase ${
                  active ? "text-[#C9A84C]" : done ? "text-[#8A6E2F]" : "text-[#3A3A3A]"
                }`}
              >
                {label}
              </span>
            </div>
            {i < 3 && (
              <div
                className={`w-16 md:w-24 h-px mx-2 mb-5 transition-colors duration-300 ${
                  current > n ? "bg-[#C9A84C]" : "bg-[#1A1A1A]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Photo Guidelines ─────────────────────────────────────────────────────────
function PhotoGuidelines() {
  const [open, setOpen] = useState(false);
  const guidelines = [
    {
      title: "Face shot",
      rules: [
        "Clear, well-lit. No sunglasses.",
        "Front-facing. No filters, no heavy editing.",
        "Recent — taken in the last 6 months.",
        "Just you. No group photos.",
      ],
    },
    {
      title: "Full body shot",
      rules: [
        "Head to toe. We need to see the full picture.",
        "Fitted clothing — nothing deliberately baggy.",
        "Natural, relaxed stance. Not a gym selfie.",
      ],
    },
    {
      title: "Fashion shot",
      rules: [
        "How you actually dress day-to-day.",
        "Your real style. Not what you wear to weddings.",
        "Bonus: shows personality beyond the face.",
      ],
    },
  ];

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#C9A84C] hover:text-[#8A6E2F] transition-colors"
      >
        <span>{open ? "−" : "+"}</span>
        Photo guidelines — read before uploading
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 border border-[#1A1A1A] p-6 grid md:grid-cols-3 gap-6">
              {guidelines.map((g) => (
                <div key={g.title}>
                  <p className="font-[family-name:var(--font-cormorant)] text-lg text-[#F5F2EC] mb-3">
                    {g.title}
                  </p>
                  <ul className="space-y-2">
                    {g.rules.map((r) => (
                      <li
                        key={r}
                        className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#B0AA9E] leading-relaxed flex gap-2"
                      >
                        <span className="text-[#C9A84C] shrink-0 mt-0.5">—</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Selfie capture ───────────────────────────────────────────────────────────
function SelfieCapture({
  onCapture,
  captured,
}: {
  onCapture: (blob: Blob, dataUrl: string) => void;
  captured: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [camError, setCamError] = useState("");

  const startCamera = useCallback(async () => {
    setCamError("");
    try {
      console.log("Requesting camera access...");
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      console.log("Camera stream obtained:", ms);
      setStream(ms);
    } catch (err: any) {
      console.error("Camera error details:", err);
      const msg = err?.name === "NotAllowedError"
        ? "Camera permission denied. Check System Preferences → Security & Privacy → Camera."
        : "Camera not available. Make sure you have a camera and try again.";
      setCamError(msg);
    }
  }, []);

  // Set video stream once it's ready
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log("Setting stream to video element", stream);
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded, playing...");
        videoRef.current?.play().catch((e) => {
          console.error("Play error:", e);
        });
      };
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const capture = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPreview(dataUrl);
    canvas.toBlob((blob) => {
      if (blob) onCapture(blob, dataUrl);
    }, "image/jpeg", 0.85);
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }, [stream, onCapture]);

  const retake = useCallback(() => {
    setPreview("");
    startCamera();
  }, [startCamera]);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-[family-name:var(--font-cormorant)] text-3xl text-[#F5F2EC] mb-2">
          Selfie verification
        </p>
        <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#B0AA9E] leading-relaxed max-w-md">
          Take a live selfie so we can verify the face in your photos is you. This is not your profile photo — it&apos;s just for verification. Look at the camera. No filters.
        </p>
      </div>

      {!stream && !preview && (
        <div
          className="border border-dashed border-[#2A2A2A] flex flex-col items-center justify-center py-20 gap-4 cursor-pointer hover:border-[#C9A84C]/40 transition-colors"
          onClick={startCamera}
        >
          <div className="w-16 h-16 border border-[#1A1A1A] flex items-center justify-center">
            <span className="text-2xl text-[#C9A84C]/40">◎</span>
          </div>
          <p className="font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase text-[#C9A84C]">
            Open camera
          </p>
          {camError && (
            <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500 text-center max-w-xs">
              {camError}
            </p>
          )}
        </div>
      )}

      {stream && !preview && (
        <div className="space-y-4">
          <div className="relative bg-black border border-[#1A1A1A] overflow-hidden" style={{ aspectRatio: "1" }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ transform: "scaleX(-1)", width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
          <button
            type="button"
            onClick={capture}
            className="w-full font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase bg-[#C9A84C] text-[#0A0A0A] py-4 font-semibold hover:bg-[#8A6E2F] transition-colors"
          >
            Take selfie
          </button>
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          <div className="relative border border-[#C9A84C]/30 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Selfie preview" className="w-full max-w-sm mx-auto block" />
            <div className="absolute top-3 right-3 bg-[#C9A84C] px-2 py-1">
              <span className="font-[family-name:var(--font-montserrat)] text-[9px] uppercase text-[#0A0A0A] font-semibold">
                Taken
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={retake}
            className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] hover:text-[#C9A84C] transition-colors"
          >
            Retake
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
// ─── Open/closed status (admin-controlled, fetched from /api/settings) ───────
export async function fetchApplicationsOpen(): Promise<boolean> {
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    const data = await res.json();
    return !!data.applications_open;
  } catch {
    return false;
  }
}

// ─── Notify Form ─────────────────────────────────────────────────────────────
function NotifyForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/notify-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="my-10 max-w-sm mx-auto">
      <AnimatePresence mode="wait">
        {status === "done" ? (
          <motion.p
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-[family-name:var(--font-cormorant)] text-xl italic text-[#C9A84C] text-center"
          >
            We&apos;ll remind you. Don&apos;t miss it.
          </motion.p>
        ) : (
          <motion.form key="form" onSubmit={submit} className="flex flex-col items-center gap-3">
            <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.3em] uppercase text-[#8A6E2F] mb-1">
              Get notified an hour before
            </p>
            <div className="flex w-full border border-[#2A2A2A] focus-within:border-[#C9A84C] transition-colors">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-transparent text-[#F5F2EC] font-[family-name:var(--font-montserrat)] text-xs px-4 py-3 outline-none placeholder-[#3A3A3A]"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="font-[family-name:var(--font-montserrat)] text-[9px] tracking-widest uppercase bg-[#C9A84C] text-[#0A0A0A] px-5 font-semibold hover:bg-[#8A6E2F] transition-colors disabled:opacity-60"
              >
                {status === "loading" ? "..." : "Notify me"}
              </button>
            </div>
            {status === "error" && (
              <p className="font-[family-name:var(--font-montserrat)] text-[9px] text-red-500">Something went wrong. Try again.</p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function ApplyPageInner() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    age: "",
    city: "",
    gender: "",
    photos: Array(6).fill(null),
    selfieBlob: null,
    selfieDataUrl: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | "submit", string>>>({});
  const [photoName, setPhotoName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fee, setFee] = useState(9);
  const searchParams = useSearchParams();
  const isPremium = searchParams.get("premium") === "true";

  // Pre-set fee to max if coming from premium CTA
  useEffect(() => {
    if (isPremium) setFee(1999);
  }, [isPremium]);

  // ── Applications open/close state (admin-controlled) ────────────────────────
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchApplicationsOpen().then((open) => { if (!cancelled) setIsOpen(open); });
    // Re-check every 30s in case admin toggles while user is on the page
    const id = setInterval(() => {
      fetchApplicationsOpen().then((open) => { if (!cancelled) setIsOpen(open); });
    }, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("prima-facie-apply");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm((f) => ({ ...f, ...parsed, photo: null, selfieBlob: null }));
        setStep(parsed.step || 1);
      } catch (e) {
        console.error("Failed to load saved form:", e);
      }
    }
  }, []);

  // Save to localStorage whenever form or step changes
  useEffect(() => {
    const toSave = {
      ...form,
      photo: null,
      selfieBlob: null,
      step,
    };
    localStorage.setItem("prima-facie-apply", JSON.stringify(toSave));
  }, [form, step]);

  const feeTier = (amount: number) => {
    if (amount < 50)  return { label: "Standard",              detail: "72-hour review. Back of the queue.",                         note: "If you're genuinely attractive, ₹9 is enough." };
    if (amount < 200) return { label: "Faster",                detail: "48-hour review. You move ahead.",                           note: "Costs more. Same verdict." };
    if (amount < 500) return { label: "Priority",              detail: "24-hour review. Elevated consideration on borderline cases.", note: "Paying more doesn't guarantee acceptance." };
    return              { label: "Maximum consideration",      detail: "Reviewed today. Top of the queue.",                         note: "We still say no to people who pay ₹1,999." };
  };

  const set = (k: keyof FormData, v: unknown) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  // ─ Step validation ──────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "We need this to judge you.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Give us a real email. We'll only use it to notify you.";
    if (!form.age) e.age = "We need this to judge you.";
    else if (Number(form.age) < 18 || Number(form.age) > 28)
      e.age = "We only accept 18–28. No exceptions.";
    if (!form.city) e.city = "We need this to judge you.";
    if (!form.gender) e.gender = "We need this to judge you.";
    return e;
  };

  const validateStep2 = () => {
    const e: typeof errors = {};
    const uploadedPhotos = form.photos.filter(Boolean);
    if (uploadedPhotos.length < 6) e.photos = "Upload all 6 photos. No exceptions.";
    return e;
  };

  const validateStep3 = () => {
    const e: typeof errors = {};
    if (!form.selfieBlob) e.selfieBlob = "Take a selfie so we know it's really you.";
    return e;
  };

  const next = () => {
    let errs = {};
    if (step === 1) errs = validateStep1();
    if (step === 2) errs = validateStep2();
    if (step === 3) errs = validateStep3();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep((s) => Math.min(s + 1, 4) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setStep((s) => Math.max(s - 1, 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─ Payment & submit ─────────────────────────────────────────────────────────
  const handlePay = async () => {
    setLoading(true);
    setErrors({});

    try {
      // 1. Create Razorpay order
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: fee }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error ?? "Order creation failed");
      const { orderId } = orderData;

      // 2. Open Razorpay checkout
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      await new Promise<void>((resolve, reject) => {
        const options = {
          key: keyId,
          amount: fee * 100,
          currency: "INR",
          name: "Prima Facie",
          description: `Application fee — ₹${fee}`,
          order_id: orderId,
          prefill: { name: form.name, email: form.email },
          theme: { color: "#C9A84C" },
          modal: { ondismiss: () => reject(new Error("Payment dismissed")) },
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            // 3. Submit application with payment proof
            try {
              const fd = new FormData();
              fd.append("name", form.name);
              fd.append("email", form.email);
              fd.append("age", form.age);
              fd.append("city", form.city);
              fd.append("gender", form.gender);
              fd.append("orderId", response.razorpay_order_id);
              fd.append("paymentId", response.razorpay_payment_id);
              fd.append("signature", response.razorpay_signature);
              form.photos.forEach((photo, i) => {
                if (photo) fd.append(`photo_${i}`, photo);
              });
              if (form.selfieBlob) fd.append("selfie", form.selfieBlob, "selfie.jpg");

              const applyRes = await fetch("/api/apply", { method: "POST", body: fd });
              const applyData = await applyRes.json();
              if (!applyRes.ok) throw new Error(applyData.error ?? "Submission failed");
              resolve();
            } catch (err) {
              reject(err);
            }
          },
        };

        if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).Razorpay) {
          const Rzp = (window as unknown as Record<string, unknown>).Razorpay as new (o: unknown) => { open(): void };
          new Rzp(options).open();
        } else {
          // Dev stub: simulate success without Razorpay SDK
          console.warn("Razorpay SDK not loaded — simulating success");
          setTimeout(resolve, 800);
        }
      });

      setSubmitted(true);
      localStorage.removeItem("prima-facie-apply");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      if (msg !== "Payment dismissed") {
        setErrors({ submit: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  // ─ Closed screen ────────────────────────────────────────────────────────────
  if (isOpen === null) {
    // Still calculating — render nothing to avoid flash
    return <div className="min-h-screen bg-[#0A0A0A]" />;
  }

  if (isOpen === false) {
    return (
      <>
        <Nav />
        <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.5em] uppercase text-[#8A6E2F] mb-10">
              Prima Facie · Applications
            </p>

            <h1 className="font-[family-name:var(--font-cormorant)] text-6xl md:text-7xl font-light text-[#F5F2EC] mb-4 leading-none">
              Closed for now.
            </h1>
            <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F] mb-16 tracking-wide max-w-sm mx-auto">
              The gates open without warning. Sign up below — we&apos;ll email you the moment they do.
            </p>
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="text-center">
                <p className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#C9A84C]">250</p>
                <p className="font-[family-name:var(--font-montserrat)] text-[9px] tracking-[0.3em] uppercase text-[#8A6E2F] mt-1">Men</p>
              </div>
              <div className="w-px h-8 bg-[#C9A84C]/20" />
              <div className="text-center">
                <p className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#C9A84C]">250</p>
                <p className="font-[family-name:var(--font-montserrat)] text-[9px] tracking-[0.3em] uppercase text-[#8A6E2F] mt-1">Women</p>
              </div>
              <div className="w-px h-8 bg-[#C9A84C]/20" />
              <div className="text-center">
                <p className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#F5F2EC]">500</p>
                <p className="font-[family-name:var(--font-montserrat)] text-[9px] tracking-[0.3em] uppercase text-[#8A6E2F] mt-1">Per city</p>
              </div>
            </div>

            {/* Notify me form */}
            <NotifyForm />

            <Link
              href="/"
              className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] hover:text-[#C9A84C] transition-colors mt-8 inline-block"
            >
              ← Back to home
            </Link>
          </motion.div>
        </main>
      </>
    );
  }

  // ─ Success screen ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <Nav />
        <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-md"
          >
            <div className="w-16 h-16 border border-[#C9A84C] flex items-center justify-center mx-auto mb-8">
              <span className="text-[#C9A84C] text-2xl">✦</span>
            </div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#F5F2EC] mb-4">
              Application received.
            </h1>
            <p className="font-[family-name:var(--font-montserrat)] text-sm text-[#B0AA9E] leading-relaxed mb-8">
              The council votes. You&apos;ll get an email at <span className="text-[#C9A84C]">{form.email || "the address you entered"}</span> with the verdict. If it&apos;s a no — you can reapply in 30 days.
            </p>
            <Link
              href="/"
              className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#C9A84C] border border-[#C9A84C]/30 px-8 py-3 hover:border-[#C9A84C] transition-colors"
            >
              Back to home
            </Link>
          </motion.div>
        </main>
      </>
    );
  }

  const inputClass = (field: keyof FormData) =>
    `w-full bg-[#1A1A1A] border ${errors[field] ? "border-red-800" : "border-[#2A2A2A]"} text-[#F5F2EC] font-[family-name:var(--font-montserrat)] text-sm px-4 py-3.5 outline-none focus:border-[#C9A84C] transition-colors duration-200 placeholder-[#3A3A3A]`;

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#111111] pt-28 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.5em] uppercase text-[#C9A84C] mb-3">
              {isPremium ? "Premium Application · Prima Facie" : "Apply to Prima Facie"}
            </p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-[#F5F2EC]">
              {isPremium ? "Throwing money at the problem." : "Think you have what it takes?"}
            </h1>
            {isPremium && (
              <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F] mt-3">
                ₹1,999 · Top of queue · Council still decides
              </p>
            )}
          </motion.div>

          <StepIndicator current={step} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* ── Step 1: Personal info ─────────────────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] block mb-2">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="Your actual name"
                      className={inputClass("name")}
                    />
                    {errors.name && <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500 mt-1.5">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] block mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="your verdict arrives here"
                      className={inputClass("email")}
                    />
                    {errors.email && <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500 mt-1.5">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] block mb-2">
                      Age (18–28)
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={28}
                      value={form.age}
                      onChange={(e) => set("age", e.target.value)}
                      placeholder="18–28 only"
                      className={inputClass("age")}
                    />
                    {errors.age && <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500 mt-1.5">{errors.age}</p>}
                  </div>

                  <div>
                    <label className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] block mb-2">
                      City
                    </label>
                    <select
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      className={`${inputClass("city")} cursor-pointer`}
                    >
                      <option value="" disabled>Select your city</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c} className="bg-[#1A1A1A]">{c}</option>
                      ))}
                    </select>
                    {errors.city && <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500 mt-1.5">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] block mb-2">
                      Gender
                    </label>
                    <div className="flex gap-px">
                      {(["Man", "Woman", "Non-binary"] as Gender[]).map((g) => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => set("gender", g)}
                          className={`flex-1 py-3.5 font-[family-name:var(--font-montserrat)] text-xs tracking-wide transition-colors duration-200 ${
                            form.gender === g
                              ? "bg-[#C9A84C] text-[#0A0A0A]"
                              : "bg-[#1A1A1A] border border-[#2A2A2A] text-[#B0AA9E] hover:border-[#C9A84C]/40"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    {errors.gender && <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500 mt-1.5">{errors.gender}</p>}
                  </div>
                </div>
              )}

              {/* ── Step 2: Photo upload ──────────────────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <p className="font-[family-name:var(--font-cormorant)] text-3xl text-[#F5F2EC] mb-2">
                      Your photos
                    </p>
                    <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#B0AA9E] leading-relaxed mb-6">
                      Upload all 6 photos. Solo shots only. No group photos, no filters.
                    </p>
                  </div>

                  <PhotoGuidelines />

                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <label key={i} className="aspect-square border border-[#2A2A2A] bg-[#111111] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#C9A84C]/40 transition-colors relative">
                        {form.photos[i] ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={URL.createObjectURL(form.photos[i]!)} alt="" className="w-full h-full object-cover" />
                            {i === 0 && <span className="absolute bottom-1 left-1 font-[family-name:var(--font-montserrat)] text-[8px] tracking-widest uppercase bg-[#C9A84C] text-[#0A0A0A] px-1 py-0.5">Main</span>}
                          </>
                        ) : (
                          <span className="text-[#3A3A3A] text-xl">+</span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            const newPhotos = [...form.photos];
                            newPhotos[i] = file;
                            setForm({ ...form, photos: newPhotos });
                          }}
                        />
                      </label>
                    ))}
                  </div>

                  {errors.photos && <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500">{errors.photos}</p>}
                </div>
              )}

              {/* ── Step 3: Selfie ────────────────────────────────────────────────── */}
              {step === 3 && (
                <div className="space-y-4">
                  <SelfieCapture
                    onCapture={(blob, url) => {
                      set("selfieBlob", blob);
                      set("selfieDataUrl", url);
                    }}
                    captured={!!form.selfieBlob}
                  />
                  {errors.selfieBlob && (
                    <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500">{errors.selfieBlob}</p>
                  )}
                </div>
              )}

              {/* ── Step 4: Review & Pay ──────────────────────────────────────────── */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <p className="font-[family-name:var(--font-cormorant)] text-3xl text-[#F5F2EC] mb-2">
                      One last look.
                    </p>
                    <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#B0AA9E] leading-relaxed">
                      Review your application before we take your money.
                    </p>
                  </div>

                  <div className="border border-[#1A1A1A] divide-y divide-[#1A1A1A]">
                    {[
                      ["Name", form.name],
                      ["Email", form.email],
                      ["Age", form.age],
                      ["City", form.city],
                      ["Gender", form.gender],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between px-5 py-3.5">
                        <span className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F]">
                          {label}
                        </span>
                        <span className="font-[family-name:var(--font-montserrat)] text-sm text-[#F5F2EC]">
                          {value}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between px-5 py-3.5">
                      <span className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F]">
                        Photo
                      </span>
                      <span className="font-[family-name:var(--font-montserrat)] text-sm text-[#C9A84C]">
                        ✓ Uploaded
                      </span>
                    </div>
                    <div className="flex justify-between px-5 py-3.5">
                      <span className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F]">
                        Selfie
                      </span>
                      <span className="font-[family-name:var(--font-montserrat)] text-sm text-[#C9A84C]">
                        ✓ Verified
                      </span>
                    </div>
                  </div>

                  {/* ── Fee slider ─────────────────────────────────────────── */}
                  <div className="border border-[#C9A84C]/20 p-6 space-y-6">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] mb-2">
                          Application fee
                        </p>
                        <motion.p
                          key={fee}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15 }}
                          className="font-[family-name:var(--font-cormorant)] text-5xl text-[#C9A84C] font-light leading-none"
                        >
                          ₹{fee.toLocaleString("en-IN")}
                        </motion.p>
                      </div>
                      <div className="text-right">
                        <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#C9A84C]">
                          {feeTier(fee).label}
                        </p>
                        <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F] mt-1">
                          {feeTier(fee).detail}
                        </p>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={9}
                      max={1999}
                      step={1}
                      value={fee}
                      onChange={(e) => setFee(Number(e.target.value))}
                      className="fee-slider w-full"
                      style={{ "--fill": `${((fee - 9) / (1999 - 9)) * 100}%` } as React.CSSProperties}
                    />

                    <div className="flex justify-between font-[family-name:var(--font-montserrat)] text-[9px] text-[#3A3A3A] tracking-widest uppercase">
                      <span>₹9 min</span>
                      <span>₹1,999 max</span>
                    </div>

                    <div className="border-t border-[#1A1A1A] pt-4">
                      <p className="font-[family-name:var(--font-cormorant)] text-sm italic text-[#8A6E2F] leading-relaxed">
                        &ldquo;{feeTier(fee).note}&rdquo;
                      </p>
                    </div>

                    <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F]">
                      Non-refundable regardless of outcome.
                    </p>
                  </div>

                  {errors.submit && (
                    <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500 text-center">
                      {errors.submit}
                    </p>
                  )}

                  <motion.button
                    type="button"
                    onClick={handlePay}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.99 }}
                    className="w-full bg-[#C9A84C] text-[#0A0A0A] font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase font-semibold py-5 hover:bg-[#8A6E2F] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : `Submit & Pay ₹${fee.toLocaleString("en-IN")}`}
                  </motion.button>

                  <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-center text-[#8A6E2F] leading-relaxed">
                    Acceptance is based solely on appearance. All decisions are final. By submitting, you agree to our{" "}
                    <Link href="/terms" className="text-[#C9A84C] hover:underline">Terms</Link> and{" "}
                    <Link href="/privacy" className="text-[#C9A84C] hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className={`flex mt-10 ${step > 1 ? "justify-between" : "justify-end"}`}>
            {step > 1 && (
              <button
                type="button"
                onClick={back}
                className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] hover:text-[#C9A84C] transition-colors"
              >
                ← Back
              </button>
            )}
            {step < 4 && (
              <button
                type="button"
                onClick={next}
                className="font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase bg-[#C9A84C] text-[#0A0A0A] px-10 py-3.5 font-semibold hover:bg-[#8A6E2F] transition-colors"
              >
                Continue →
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <ApplyPageInner />
    </Suspense>
  );
}
