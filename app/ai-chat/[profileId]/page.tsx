"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

const c = {
  bg: "#f6f4ef",
  ink: "#1c2824",
  inkSoft: "#4a5c56",
  inkMuted: "#6d8078",
  sage: "#3a6b5c",
  sageDark: "#2f584b",
  sageLight: "#e4ede9",
  apricot: "#EA580C",
  apricotLight: "#FED7AA",
  card: "rgba(255, 255, 255, 0.85)",
  border: "#d8e4de",
} as const;

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Profile = {
  id: string;
  full_name: string;
  description: string;
  experience_categories: string[];
};

export default function AIChatPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const profileId = params.profileId as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/"); return; }

    supabase
      .from("profiles")
      .select("id, full_name, description, experience_categories")
      .eq("id", profileId)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          // Add welcome message
          setMessages([{
            role: "assistant",
            content: `Hi ${data.full_name.split(" ")[0]} 👋 I'm here to listen while we find you the right match. I can see you're navigating ${data.experience_categories.join(", ")}. What's on your mind today?`,
          }]);
        }
      });
  }, [isLoaded, user, profileId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function onEmojiClick(emojiData: EmojiClickData) {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }

  async function sendMessage() {
    if (!newMessage.trim() || sending || !profile) return;
    setSending(true);

    const userMessage: Message = { role: "user", content: newMessage.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setNewMessage("");

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          profile,
        }),
      });

      const data = await response.json();
      if (data.content) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      }
    } catch (err) {
      console.error("AI chat error:", err);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "I'm sorry, I had trouble responding. Please try again.",
      }]);
    }

    setSending(false);
  }

  return (
    <div className="flex min-h-full flex-col font-sans" style={{ backgroundColor: c.bg }}>
      {/* Header */}
      <header
        className="flex shrink-0 items-center gap-4 border-b px-6 py-4"
        style={{ backgroundColor: c.card, borderColor: c.border }}
      >
        <Link href="/dashboard" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: c.inkMuted }}>
          ← Back
        </Link>
        <div className="flex items-center gap-2">
          <AapunMark size={28} />
          <div>
            <span className="font-semibold" style={{ color: c.ink }}>Aapun AI</span>
            <p className="text-xs" style={{ color: c.inkMuted }}>Here to listen while we find your match</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-2xl space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {msg.role === "assistant" && (
                <div
                  className="flex shrink-0 items-center justify-center rounded-full text-white font-medium text-xs"
                  style={{ width: 32, height: 32, backgroundColor: c.sage }}
                >
                  AI
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"}`}
                style={
                  msg.role === "user"
                    ? { backgroundColor: c.sage, color: "#fff" }
                    : { backgroundColor: c.card, color: c.ink, borderWidth: 1, borderStyle: "solid", borderColor: c.border }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-end gap-2">
              <div className="flex shrink-0 items-center justify-center rounded-full text-white font-medium text-xs" style={{ width: 32, height: 32, backgroundColor: c.sage }}>
                AI
              </div>
              <div className="rounded-2xl rounded-bl-sm px-4 py-3 text-sm" style={{ backgroundColor: c.card, borderWidth: 1, borderStyle: "solid", borderColor: c.border, color: c.inkMuted }}>
                Typing…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="shrink-0 border-t px-6 py-4" style={{ backgroundColor: c.card, borderColor: c.border }}>
        <div className="mx-auto w-full max-w-2xl">
          {showEmojiPicker && (
            <div ref={emojiRef} className="mb-2">
              <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.LIGHT} width="100%" height={350} />
            </div>
          )}
          <div className="flex gap-3 items-center">
            <button onClick={() => setShowEmojiPicker((prev) => !prev)} className="text-xl transition-opacity hover:opacity-70" aria-label="Add emoji">
              😊
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Share what's on your mind…"
              className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3a6b5c]/30"
              style={{ backgroundColor: "#fff", borderWidth: 1, borderStyle: "solid", borderColor: c.border, color: c.ink }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-[#2f584b] disabled:opacity-40"
              style={{ backgroundColor: c.sage }}
            >
              ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AapunMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="15" cy="20" r="11" fill={`${c.sage}33`} stroke={c.sage} strokeWidth="1.5" />
      <circle cx="25" cy="20" r="11" fill={`${c.apricot}33`} stroke={c.apricot} strokeWidth="1.5" />
    </svg>
  );
}