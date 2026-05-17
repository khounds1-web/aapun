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
} as const;

const FEATURED_RESOURCES = [
  { type: "read", title: "Nobody Told Me", subtitle: "About Becoming a Mom", description: "A gentle read about the real emotions behind early motherhood.", coverBg: "#e8e2d4", coverText: "Nobody\nTold Me" },
  { type: "listen", title: "The Lavender Hour", subtitle: "Ep. 42", description: "The invisible load no one talks about.", coverBg: "#ddd4e8", coverText: "THE\nLAVENDER\nHOUR" },
  { type: "read", title: "Good Inside", subtitle: "Dr. Becky Kennedy", description: "The parenting manual you always wanted.", coverBg: "#d4e4d8", coverText: "Good\nInside" },
  { type: "listen", title: "Mom and Mind", subtitle: "Latest episode", description: "Honest conversations about postpartum.", coverBg: "#e4d8d4", coverText: "Mom\n&\nMind" },
];

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

function BookCover({ bg, text }: { bg: string; text: string }) {
  return (
    <div className="shrink-0 rounded-md flex items-center justify-center p-2 text-center"
      style={{ width: 56, height: 72, backgroundColor: bg }}>
      <span className="font-medium leading-tight whitespace-pre-line" style={{ color: c.ink, fontSize: 9 }}>
        {text}
      </span>
    </div>
  );
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
      const group: GroupedCategory = { category: topic.experience_categories[0] || "General", topics: [], matches: [], unmatched: [] };
      seen.set(key, group);
      groupedCategories.push(group);
    }
    const group = seen.get(key)!;
    group.topics.push(topic);
    if (topic.matched_with) group.matches.push(topic);
    else group.unmatched.push(topic);
  });

  const navLinks = [
    { id: "home", label: "Home", href: "/dashboard" },
    { id: "conversations", label: "Conversations" },
    { id: "topics", label: "Topics", href: "/get-started" },
    { id: "read", label: "Read", href: "/resources" },
    { id: "profile", label: "Profile" },
  ];

  const aiHref = topics.length > 0 ? `/ai-chat/${topics[0].id}` : "/get-started";

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: c.bg }}>

      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b px-6 sm:px-10"
        style={{ backgroundColor: c.bg, borderColor: c.border }}>
        <div className="mx-auto max-w-5xl flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <AapunMark size={28} />
            <span className="text-base font-semibold" style={{ color: c.ink }}>Aapun</span>
          </div>
          <nav className="hidden sm:flex items-center gap-8">
            {navLinks.map((item) => (
              <button key={item.id}
                onClick={() => { setActiveNav(item.id); if (item.href) router.push(item.href); }}
                className="text-sm transition-opacity hover:opacity-70"
                style={{ color: activeNav === item.id ? c.sage : c.inkMuted, fontWeight: activeNav === item.id ? 500 : 400 }}>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/get-started"
              className="hidden sm:inline-flex h-8 items-center justify-center rounded-full px-4 text-xs font-medium text-white"
              style={{ backgroundColor: c.sage }}>
              + Add Topics
            </Link>
            <UserButton />
          </div>
        </div>
        <div className="sm:hidden flex items-center gap-6 pb-3 overflow-x-auto">
          {navLinks.map((item) => (
            <button key={item.id}
              onClick={() => { setActiveNav(item.id); if (item.href) router.push(item.href); }}
              className="text-sm whitespace-nowrap"
              style={{ color: activeNav === item.id ? c.sage : c.inkMuted, fontWeight: activeNav === item.id ? 500 : 400 }}>
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Hero greeting */}
      <div className="border-b px-6 sm:px-10 py-12" style={{ borderColor: c.border }}>
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-semibold mb-2" style={{ color: c.ink }}>
            {getGreeting()}, {firstName} {getGreetingEmoji()}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: c.inkMuted }}>
            You're showing up for yourself.<br />We're glad you're here.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        {loading ? (
          <p className="text-sm" style={{ color: c.inkMuted }}>Loading…</p>
        ) : (
          <div className="space-y-8">

            {/* Two column — topics + AI card */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

              {/* Topics */}
              <div className="flex-1 min-w-0">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold" style={{ color: c.ink }}>Your spaces</h2>
                    <p className="text-xs mt-0.5" style={{ color: c.inkMuted }}>Where meaningful conversations begin.</p>
                  </div>
                  <Link href="/get-started" className="text-xs transition-opacity hover:opacity-70" style={{ color: c.sage }}>
                    + Add space
                  </Link>
                </div>

                {groupedCategories.length === 0 ? (
                  <div className="rounded-2xl p-10 text-center border"
                    style={{ backgroundColor: c.card, borderColor: c.border }}>
                    <p className="mb-1 font-medium text-sm" style={{ color: c.ink }}>Nothing here yet</p>
                    <p className="mb-5 text-xs" style={{ color: c.inkMuted }}>Add your first space to begin.</p>
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
              </div>

              {/* AI card — always visible */}
              <div className="w-full lg:w-64 shrink-0">
                <Link href={aiHref}
                  className="block rounded-2xl border p-6 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: c.sageLight, borderColor: `${c.sage}22` }}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full mb-5"
                    style={{ backgroundColor: `${c.sage}22` }}>
                    <span style={{ color: c.sage }}>✦</span>
                  </div>
                  <h3 className="text-sm font-semibold mb-2 leading-snug" style={{ color: c.ink }}>
                    Need a quiet space to talk things through?
                  </h3>
                  <p className="text-xs leading-relaxed mb-5" style={{ color: c.inkSoft }}>
                    Aapun AI is here to listen — whenever you need.
                  </p>
                  <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white"
                    style={{ backgroundColor: c.sage }}>
                    Talk with Aapun AI →
                  </span>
                </Link>
              </div>
            </div>

            {/* Thoughtfully chosen for you */}
            <section>
              <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: c.card, borderColor: c.border }}>
                <div className="flex items-center gap-4 px-6 py-5 border-b" style={{ borderColor: c.border }}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: c.sageLight }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.sage} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: c.ink }}>Thoughtfully chosen for you</h3>
                    <p className="text-xs mt-0.5" style={{ color: c.inkMuted }}>Resources to read, listen and reflect.</p>
                  </div>
                </div>
                <div className="flex overflow-x-auto divide-x" style={{ borderColor: c.border }}>
                  {FEATURED_RESOURCES.map((res, i) => (
                    <Link href="/resources" key={i}
                      className="flex shrink-0 items-start gap-3 px-5 py-5 transition-opacity hover:opacity-80 w-56"
                      style={{ borderColor: c.border }}>
                      <BookCover bg={res.coverBg} text={res.coverText} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs leading-snug" style={{ color: c.ink }}>{res.title}</p>
                        <p className="text-xs mt-0.5 mb-1" style={{ color: c.inkMuted }}>{res.subtitle}</p>
                        <p className="text-xs leading-snug mb-3 line-clamp-2" style={{ color: c.inkSoft }}>{res.description}</p>
                        <span className="inline-block rounded-full px-3 py-1 text-xs border"
                          style={{ borderColor: c.border, color: c.inkSoft }}>
                          {res.type === "read" ? "Read" : "Listen"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
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