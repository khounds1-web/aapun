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
  apricot: "#c97a52",
  apricotLight: "#f3e4db",
  card: "rgba(255, 255, 255, 0.85)",
  border: "#d8e4de",
} as const;

type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  sender_name: string;
  sender_photo?: string;
  content: string;
  created_at: string;
};

function Avatar({ name, photo, size = 36 }: { name: string; photo?: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    "#3a6b5c", "#c97a52", "#5c6b3a", "#6b3a5c", "#3a5c6b",
    "#6b5c3a", "#3a3a6b", "#6b3a3a",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-white font-medium"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/");
      return;
    }

    // Get sender name from profiles
    supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setSenderName(data[0].full_name);
      });

    // Load existing messages
    supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages(data || []);
      });

    // Subscribe to new messages in real time
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoaded, user, matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close emoji picker when clicking outside
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
    if (!newMessage.trim() || !user || sending) return;
    setSending(true);

    await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: user.id,
      sender_name: senderName || "You",
      sender_photo: user.imageUrl || null,
      content: newMessage.trim(),
    });

    setNewMessage("");
    setSending(false);
  }

  return (
    <div
      className="flex min-h-full flex-col font-sans"
      style={{ backgroundColor: c.bg }}
    >
      {/* Header */}
      <header
        className="flex shrink-0 items-center gap-4 border-b px-6 py-4"
        style={{ backgroundColor: c.card, borderColor: c.border }}
      >
        <Link
          href="/dashboard"
          className="text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: c.inkMuted }}
        >
          ← Back
        </Link>
        <div className="flex items-center gap-2">
          <AapunMark size={28} />
          <span className="font-semibold" style={{ color: c.ink }}>Your conversation</span>
        </div>
      </header>

      {/* Messages */}
      <main className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-2xl space-y-4">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm" style={{ color: c.inkMuted }}>
              Say hi — your match will see it when they log in. 👋
            </p>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar
                  name={msg.sender_name}
                  photo={msg.sender_photo}
                  size={32}
                />
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isMe ? "rounded-br-sm" : "rounded-bl-sm"
                  }`}
                  style={
                    isMe
                      ? { backgroundColor: c.sage, color: "#fff" }
                      : { backgroundColor: c.card, color: c.ink, borderWidth: 1, borderStyle: "solid", borderColor: c.border }
                  }
                >
                  {!isMe && (
                    <p className="mb-1 text-xs font-medium" style={{ color: c.inkMuted }}>
                      {msg.sender_name}
                    </p>
                  )}
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer
        className="shrink-0 border-t px-6 py-4"
        style={{ backgroundColor: c.card, borderColor: c.border }}
      >
        <div className="mx-auto w-full max-w-2xl">
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div ref={emojiRef} className="mb-2">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme={Theme.LIGHT}
                width="100%"
                height={350}
              />
            </div>
          )}

          <div className="flex gap-3 items-center">
            {/* Emoji button */}
            <button
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="text-xl transition-opacity hover:opacity-70"
              aria-label="Add emoji"
            >
              😊
            </button>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Say something…"
              className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3a6b5c]/30"
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: c.border,
                color: c.ink,
              }}
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