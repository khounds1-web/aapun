"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const c = {
  bg: "#f5f0ea",
  sidebar: "#1c2824",
  sidebarText: "#a8bfb8",
  sidebarActive: "#ffffff",
  ink: "#1c2824",
  inkSoft: "#4a5c56",
  inkMuted: "#6d8078",
  sage: "#3a6b5c",
  sageDark: "#2f584b",
  sageLight: "#e4ede9",
  apricot: "#c97a52",
  apricotLight: "#f3e4db",
  card: "#ffffff",
  border: "#e8e0d8",
} as const;

type Topic = {
  id: string;
  full_name: string;
  description: string;
  experience_categories: string[];
  created_at: string;
  match_status?: string;
  matched_with?: string;
  match_id?: string;
};

type GroupedCategory = {
  category: string;
  topics: Topic[];
  matches: Topic[];
  unmatched: Topic[];
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getGreetingEmoji() {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️";
  if (hour < 17) return "🌤️";
  return "🌙";
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("home");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/"); return; }
    loadTopics();
  }, [isLoaded, user]);

  async function loadTopics() {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    setTopics(data || []);
    setLoading(false);
  }

  const firstName = user?.firstName || topics[0]?.full_name?.split(" ")[0] || "there";

  const groupedCategories: GroupedCategory[] = [];
  const seen = new Map<string, GroupedCategory>();

  topics.forEach((topic) => {
    const key = topic.experience_categories.join(",");
    if (!seen.has(key)) {
      const group: GroupedCategory = {
        category: topic.experience_categories[0] || "General",
        topics: [],
        matches: [],
        unmatched: [],
      };
      seen.set(key, group);
      groupedCategories.push(group);
    }
    const group = seen.get(key)!;
    group.topics.push(topic);
    if (topic.matched_with) group.matches.push(topic);
    else group.unmatched.push(topic);
  });

  const navItems = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "topics", label: "Topics", icon: TopicsIcon, href: "/get-started" },
    { id: "conversations", label: "Chats", icon: ChatIcon },
    { id: "matches", label: "Matches", icon: MatchIcon },
    { id: "profile", label: "Profile", icon: ProfileIcon },
  ];

  return (
    <div className="flex min-h-full font-sans" style={{ backgroundColor: c.bg }}>

      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex w-60 flex-col fixed inset-y-0 left-0 z-10"
        style={{ backgroundColor: c.sidebar }}>
        <div className="flex items-center gap-3 px-6 py-6">
          <AapunMarkLight size={32} />
          <span className="text-lg font-semibold text-white">Aapun</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button key={item.id}
                onClick={() => { setActiveNav(item.id); if (item.href) router.push(item.href); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent", color: isActive ? c.sidebarActive : c.sidebarText }}>
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mx-3 mb-4 rounded-2xl overflow-hidden relative" style={{ height: 160 }}>
          <Image src="/mugs.png" alt="Aapun" fill className="object-cover opacity-60" />
          <div className="absolute inset-0 p-4 flex flex-col justify-end"
            style={{ background: "linear-gradient(to top, rgba(28,40,36,0.9), transparent)" }}>
            <p className="text-xs text-white leading-snug">A safe space to share, listen, and truly get it.</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-full">

        {/* Top bar */}
        <header className="sticky top-0 z-10 border-b px-4 py-3 sm:px-8 sm:py-4"
          style={{ backgroundColor: c.bg, borderColor: c.border }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold sm:text-xl leading-tight" style={{ color: c.ink }}>
                {getGreeting()}, {firstName} {getGreetingEmoji()}
              </h1>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: c.inkMuted }}>
                You're showing up for yourself. We're glad you're here.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/get-started"
                className="inline-flex h-9 items-center gap-1 justify-center rounded-full px-4 text-sm font-medium text-white transition-colors hover:bg-[#2f584b]"
                style={{ backgroundColor: c.sage }}>
                + Add
              </Link>
              <UserButton />
            </div>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-10 flex items-center justify-around border-t py-2 px-4"
          style={{ backgroundColor: c.bg, borderColor: c.border }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button key={item.id}
                onClick={() => { setActiveNav(item.id); if (item.href) router.push(item.href); }}
                className="flex flex-col items-center gap-0.5 px-3 py-1"
                style={{ color: isActive ? c.sage : c.inkMuted }}>
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 pb-24 lg:pb-8">
          {loading ? (
            <p className="text-sm" style={{ color: c.inkMuted }}>Loading…</p>
          ) : (
            <div className="max-w-4xl space-y-6">

              {/* Topics */}
              <section>
                <div className="mb-4">
                  <h2 className="text-base font-semibold sm:text-lg" style={{ color: c.ink }}>Your topics</h2>
                  <p className="text-xs sm:text-sm" style={{ color: c.inkMuted }}>Each topic is looking for a peer who gets it.</p>
                </div>

                {groupedCategories.length === 0 ? (
                  <div className="rounded-2xl p-8 text-center border"
                    style={{ backgroundColor: c.card, borderColor: c.border }}>
                    <p className="mb-2 font-medium" style={{ color: c.ink }}>No topics yet</p>
                    <p className="mb-4 text-sm" style={{ color: c.inkMuted }}>Add your first topic to start finding a peer.</p>
                    <Link href="/get-started"
                      className="inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-medium text-white"
                      style={{ backgroundColor: c.sage }}>
                      Get started
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupedCategories.map((group, i) => (
                      <div key={i} className="rounded-2xl border p-4 sm:p-5"
                        style={{ backgroundColor: c.card, borderColor: c.border }}>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {group.topics[0].experience_categories.map((cat) => (
                            <span key={cat} className="rounded-full px-2.5 py-1 text-xs font-medium"
                              style={{ backgroundColor: c.sageLight, color: c.sage }}>
                              {cat}
                            </span>
                          ))}
                        </div>

                        {/* Status */}
                        <div className="mb-3">
                          {group.matches.length > 0 ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: c.sage }}>
                              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.sage }} />
                              {group.matches.length === 1
                                ? `Matched with ${group.matches[0].matched_with}`
                                : `${group.matches.length} matches`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: c.inkMuted }}>
                              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.apricot }} />
                              Looking for a match
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {group.matches.length === 1 && group.matches[0].match_id ? (
                            <>
                              <Link
                                href={`/matches/${encodeURIComponent(group.category)}?matchId=${group.matches[0].match_id}`}
                                className="rounded-full px-4 py-2 text-xs font-medium transition-colors"
                                style={{ backgroundColor: c.sageLight, color: c.sage }}>
                                See match →
                              </Link>
                              <Link href={`/chat/${group.matches[0].match_id}`}
                                className="rounded-full px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#2f584b]"
                                style={{ backgroundColor: c.sage }}>
                                Chat
                              </Link>
                            </>
                          ) : group.matches.length > 1 ? (
                            <Link
                              href={`/matches/${encodeURIComponent(group.category)}?ids=${group.matches.map(m => m.match_id).join(",")}`}
                              className="rounded-full px-4 py-2 text-xs font-medium transition-colors"
                              style={{ backgroundColor: c.sageLight, color: c.sage }}>
                              See all matches →
                            </Link>
                          ) : (
                            <Link href={`/ai-chat/${group.topics[0].id}`}
                              className="rounded-full px-4 py-2 text-xs font-medium transition-colors"
                              style={{ backgroundColor: c.apricotLight, color: c.apricot }}>
                              Chat with AI
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Bottom cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5 border" style={{ backgroundColor: c.apricotLight, borderColor: `${c.apricot}33` }}>
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full text-lg"
                    style={{ backgroundColor: "rgba(201,122,82,0.2)" }}>✦</div>
                  <h3 className="mb-1 font-semibold text-sm" style={{ color: c.ink }}>Chat with Aapun AI</h3>
                  <p className="mb-3 text-xs leading-relaxed" style={{ color: c.inkSoft }}>
                    Get support and a listening ear — anytime.
                  </p>
                  {topics.length > 0 ? (
                    <Link href={`/ai-chat/${topics[0].id}`}
                      className="inline-flex h-9 items-center justify-center rounded-full px-5 text-sm font-medium text-white"
                      style={{ backgroundColor: c.apricot }}>
                      Start chatting
                    </Link>
                  ) : (
                    <Link href="/get-started"
                      className="inline-flex h-9 items-center justify-center rounded-full px-5 text-sm font-medium text-white"
                      style={{ backgroundColor: c.apricot }}>
                      Add a topic first
                    </Link>
                  )}
                </div>

                <div className="rounded-2xl p-5 border" style={{ backgroundColor: c.sageLight, borderColor: `${c.sage}22` }}>
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full text-lg"
                    style={{ backgroundColor: "rgba(58,107,92,0.15)" }}>🔒</div>
                  <h3 className="mb-1 font-semibold text-sm" style={{ color: c.ink }}>Your privacy matters</h3>
                  <p className="text-xs leading-relaxed" style={{ color: c.inkSoft }}>
                    Conversations are private and deleted after 3 days.
                  </p>
                </div>
              </section>

              <div className="flex items-center gap-3 py-2">
                <span style={{ color: c.apricot }}>♡</span>
                <p className="text-xs italic" style={{ color: c.inkMuted }}>
                  You don't have to go through it alone. We're here, together.
                </p>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function HomeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function TopicsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
    </svg>
  );
}
function ChatIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function MatchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function ProfileIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function AapunMarkLight({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="15" cy="20" r="11" fill="rgba(58,107,92,0.4)" stroke="rgba(58,107,92,0.8)" strokeWidth="1.5" />
      <circle cx="25" cy="20" r="11" fill="rgba(201,122,82,0.4)" stroke="rgba(201,122,82,0.8)" strokeWidth="1.5" />
    </svg>
  );
}
