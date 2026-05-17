"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const c = {
  bg: "#f7f5f9",
  sidebar: "#f0ecf5",
  sidebarBorder: "#e2dced",
  sidebarText: "#6b5b9e",
  sidebarActive: "#6b5b9e",
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
      const group: GroupedCategory = { category: topic.experience_categories[0] || "General", topics: [], matches: [], unmatched: [] };
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
    { id: "topics", label: "Your spaces", icon: SpacesIcon, href: "/get-started" },
    { id: "conversations", label: "Conversations", icon: ChatIcon },
    { id: "matches", label: "Connections", icon: MatchIcon },
    { id: "resources", label: "Resources", icon: ResourcesIcon, href: "/resources" },
    { id: "profile", label: "Profile", icon: ProfileIcon },
  ];

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: c.bg }}>

      {/* Sidebar */}
      <aside className="hidden lg:flex w-56 flex-col fixed inset-y-0 left-0 z-10 border-r"
        style={{ backgroundColor: c.sidebar, borderColor: c.sidebarBorder }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-6">
          <AapunMark size={28} />
          <span className="text-base font-semibold" style={{ color: c.ink }}>Aapun</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button key={item.id}
                onClick={() => { setActiveNav(item.id); if (item.href) router.push(item.href); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  backgroundColor: isActive ? c.sageLight : "transparent",
                  color: isActive ? c.sage : c.inkMuted,
                  fontWeight: isActive ? 500 : 400,
                }}>
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar image */}
        <div className="mx-3 mb-4 rounded-2xl overflow-hidden relative" style={{ height: 140 }}>
          <Image src="/mugs.png" alt="Aapun" fill className="object-cover opacity-70" />
          <div className="absolute inset-0 p-4 flex flex-col justify-end"
            style={{ background: "linear-gradient(to top, rgba(30,26,46,0.75), transparent)" }}>
            <p className="text-xs text-white leading-snug opacity-90">A quiet space for meaningful conversations.</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 sm:px-10 border-b"
          style={{ backgroundColor: c.bg, borderColor: c.border }}>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: c.ink }}>
              {getGreeting()}, {firstName} {getGreetingEmoji()}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: c.inkMuted }}>
              You're showing up for yourself. We're glad you're here.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/get-started"
              className="inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium text-white"
              style={{ backgroundColor: c.sage }}>
              + Add Topics
            </Link>
            <UserButton />
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-10 flex items-center justify-around border-t py-2 px-4"
          style={{ backgroundColor: c.bg, borderColor: c.border }}>
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button key={item.id}
                onClick={() => { setActiveNav(item.id); if (item.href) router.push(item.href); }}
                className="flex flex-col items-center gap-0.5 px-2 py-1"
                style={{ color: isActive ? c.sage : c.inkMuted }}>
                <Icon size={18} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <main className="flex-1 px-6 py-8 sm:px-10 pb-24 lg:pb-10">
          {loading ? (
            <p className="text-sm" style={{ color: c.inkMuted }}>Loading…</p>
          ) : (
            <div className="max-w-3xl space-y-10">

              {/* Your spaces */}
              <section>
                <div className="mb-6">
                  <h2 className="text-base font-semibold" style={{ color: c.ink }}>Your spaces</h2>
                  <p className="text-xs mt-0.5" style={{ color: c.inkMuted }}>
                    Each space is holding a connection for you.
                  </p>
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
                  <div className="space-y-4">
                    {groupedCategories.map((group, i) => (
                      <div key={i} className="rounded-2xl border p-5"
                        style={{ backgroundColor: c.card, borderColor: c.border }}>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {group.topics[0].experience_categories.map((cat) => (
                            <span key={cat} className="rounded-full px-3 py-1 text-xs"
                              style={{ backgroundColor: c.sageLight, color: c.sage }}>
                              {cat}
                            </span>
                          ))}
                        </div>

                        {/* Status & actions */}
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

              {/* Reflect with AI */}
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

              {/* Quiet quote */}
              <p className="text-xs italic text-center py-2" style={{ color: c.inkMuted }}>
                You don't have to go through it alone. We're here, together. ♡
              </p>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Icons
function HomeIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
}
function SpacesIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>;
}
function ChatIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}
function MatchIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function ResourcesIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
}
function ProfileIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
function AapunMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="15" cy="20" r="11" fill="rgba(107,91,158,0.25)" stroke="rgba(107,91,158,0.6)" strokeWidth="1.5" />
      <circle cx="25" cy="20" r="11" fill="rgba(201,122,82,0.25)" stroke="rgba(201,122,82,0.6)" strokeWidth="1.5" />
    </svg>
  );
}