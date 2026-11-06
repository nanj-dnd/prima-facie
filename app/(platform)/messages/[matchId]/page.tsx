"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface OtherProfile {
  name: string;
  age: number;
  photos: string[];
}

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState("");
  const [other, setOther] = useState<OtherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/sign-in"); return; }
      setUserId(user.id);

      // Verify match exists and get other user
      const { data: matchData } = await supabase
        .from("matches")
        .select("user1, user2")
        .eq("id", matchId)
        .or(`user1.eq.${user.id},user2.eq.${user.id}`)
        .single();

      if (!matchData) { router.replace("/matches"); return; }

      const otherId = matchData.user1 === user.id ? matchData.user2 : matchData.user1;
      const { data: prof } = await supabase.from("profiles").select("name, age, photos").eq("id", otherId).single();
      setOther(prof);

      // Load messages
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      setMessages(msgs ?? []);
      setLoading(false);
    })();
  }, [matchId, router]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${matchId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === payload.new.id);
          return exists ? prev : [...prev, payload.new as Message];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setText("");

    await supabase.from("chat_messages").insert({
      match_id: matchId,
      sender_id: userId,
      content,
    });
    setSending(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-[#1A1A1A] shrink-0 bg-[#0A0A0A]">
        <Link href="/matches" className="text-[#8A6E2F] hover:text-[#C9A84C] transition-colors text-sm">←</Link>
        <div className="w-9 h-9 bg-[#111111] overflow-hidden shrink-0">
          {other?.photos?.[0]
            ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={other.photos[0]} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><span className="text-[#C9A84C]/40 text-xs">◎</span></div>}
        </div>
        <div>
          <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#F5F2EC] leading-none">{other?.name}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && <div className="w-px h-8 bg-gradient-to-b from-[#C9A84C] to-transparent animate-pulse mx-auto mt-10" />}

        {!loading && messages.length === 0 && (
          <div className="text-center py-10">
            <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#F5F2EC] mb-1">You matched.</p>
            <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F]">Say something. Don&apos;t overthink it.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const mine = msg.sender_id === userId;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 ${
                  mine
                    ? "bg-[#C9A84C] text-[#0A0A0A]"
                    : "bg-[#1A1A1A] text-[#F5F2EC]"
                }`}
              >
                <p className="font-[family-name:var(--font-montserrat)] text-sm leading-relaxed">{msg.content}</p>
                <p className={`font-[family-name:var(--font-montserrat)] text-[9px] mt-1 ${mine ? "text-[#0A0A0A]/60" : "text-[#8A6E2F]"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#1A1A1A] flex gap-3 items-end shrink-0 bg-[#0A0A0A]">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Message..."
          rows={1}
          className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F2EC] font-[family-name:var(--font-montserrat)] text-sm px-4 py-3 outline-none focus:border-[#C9A84C] transition-colors resize-none placeholder-[#3A3A3A] max-h-28"
          style={{ height: "auto", minHeight: "44px" }}
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={send}
          disabled={!text.trim() || sending}
          className="w-10 h-10 bg-[#C9A84C] text-[#0A0A0A] flex items-center justify-center hover:bg-[#8A6E2F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
