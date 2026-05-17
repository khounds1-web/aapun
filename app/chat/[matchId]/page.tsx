"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { notifyMessage } from "@/app/get-started/actions";

const c = {
  bg: "#f6f4ef",
  ink: "#1c2824",
  inkSoft: "#4a5c56",
  inkMuted: "#6d8078",
  sage: "#6b5b9e",
  sageDark: "#574a85",
  sageLight: "#ede8f8",
  apricot: "#c97a52",
  apricotLight: "#f3e4db",
  card: "rgba(255, 255, 255, 0.85)",
  border: "#ece7f5",
} as const;

type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  sender_name: string;
  sender_photo?: string;
  content: string;
  created_at: string;
  is_anonymous: boolean;
};

type MatchInfo = {
  recipient_user_id: string;
  recipient_name: string;
};

type ProfileInfo = {
  experience_categories: string[];
  description: string;
};

function Avatar({ name, photo, size = 36, isAnonymous = false }: { name: string; photo?: string; size?: number; isAnonymous?: boolean }) {
  if (isAnonymous) {
    return (
      <div className="flex shrink-0 items-center justify-center rounded-full"
        style={{ width: size, height: size, backgroundColor: c.sageLight }}>
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke={c.sage} strokeWidth="1.5">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      </div>
    );
  }

  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#6b5b9e", "#c97a52", "#5c6b3a", "#6b3a5c", "#3a5c6b", "#6b5c3a", "#3a3a6b", "#6b3a3a"];
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
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const storageKey = `aapun_anon_${matchId}`;
const savedChoice = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
const [anonymityChosen, setAnonymityChosen] = useState(savedChoice !== null);
const [isAnonymous, setIsAnonymous] = useState(savedChoice === "true");
  const [otherIsAnonymous, setOtherIsAnonymous] = useState(false);

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

    // SECURITY CHECK — verify this user owns this chat
    supabase
      .from("profiles")
      .select("full_name, experience_categories, description")
      .eq("user_id", user.id)
      .eq("match_id", matchId)
      .limit(1)
      .then(({ data }) => {
        if (!data || data.length === 0) {
          // Not their chat — redirect to dashboard
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
        const otherMessages = (data || []).filter((m: Message) => m.sender_id !== user.id);
        if (otherMessages.some((m: Message) => m.is_anonymous)) {
          setOtherIsAnonymous(true);
        }
      });

    // Mark messages as read
    supabase
      .from("messages")
      .update({ read: true })
      .eq("match_id", matchId)
      .neq("sender_id", user.id);

    // Real-time subscription
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => [...prev, newMsg]);
        if (newMsg.sender_id !== user.id && newMsg.is_anonymous) {
          setOtherIsAnonymous(true);
        }
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
      sender_name: isAnonymous ? "A parent" : senderName || "You",
      sender_photo: isAnonymous ? null : (user.imageUrl || null),
      content: messageToSend,
      is_anonymous: isAnonymous,
    });

    if (matchInfo) {
      await notifyMessage(matchInfo.recipient_user_id, matchInfo.recipient_name, isAnonymous ? "Someone" : senderName || "Your match", matchId);
    }

    setNewMessage("");
    setSending(false);
  }

  // Loading state
  if (!isLoaded || (isLoaded && !authorized && senderName === "")) {
    return (
      <div className="flex min-h-screen items-center justify-center font-sans" style={{ backgroundColor: c.bg }}>
        <p className="text-sm" style={{ color: c.inkMuted }}>Loading…</p>
      </div>
    );
  }

  // Anonymity choice screen
  if (!anonymityChosen) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center font-sans px-6"
        style={{ backgroundColor: c.bg }}>
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2">
            <AapunMark size={28} />
            <span className="font-semibold" style={{ color: c.ink }}>Before you say hi</span>
          </div>

          <div className="rounded-2xl p-6 shadow-sm mb-4"
            style={{ backgroundColor: c.card, borderWidth: 1, borderStyle: "solid", borderColor: c.border }}>
            <h2 className="mb-2 text-lg font-semibold" style={{ color: c.ink }}>
              How would you like to appear?
            </h2>
            <p className="mb-6 text-sm leading-relaxed" style={{ color: c.inkSoft }}>
              You can chat using your real name or stay anonymous. Your match won't know your identity if you choose anonymous.
            </p>

            <div className="space-y-3">
              <button
onClick={() => { setIsAnonymous(false); setAnonymityChosen(true); localStorage.setItem(storageKey, "false"); }}                className="w-full rounded-xl p-4 text-left transition-colors hover:opacity-90 border"
                style={{ backgroundColor: c.sageLight, borderColor: `${c.sage}33` }}>
                <p className="font-medium text-sm" style={{ color: c.sage }}>Use my name — {senderName}</p>
                <p className="text-xs mt-1" style={{ color: c.inkMuted }}>Your name and photo will be visible</p>
              </button>

              <button
onClick={() => { setIsAnonymous(true); setAnonymityChosen(true); localStorage.setItem(storageKey, "true"); }}                className="w-full rounded-xl p-4 text-left transition-colors hover:opacity-90 border"
                style={{ backgroundColor: c.apricotLight, borderColor: `${c.apricot}33` }}>
                <p className="font-medium text-sm" style={{ color: c.apricot }}>Stay anonymous</p>
                <p className="text-xs mt-1" style={{ color: c.inkMuted }}>You'll appear as "A parent" with no photo</p>
              </button>
            </div>
          </div>

          <Link href="/dashboard" className="text-xs text-center block transition-opacity hover:opacity-70"
            style={{ color: c.inkMuted }}>
            ← Back to dashboard
          </Link>
        </div>
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
          <div>
            <span className="font-semibold" style={{ color: c.ink }}>Your conversation</span>
            {isAnonymous && (
              <p className="text-xs" style={{ color: c.apricot }}>You're chatting anonymously</p>
            )}
          </div>
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
            const anonymous = msg.is_anonymous;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar name={msg.sender_name} photo={anonymous ? undefined : msg.sender_photo} size={32} isAnonymous={anonymous && !isMe} />
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isMe ? "rounded-br-sm" : "rounded-bl-sm"}`}
                  style={isMe
                    ? { backgroundColor: c.sage, color: "#fff" }
                    : { backgroundColor: c.card, color: c.ink, borderWidth: 1, borderStyle: "solid", borderColor: c.border }}>
                  {!isMe && (
                    <p className="mb-1 text-xs font-medium" style={{ color: c.inkMuted }}>
                      {anonymous ? "A parent" : msg.sender_name}
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
              placeholder={isAnonymous ? "Say something anonymously…" : "Say something…"}
              className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2"
              style={{ backgroundColor: "#fff", borderWidth: 1, borderStyle: "solid", borderColor: c.border, color: c.ink }}
            />
            <button onClick={() => sendMessage()} disabled={!newMessage.trim() || sending}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors disabled:opacity-40"
              style={{ backgroundColor: c.sage }}>
              ↑
            </button>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: c.border }}>
            <p className="text-xs" style={{ color: c.inkMuted }}>
              🔒 Private — messages deleted after 3 days.
              {otherIsAnonymous && " Your match is anonymous."}
            </p>
            <a href="/notes" className="text-xs transition-opacity hover:opacity-70" style={{ color: c.sage }}>
              📝 Take a note
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AapunMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="15" cy="20" r="11" fill="rgba(107,91,158,0.25)" stroke="rgba(107,91,158,0.6)" strokeWidth="1.5" />
      <circle cx="25" cy="20" r="11" fill="rgba(201,122,82,0.25)" stroke="rgba(201,122,82,0.6)" strokeWidth="1.5" />
    </svg>
  );
}