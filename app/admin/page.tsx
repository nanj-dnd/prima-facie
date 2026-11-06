"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

type Application = {
  id: string;
  name: string;
  email: string;
  age: number;
  city: string;
  gender: string;
  photo_url: string | null;
  selfie_url: string | null;
  status: "pending" | "accepted" | "rejected";
  payment_id: string | null;
  created_at: string;
};

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
};

const STATUS_COLORS = {
  pending: "text-yellow-500 border-yellow-800",
  accepted: "text-emerald-500 border-emerald-800",
  rejected: "text-red-500 border-red-800",
};

// ─── Login ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw.trim()) { setErr(true); return; }
    onLogin(pw);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <p className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-widest text-[#C9A84C] mb-2">
          Prima Facie
        </p>
        <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.4em] uppercase text-[#8A6E2F] mb-10">
          Admin Dashboard
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] block mb-2">
              Password
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setErr(false); }}
              placeholder="Admin password"
              className={`w-full bg-[#1A1A1A] border ${err ? "border-red-800" : "border-[#2A2A2A]"} text-[#F5F2EC] font-[family-name:var(--font-montserrat)] text-sm px-4 py-3.5 outline-none focus:border-[#C9A84C] transition-colors`}
            />
            {err && <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-red-500 mt-1.5">Enter the password.</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-[#C9A84C] text-[#0A0A0A] font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase font-semibold py-4 hover:bg-[#8A6E2F] transition-colors"
          >
            Enter
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Application detail modal ──────────────────────────────────────────────────
function AppModal({
  app,
  onClose,
  onStatusChange,
}: {
  app: Application;
  onClose: () => void;
  onStatusChange: (id: string, status: Application["status"]) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const pw = typeof window !== "undefined" ? sessionStorage.getItem("admin_pw") ?? "" : "";

  const updateStatus = async (status: Application["status"]) => {
    setUpdating(true);
    try {
      await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${pw}` },
        body: JSON.stringify({ id: app.id, status }),
      });
      onStatusChange(app.id, status);
      onClose();
    } finally {
      setUpdating(false);
    }
  };

  const deleteApp = async () => {
    if (!confirm(`Delete application from ${app.name}?`)) return;
    setUpdating(true);
    try {
      await fetch("/api/admin/delete-application", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${pw}` },
        body: JSON.stringify({ id: app.id }),
      });
      onStatusChange(app.id, "rejected");
      onClose();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111111] border border-[#1A1A1A] w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-[#1A1A1A]">
          <div>
            <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#F5F2EC]">{app.name}</p>
            <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F] mt-1">
              {app.age} · {app.gender} · {app.city}
            </p>
          </div>
          <button onClick={onClose} className="text-[#8A6E2F] hover:text-[#C9A84C] transition-colors text-xl">✕</button>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Photos */}
          <div className="space-y-4">
            {app.photo_url && (
              <div>
                <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] mb-2">Photo</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={app.photo_url} alt="Applicant photo" className="w-full object-cover max-h-64" />
              </div>
            )}
            {app.selfie_url && (
              <div>
                <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F] mb-2">Selfie verification</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={app.selfie_url} alt="Selfie" className="w-full object-cover max-h-48" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="border border-[#1A1A1A] divide-y divide-[#1A1A1A]">
              {[
                ["Email", app.email],
                ["Age", String(app.age)],
                ["City", app.city],
                ["Gender", app.gender],
                ["Payment ID", app.payment_id ?? "—"],
                ["Applied", new Date(app.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
                ["Status", app.status.toUpperCase()],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between px-4 py-3">
                  <span className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#8A6E2F]">{label}</span>
                  <span className={`font-[family-name:var(--font-montserrat)] text-xs ${label === "Status" ? STATUS_COLORS[app.status].split(" ")[0] : "text-[#F5F2EC]"}`}>{value}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => updateStatus("accepted")}
                disabled={updating || app.status === "accepted"}
                className="flex-1 bg-emerald-900/30 border border-emerald-800 text-emerald-500 font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase py-3 hover:bg-emerald-900/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Accept
              </button>
              <button
                onClick={() => updateStatus("rejected")}
                disabled={updating || app.status === "rejected"}
                className="flex-1 bg-red-900/20 border border-red-800 text-red-500 font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase py-3 hover:bg-red-900/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Reject
              </button>
              {app.status !== "pending" && (
                <button
                  onClick={() => updateStatus("pending")}
                  disabled={updating}
                  className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] text-[#8A6E2F] font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase py-3 hover:border-[#C9A84C]/30 transition-colors disabled:opacity-40"
                >
                  Requeue
                </button>
              )}
              <button
                onClick={deleteApp}
                disabled={updating}
                className="bg-[#1A1A1A] border border-red-800/30 text-red-600 font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase px-4 py-3 hover:border-red-800 transition-colors disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ password }: { password: string }) {
  const [tab, setTab] = useState<"applications" | "messages" | "notifications">("applications");
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected">("pending");
  const [applications, setApplications] = useState<Application[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [signups, setSignups] = useState<{ email: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [authError, setAuthError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [appsOpen, setAppsOpen] = useState<boolean | null>(null);
  const [toggling, setToggling] = useState(false);

  const authHeader = { Authorization: `Bearer ${password}` };

  const fetchAppsOpen = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const data = await res.json();
      setAppsOpen(!!data.applications_open);
    } catch {
      setAppsOpen(null);
    }
  }, []);

  const toggleApplicationsOpen = async () => {
    if (appsOpen === null || toggling) return;
    const next = !appsOpen;
    if (!confirm(`${next ? "Open" : "Close"} applications now? This takes effect immediately for all visitors.`)) return;
    setToggling(true);
    try {
      const res = await fetch("/api/admin/toggle-applications", {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ open: next }),
      });
      if (res.status === 401) { setAuthError(true); return; }
      const data = await res.json();
      setAppsOpen(!!data.applications_open);
    } finally {
      setToggling(false);
    }
  };

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/applications`, { headers: authHeader });
    if (res.status === 401) { setAuthError(true); return; }
    const data = await res.json();
    setApplications(data.applications ?? []);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, password]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/messages", { headers: authHeader });
    if (res.status === 401) { setAuthError(true); return; }
    const data = await res.json();
    setMessages(data.messages ?? []);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  const fetchSignups = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/notification-signups", { headers: authHeader });
    if (res.status === 401) { setAuthError(true); return; }
    const data = await res.json();
    setSignups(data.signups ?? []);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  useEffect(() => {
    fetchAppsOpen();
  }, [fetchAppsOpen]);

  useEffect(() => {
    if (tab === "applications") {
      fetchApplications();

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      );

      const channel = supabase.channel("applications").on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        () => fetchApplications()
      ).subscribe();

      return () => { channel.unsubscribe(); };
    } else if (tab === "messages") {
      fetchMessages();
    } else {
      fetchSignups();
    }
  }, [tab, fetchApplications, fetchMessages, fetchSignups]);

  const handleStatusChange = (id: string, status: Application["status"]) => {
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  };

  if (authError) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="font-[family-name:var(--font-montserrat)] text-sm text-red-500">Wrong password. Refresh to try again.</p>
      </div>
    );
  }

  const counts = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="border-b border-[#1A1A1A] px-6 py-5 flex items-center justify-between">
        <div>
          <p className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-[#C9A84C]">Prima Facie</p>
          <p className="font-[family-name:var(--font-montserrat)] text-[9px] tracking-widest uppercase text-[#8A6E2F]">Admin</p>
        </div>
        <div className="flex items-center gap-8">
          <button
            onClick={toggleApplicationsOpen}
            disabled={appsOpen === null || toggling}
            className={`flex items-center gap-2 font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase border rounded-full px-4 py-2 transition-colors disabled:opacity-50 ${
              appsOpen
                ? "border-[#C9A84C]/50 text-[#C9A84C] hover:bg-[#C9A84C]/10"
                : "border-[#8A6E2F]/40 text-[#8A6E2F] hover:bg-[#8A6E2F]/10"
            }`}
            title="Click to toggle whether the public can submit applications"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${appsOpen ? "bg-[#C9A84C]" : "bg-[#8A6E2F]"}`} />
            Applications {appsOpen === null ? "…" : appsOpen ? "Open" : "Closed"}
            {toggling && " · updating…"}
          </button>
          <div className="flex gap-6">
            {(["applications", "messages", "notifications"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase transition-colors ${tab === t ? "text-[#C9A84C]" : "text-[#8A6E2F] hover:text-[#B0AA9E]"}`}
              >
                {t}{t === "notifications" && signups.length > 0 ? ` (${signups.length})` : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {tab === "applications" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                ["Total", applications.length],
                ["Pending", counts.pending, "text-yellow-500"],
                ["Accepted", counts.accepted, "text-emerald-500"],
                ["Rejected", counts.rejected, "text-red-500"],
              ].map(([label, val, color]) => (
                <div key={label as string} className="border border-[#1A1A1A] p-4">
                  <p className={`font-[family-name:var(--font-cormorant)] text-3xl font-light ${(color as string) || "text-[#F5F2EC]"}`}>
                    {val as number}
                  </p>
                  <p className="font-[family-name:var(--font-montserrat)] text-[9px] tracking-widest uppercase text-[#8A6E2F] mt-1">
                    {label as string}
                  </p>
                </div>
              ))}
            </div>


            {/* Applications grid */}
            {loading ? (
              <div className="text-center py-20">
                <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F]">Loading...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-[#1A1A1A]">
                <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F]">No applications yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {applications.map((app) => (
                  <motion.button
                    key={app.id}
                    layout
                    onClick={() => setSelected(app)}
                    className="text-left border border-[#1A1A1A] hover:border-[#C9A84C]/30 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-[#111111] overflow-hidden">
                      {app.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={app.photo_url}
                          alt={app.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[#2A2A2A] text-4xl">◎</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#F5F2EC] truncate">{app.name}</p>
                      <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F] mt-0.5">
                        {app.age} · {app.city}
                      </p>
                      <span className={`inline-block mt-2 font-[family-name:var(--font-montserrat)] text-[9px] tracking-widest uppercase border px-2 py-0.5 ${STATUS_COLORS[app.status]}`}>
                        {app.status}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "notifications" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#F5F2EC]">{signups.length}</p>
                <p className="font-[family-name:var(--font-montserrat)] text-[9px] tracking-widest uppercase text-[#8A6E2F] mt-1">Notification signups</p>
              </div>
              {signups.length > 0 && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(signups.map((s) => s.email).join("\n"));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase border border-[#C9A84C]/30 text-[#C9A84C] px-4 py-2 hover:border-[#C9A84C] transition-colors"
                >
                  {copied ? "Copied ✓" : "Copy all emails"}
                </button>
              )}
            </div>
            {loading ? (
              <div className="text-center py-20">
                <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F]">Loading...</p>
              </div>
            ) : signups.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-[#1A1A1A]">
                <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F]">No signups yet.</p>
              </div>
            ) : (
              <div className="space-y-px">
                {signups.map((s) => (
                  <div key={s.email} className="flex items-center justify-between border border-[#1A1A1A] px-5 py-3 hover:bg-[#111111] transition-colors">
                    <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#F5F2EC]">{s.email}</p>
                    <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F]">
                      {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "messages" && (
          <>
            {loading ? (
              <div className="text-center py-20">
                <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F]">Loading...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-[#1A1A1A]">
                <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F]">No messages yet.</p>
              </div>
            ) : (
              <div className="space-y-px">
                {messages.map((msg) => (
                  <details key={msg.id} className="border border-[#1A1A1A] group">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#111111] transition-colors list-none">
                      <div className="flex items-center gap-4 min-w-0">
                        <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#F5F2EC] shrink-0">{msg.name}</p>
                        <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F] truncate">{msg.email}</p>
                        {msg.subject && (
                          <span className="font-[family-name:var(--font-montserrat)] text-[9px] tracking-widest uppercase border border-[#2A2A2A] text-[#8A6E2F] px-2 py-0.5 shrink-0">
                            {msg.subject}
                          </span>
                        )}
                      </div>
                      <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#8A6E2F] shrink-0 ml-4">
                        {new Date(msg.created_at).toLocaleDateString("en-IN")}
                      </p>
                    </summary>
                    <div className="px-5 pb-5 border-t border-[#1A1A1A]">
                      <p className="font-[family-name:var(--font-montserrat)] text-sm text-[#B0AA9E] leading-relaxed mt-4 whitespace-pre-wrap">
                        {msg.message}
                      </p>
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${msg.subject ?? "Your message to Prima Facie"}`}
                        className="inline-block mt-4 font-[family-name:var(--font-montserrat)] text-[10px] tracking-widest uppercase text-[#C9A84C] border border-[#C9A84C]/30 px-4 py-2 hover:border-[#C9A84C] transition-colors"
                      >
                        Reply via email →
                      </a>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Application modal */}
      <AnimatePresence>
        {selected && (
          <AppModal
            app={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_pw");
    if (stored) setPassword(stored);
  }, []);

  const handleLogin = (pw: string) => {
    sessionStorage.setItem("admin_pw", pw);
    setPassword(pw);
  };

  if (!password) return <Login onLogin={handleLogin} />;
  return <Dashboard password={password} />;
}
