"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const c = {
  bg: "#f7f5f9",
  ink: "#1e1a2e",
  inkSoft: "#4a4060",
  inkMuted: "#9b91b0",
  sage: "#6b5b9e",
  sageDark: "#574a85",
  sageLight: "#ede8f8",
  apricot: "#c97a52",
  apricotLight: "#f3e4db",
  card: "#ffffff",
  border: "#ece7f5",
  green: "#5a7c65",
  greenLight: "#eef3f0",
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
        topics: [], matches: [], unmatched: [],
      };
      seen.set(key, group);
      groupedCategories.push(group);
    }
    const group = seen.get(key)!;
    group.topics.push(topic);
    if (topic.matched_with) group.matches.push(topic);
    else group.unmatched.push(topic);
  });

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: c.bg }}>

      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b px-6 sm:px-10"
        style={{ backgroundColor: c.bg, borderColor: c.border }}>
        <div className="mx-auto max-w-4xl flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <AapunMark size={28} />
            <span className="text-base font-semibold" style={{ color: c.ink }}>Aapun</span>
          </div>

          {/* Nav links — desktop */}
          <nav className="hidden sm:flex items-center gap-8">
            {[
              { id: "home", label: "Home", href: "/dashboard" },
              { id: "conversations", label: "Conversations" },
              { id: "topics", label: "Topics", href: "/get-started" },
              { id: "read", label: "Read", href: "/resources" },
              { id: "profile", label: "Profile" },
            ].map((item) => (
              <button key={item.id}
                onClick={() => { setActiveNav(item.id); if (item.href) router.push(item.href); }}
                className="text-sm transition-opacity hover:opacity-70"
                style={{
                  color: activeNav === item.id ? c.sage : c.inkMuted,
                  fontWeight: activeNav === item.id ? 500 : 400,
                }}>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right — add + avatar */}
          <div className="flex items-center gap-3">
            <Link href="/get-started"
              className="hidden sm:inline-flex h-8 items-center justify-center rounded-full px-4 text-xs font-medium text-white"
              style={{ backgroundColor: c.sage }}>
              + Add Topics
            </Link>
            <UserButton />
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex items-center gap-6 pb-3 overflow-x-auto">
          {[
            { id: "home", label: "Home", href: "/dashboard" },
            { id: "conversations", label: "Conversations" },
            { id: "topics", label: "Topics", href: "/get-started" },
            { id: "read", label: "Read", href: "/resources" },
            { id: "profile", label: "Profile" },
          ].map((item) => (
            <button key={item.id}
              onClick={() => { setActiveNav(item.id); if (item.href) router.push(item.href); }}
              className="text-sm whitespace-nowrap transition-opacity"
              style={{
                color: activeNav === item.id ? c.sage : c.inkMuted,
                fontWeight: activeNav === item.id ? 500 : 400,
              }}>
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-10 sm:px-10">

        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold" style={{ color: c.ink }}>
            {getGreeting()}, {firstName} {getGreetingEmoji()}
          </h1>
          <p className="mt-1 text-sm" style={{ color: c.inkMuted }}>
            You're showing up for yourself. We're glad you're here.
          </p>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: c.inkMuted }}>Loading…</p>
        ) : (
          <div className="space-y-10">

            {/* Your spaces */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold" style={{ color: c.ink }}>Your spaces</h2>
                  <p className="text-xs mt-0.5" style={{ color: c.inkMuted }}>Each space is holding a connection for you.</p>
                </div>
                <Link href="/get-started" className="text-xs" style={{ color: c.sage }}>+ Add space</Link>
              </div>

              {groupedCategories.length === 0 ? (
                <div className="rounded-2xl p-10 text-center border"
                  style={{ backgroundColor: c.card, borderColor: c.border }}>
                  <p className="mb-1 font-medium text-sm" style={{ color: c.ink }}>Nothing here yet</p>
                  <p className="mb-5 text-xs" style={{ color: c.inkMuted }}>
                    Add your first space to begin finding someone who gets it.
                  </p>
                  <Link href="/get-started"
                    className="inline-flex h-9 items-center justify-center rounded-full px-6 text-sm font-medium text-white"
                    style={{ backgroundColor: c.sage }}>
                    Begin
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {groupedCategories.map((group, i) => (
                    <div key={i} className="rounded-2xl border p-5"
                      style={{ backgroundColor: c.card, borderColor: c.border }}>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {group.topics[0].experience_categories.map((cat) => (
                          <span key={cat} className="rounded-full px-3 py-1 text-xs"
                            style={{ backgroundColor: c.sageLight, color: c.sage }}>
                            {cat}
                          </span>
                        ))}
                      </div>

                      {group.matches.length > 0 ? (
                        <div>
                          <p className="text-sm mb-3" style={{ color: c.inkSoft }}>
                            <span className="inline-block h-2 w-2 rounded-full mr-2 align-middle" style={{ backgroundColor: c.green }} />
                            {group.matches.length === 1
                              ? `Spend time together with ${group.matches[0].matched_with}`
                              : `${group.matches.length} people to connect with`}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {group.matches.length === 1 && group.matches[0].match_id ? (
                              <>
                                <Link href={`/matches/${encodeURIComponent(group.category)}?matchId=${group.matches[0].match_id}`}
                                  className="rounded-full px-4 py-1.5 text-xs border transition-opacity hover:opacity-70"
                                  style={{ borderColor: c.border, color: c.inkSoft }}>
                                  Learn more
                                </Link>
                                <Link href={`/chat/${group.matches[0].match_id}`}
                                  className="rounded-full px-4 py-1.5 text-xs font-medium text-white"
                                  style={{ backgroundColor: c.sage }}>
                                  Say hello
                                </Link>
                              </>
                            ) : (
                              <Link href={`/matches/${encodeURIComponent(group.category)}?ids=${group.matches.map(m => m.match_id).join(",")}`}
                                className="rounded-full px-4 py-1.5 text-xs font-medium text-white"
                                style={{ backgroundColor: c.sage }}>
                                See connections
                              </Link>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs mb-3" style={{ color: c.inkMuted }}>
                            <span className="inline-block h-2 w-2 rounded-full mr-2 align-middle" style={{ backgroundColor: c.apricot }} />
                            Finding your person — sit tight.
                          </p>
                          <Link href={`/ai-chat/${group.topics[0].id}`}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs border transition-opacity hover:opacity-70"
                            style={{ borderColor: c.border, color: c.inkSoft }}>
                            ✦ Reflect with AI in the meantime
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Bottom cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl p-6 border" style={{ backgroundColor: c.sageLight, borderColor: `${c.sage}22` }}>
                <p className="text-lg mb-1" style={{ color: c.sage }}>✦</p>
                <h3 className="mb-1.5 font-medium text-sm" style={{ color: c.ink }}>Reflect with AI</h3>
                <p className="mb-4 text-xs leading-relaxed" style={{ color: c.inkSoft }}>
                  A quiet space to talk things through, anytime.
                </p>
                {topics.length > 0 ? (
                  <Link href={`/ai-chat/${topics[0].id}`}
                    className="inline-flex h-8 items-center justify-center rounded-full px-4 text-xs font-medium text-white"
                    style={{ backgroundColor: c.sage }}>
                    Begin
                  </Link>
                ) : (
                  <Link href="/get-started"
                    className="inline-flex h-8 items-center justify-center rounded-full px-4 text-xs font-medium text-white"
                    style={{ backgroundColor: c.sage }}>
                    Add a space first
                  </Link>
                )}
              </div>

              <div className="rounded-2xl p-6 border" style={{ backgroundColor: c.card, borderColor: c.border }}>
                <p className="text-lg mb-1">🔒</p>
                <h3 className="mb-1.5 font-medium text-sm" style={{ color: c.ink }}>Your privacy matters</h3>
                <p className="text-xs leading-relaxed" style={{ color: c.inkMuted }}>
                  Conversations are private and gently fade after 3 days.
                </p>
              </div>
            </section>

            <p className="text-xs italic text-center py-2" style={{ color: c.inkMuted }}>
              You don't have to go through it alone. We're here, together. ♡
            </p>

          </div>
        )}
      </main>
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