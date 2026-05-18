"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { notifyMessage } from "@/app/get-started/actions";

const c = {
  bg: "#f5f3f8",
  ink: "#1a1625",
  inkSoft: "#3d3654",
  inkMuted: "#9b91b8",
  sage: "#6b5b9e",
  sageLight: "#ede8f8",
  apricot: "#c97a52",
  apricotLight: "#f5ece6",
  card: "#ffffff",
  border: "#edeaf4",
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

type MatchInfo = {
  recipient_user_id: string;
  recipient_name: string;
};

type ProfileInfo = {
  experience_categories: string[];
  description: string;
};

function Avatar({ name, photo, size = 36 }: { name: string; photo?: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#6b5b9e", "#c97a52", "#5c6b3a", "#6b3a5c", "#3a5c6b"];
  const color = colors[name.charCodeAt(0) % colors.length];

  if (photo) {
    return <img src={photo} alt={name} width={size} height={size} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />;
  }

  return (
    <div className="flex shrink-0 items-center justify-center rounded-full text-white font-medium"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.35 }}>
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
  const [authorized, setAuthorized] = useState(false);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
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

    let myProfile: ProfileInfo | null = null;
    let theirProfile: ProfileInfo | null = null;

    // Security check — verify this user owns this chat
    supabase
      .from("profiles")
      .select("full_name, experience_categories, description")
      .eq("user_id", user.id)
      .eq("match_id", matchId)
      .limit(1)
      .then(({ data }) => {
        if (!data || data.length === 0) {
          router.push("/dashboard");
          return;
        }
        setAuthorized(true);
        setSenderName(data[0].full_name);
        myProfile = { experience_categories: data[0].experience_categories, description: data[0].description };
        if (theirProfile) generatePrompts(myProfile, theirProfile);
      });

    // Get the other person's profile
    supabase
      .from("profiles")
      .select("user_id, full_name, experience_categories, description")
      .eq("match_id", matchId)
      .neq("user_id", user.id)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMatchInfo({ recipient_user_id: data[0].user_id, recipient_name: data[0].full_name });
          theirProfile = { experience_categories: data[0].experience_categories, description: data[0].description };
          if (myProfile) generatePrompts(myProfile, theirProfile);
        }
      });

    // Load messages
    supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages(data || []);
      });

    // Mark messages as read
    fetch("/api/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, userId: user.id }),
    });

    // Real-time subscription
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isLoaded, user, matchId]);

  async function generatePrompts(myProfile: ProfileInfo, theirProfile: ProfileInfo) {
    try {
      const res = await fetch("/api/chat-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoriesA: myProfile.experience_categories,
          descriptionA: myProfile.description,
          categoriesB: theirProfile.experience_categories,
          descriptionB: theirProfile.description,
        }),
      });
      const data = await res.json();
      if (data.prompts) setPrompts(data.prompts);
    } catch (err) {
      console.error("Prompts error:", err);
    }
    setLoadingPrompts(false);
  }

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

  async function sendMessage(content?: string) {
    const messageToSend = content || newMessage.trim();
    if (!messageToSend || !user || sending) return;
    setSending(true);

    await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: user.id,
      sender_name: senderName || "You",
      sender_photo: user.imageUrl || null,
      content: messageToSend,
    });

    if (matchInfo) {
      await notifyMessage(matchInfo.recipient_user_id, matchInfo.recipient_name, senderName || "Your match", matchId);
    }

    setNewMessage("");
    setSending(false);
  }

  if (!isLoaded || (isLoaded && !authorized && senderName === "")) {
    return (
      <div className="flex min-h-screen items-center justify-center font-sans" style={{ backgroundColor: c.bg }}>
        <p className="text-sm" style={{ color: c.inkMuted }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col font-sans" style={{ backgroundColor: c.bg }}>
      {/* Header */}
      <header className="flex shrink-0 items-center gap-4 border-b px-6 py-4"
        style={{ backgroundColor: c.card, borderColor: c.border }}>
        <Link href="/dashboard" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: c.inkMuted }}>
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

          {messages.length === 0 && !loadingPrompts && prompts.length > 0 && (
            <div className="mb-4">
              <p className="mb-3 text-center text-xs font-medium" style={{ color: c.inkMuted }}>
                Not sure how to start? Try one of these:
              </p>
              <div className="flex flex-col gap-2">
                {prompts.map((prompt, i) => (
                  <button key={i} onClick={() => sendMessage(prompt)}
                    className="rounded-2xl px-4 py-3 text-sm text-left transition-colors hover:opacity-80"
                    style={{ backgroundColor: c.sageLight, color: c.sage, borderWidth: 1, borderStyle: "solid", borderColor: c.border }}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.length === 0 && loadingPrompts && (
            <p className="py-4 text-center text-xs" style={{ color: c.inkMuted }}>
              Preparing conversation starters…
            </p>
          )}

          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar name={msg.sender_name} photo={msg.sender_photo} size={32} />
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isMe ? "rounded-br-sm" : "rounded-bl-sm"}`}
                  style={isMe
                    ? { backgroundColor: c.sage, color: "#fff" }
                    : { backgroundColor: c.card, color: c.ink, borderWidth: 1, borderStyle: "solid", borderColor: c.border }}>
                  {!isMe && (
                    <p className="mb-1 text-xs font-medium" style={{ color: c.inkMuted }}>{msg.sender_name}</p>
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
      <footer className="shrink-0 border-t px-6 py-4" style={{ backgroundColor: c.card, borderColor: c.border }}>
        <div className="mx-auto w-full max-w-2xl">
          {showEmojiPicker && (
            <div ref={emojiRef} className="mb-2">
              <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.LIGHT} width="100%" height={350} />
            </div>
          )}
          <div className="flex gap-3 items-center">
            <button onClick={() => setShowEmojiPicker((prev) => !prev)} className="text-xl transition-opacity hover:opacity-70">
              😊
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Say something…"
              className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
              style={{ backgroundColor: "#fff", borderWidth: 1, borderStyle: "solid", borderColor: c.border, color: c.ink }}
            />
            <button onClick={() => sendMessage()} disabled={!newMessage.trim() || sending}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white disabled:opacity-40"
              style={{ backgroundColor: c.sage }}>
              ↑
            </button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs" style={{ color: c.inkMuted }}>
              🔒 Private — messages deleted after 3 days.
            </p>
            <Link href="/notes" className="text-xs transition-opacity hover:opacity-70" style={{ color: c.sage }}>
              📝 Take a note
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AapunMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="15" cy="20" r="11" fill="rgba(107,91,158,0.2)" stroke="rgba(107,91,158,0.5)" strokeWidth="1.5" />
      <circle cx="25" cy="20" r="11" fill="rgba(201,122,82,0.2)" stroke="rgba(201,122,82,0.5)" strokeWidth="1.5" />
    </svg>
  );
}