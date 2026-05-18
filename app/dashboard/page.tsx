"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

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
  green: "#4a7c5f",
} as const;

type Topic = {
  id: string;
  full_name: string;
  description: string;
  experience_categories: string[];
  created_at: string;
  matched_with?: string;
  match_id?: string;
  user_id: string;
};

type Resource = {
  id: string;
  type: "listen" | "read";
  title: string;
  subtitle: string;
  link: string;
  cover_bg: string;
  cover_text: string;
};

type GroupedCategory = {
  category: string;
  topics: Topic[];
  matches: Topic[];
  unmatched: Topic[];
};

type Suggestion = {
  id: string;
  full_name: string;
  experience_categories: string[];
  description: string;
  user_id: string;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Hope you slept okay,";
  if (hour < 17) return "Hope your day is treating you well,";
  return "Hope today was a good one,";
}

function getGreetingEmoji() {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️";
  if (hour < 17) return "🌤️";
  return "🌙";
}

function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, string> = {
    "Balancing careers and parenting": "💼",
    "First-time parents": "🌱",
    "Postpartum depression/anxiety": "♡",
    "NICU parents": "🕊️",
    "IVF": "✨",
    "Immigrant parents": "🌍",
    "Single parents": "⭐",
    "Breastfeeding/Pumping/Formula feeding": "✦",
    "Planning to conceive soon": "🌸",
    "Co-parenting after divorce": "🤝",
    "Stay-at-home moms/dads": "🏡",
    "Parents of neurodivergent children": "🧡",
    "Parents of autistic children": "🧡",
    "Pregnancy loss & miscarriage": "🕊️",
    "Parenting with a partner who doesn't share the load": "⚖️",
    "Hiring a nanny/caregiver": "🏠",
    "Other": "💬",
  };
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base"
      style={{ backgroundColor: c.sageLight }}>
      {icons[category] || "💬"}
    </div>
  );
}

function PodcastArtwork({ bg, text }: { bg: string; text: string }) {
  return (
    <div className="shrink-0 rounded-xl flex items-center justify-center p-2 text-center"
      style={{ width: 64, height: 64, backgroundColor: bg }}>
      <span className="font-semibold leading-tight whitespace-pre-line"
        style={{ color: c.ink, fontSize: 9 }}>
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
  const [resource, setResource] = useState<Resource | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);

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
    const topicsData = data || [];
    setTopics(topicsData);
    setLoading(false);

    const allCategories = Array.from(
      new Set(topicsData.flatMap((t: Topic) => t.experience_categories))
    );

    if (allCategories.length > 0) {
      await loadDailyResource(user.id, allCategories);
      await loadSuggestions(user.id, allCategories, topicsData);
    }

    if (topicsData.length > 0) {
      const matchIds = topicsData.filter((t: Topic) => t.match_id).map((t: Topic) => t.match_id);
      if (matchIds.length > 0) {
        const { data: unread } = await supabase
          .from("messages")
          .select("match_id")
          .in("match_id", matchIds)
          .neq("sender_id", user.id)
          .eq("read", false);
        const counts: Record<string, number> = {};
        (unread || []).forEach((m: { match_id: string }) => {
          counts[m.match_id] = (counts[m.match_id] || 0) + 1;
        });
        setUnreadCounts(counts);
      }
    }
  }

  async function loadSuggestions(userId: string, categories: string[], myTopics: Topic[]) {
    // Get already matched user IDs
    const matchedUserIds = new Set(myTopics.map((t: Topic) => t.user_id));
    matchedUserIds.add(userId);

    // Find other users with overlapping categories
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, experience_categories, description, user_id")
      .filter("experience_categories", "ov", `{${categories.join(",")}}`)
      .neq("user_id", userId)
      .limit(10);

    if (!data) return;

    // Filter out already matched users
    const filtered = data.filter((p: Suggestion) => !matchedUserIds.has(p.user_id));

    // Deduplicate by user_id
    const seen = new Set<string>();
    const unique = filtered.filter((p: Suggestion) => {
      if (seen.has(p.user_id)) return false;
      seen.add(p.user_id);
      return true;
    });

    setSuggestions(unique.slice(0, 3));
  }

  async function sayHello(suggestion: Suggestion) {
    if (!user || connecting) return;
    setConnecting(suggestion.user_id);

    try {
      // Get current user's profile
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (!myProfile) return;

      const matchId = `${myProfile.id}-${suggestion.id}`;

      // Update current user
      await supabase.from("profiles").update({
        match_status: "We found you a match!",
        matched_with: suggestion.full_name,
        match_id: matchId,
      }).eq("id", myProfile.id);

      // Update the other user
      await supabase.from("profiles").update({
        match_status: "We found you a match!",
        matched_with: myProfile.full_name,
        match_id: matchId,
      }).eq("id", suggestion.id);

      router.push(`/chat/${matchId}`);
    } catch (err) {
      console.error("Error connecting:", err);
    } finally {
      setConnecting(null);
    }
  }

  async function loadDailyResource(userId: string, categories: string[]) {
    const { data: seenData } = await supabase
      .from("user_seen_resources")
      .select("resource_id")
      .eq("user_id", userId);
    const seenIds = (seenData || []).map((r: { resource_id: string }) => r.resource_id);
    let query = supabase.from("resources").select("*").in("category", categories).limit(20);
    if (seenIds.length > 0) query = query.not("id", "in", `(${seenIds.join(",")})`);
    const { data: available } = await query;
    if (!available || available.length === 0) return;
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const picked = available[seed % available.length];
    setResource(picked);
    await supabase.from("user_seen_resources").insert([{ user_id: userId, resource_id: picked.id }]);
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

  const aiHref = topics.length > 0 ? `/ai-chat/${topics[0].id}` : "/get-started";

  const navItems = [
    { label: "Home", href: "/dashboard", icon: "🏠" },
    { label: "Chats", href: "/conversations", icon: "💬" },
    { label: "Spaces", href: "/get-started", icon: "✦" },
    { label: "Notes", href: "/notes", icon: "✏️" },
    { label: "Profile", href: "/", icon: "👤" },
  ];

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: c.bg }}>

      {/* Nav */}
      <header className="border-b px-6 sm:px-10" style={{ borderColor: c.border, backgroundColor: c.bg }}>
        <div className="mx-auto max-w-2xl flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <AapunMark size={26} />
            <span className="text-sm font-semibold" style={{ color: c.ink }}>Aapun</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            {navItems.map(item => (
              <Link key={item.label} href={item.href} className="text-sm transition-opacity hover:opacity-60" style={{ color: c.inkMuted }}>
                {item.label}
              </Link>
            ))}
          </div>
          <UserButton />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 sm:px-10 pb-24 sm:pb-10">

        {/* Greeting */}
        <div className="pt-10 pb-10">
          <p className="text-xl mb-1" style={{ color: c.inkMuted }}>{getGreetingEmoji()}</p>
          <h1 className="text-2xl sm:text-3xl font-semibold leading-snug mb-2" style={{ color: c.ink }}>
            {getGreeting()} {firstName}
          </h1>
          <p className="text-sm" style={{ color: c.inkMuted }}>
            Meaningful conversations beyond your everyday circle.
          </p>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: c.inkMuted }}>Loading...</p>
        ) : (
          <div className="space-y-10">

            {/* Your spaces */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold" style={{ color: c.ink }}>Your spaces</h2>
                <Link href="/get-started" className="text-xs" style={{ color: c.sage }}>+ New space</Link>
              </div>
              {groupedCategories.length === 0 ? (
                <div className="rounded-2xl border p-10 text-center" style={{ backgroundColor: c.card, borderColor: c.border }}>
                  <p className="text-sm mb-4" style={{ color: c.inkMuted }}>Add your first space to begin.</p>
                  <Link href="/get-started" className="inline-flex h-9 items-center justify-center rounded-full px-6 text-sm font-medium text-white" style={{ backgroundColor: c.sage }}>Begin</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {groupedCategories.map((group, i) => (
                    <div key={i} className="rounded-2xl border p-4" style={{ backgroundColor: c.card, borderColor: c.border }}>
                      <div className="flex items-center gap-3 mb-3">
                        <CategoryIcon category={group.topics[0].experience_categories[0]} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm leading-snug" style={{ color: c.ink }}>
                            {group.topics[0].experience_categories[0]}
                          </p>
                          {group.matches.length > 0 ? (
                            <p className="text-xs mt-0.5" style={{ color: c.inkMuted }}>
                              <span className="inline-block h-1.5 w-1.5 rounded-full mr-1.5 align-middle" style={{ backgroundColor: c.green }} />
                              Matched with {group.matches[0].matched_with}
                            </p>
                          ) : (
                            <p className="text-xs mt-0.5" style={{ color: c.inkMuted }}>
                              <span className="inline-block h-1.5 w-1.5 rounded-full mr-1.5 align-middle" style={{ backgroundColor: c.apricot }} />
                              Finding your match
                            </p>
                          )}
                        </div>
                      </div>
                      {group.matches.length > 0 && group.matches[0].match_id ? (
                        <Link href={`/chat/${group.matches[0].match_id}`}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-full py-2 text-xs font-medium"
                          style={{ backgroundColor: c.sageLight, color: c.sage }}>
                          Spend time together →
                          {unreadCounts[group.matches[0].match_id!] > 0 && (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white font-bold"
                              style={{ backgroundColor: c.apricot, fontSize: 11 }}>
                              {unreadCounts[group.matches[0].match_id!]}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <Link href={`/ai-chat/${group.topics[0].id}`}
                          className="w-full inline-flex items-center justify-center rounded-full py-2 text-xs font-medium"
                          style={{ backgroundColor: c.apricotLight, color: c.apricot }}>
                          Reflect quietly for now →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* People you may connect with */}
            {suggestions.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold" style={{ color: c.ink }}>People you may connect with</h2>
                </div>
                <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: c.card, borderColor: c.border }}>
                  {suggestions.map((suggestion, i) => (
                    <div key={suggestion.id}
                      className={`flex items-center gap-4 px-5 py-4 ${i < suggestions.length - 1 ? "border-b" : ""}`}
                      style={{ borderColor: c.border }}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: c.sage }}>
                        {suggestion.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: c.ink }}>{suggestion.full_name.split(" ")[0]}</p>
                        <p className="text-xs" style={{ color: c.inkMuted }}>{suggestion.experience_categories[0]}</p>
                      </div>
                      <button
                        onClick={() => sayHello(suggestion)}
                        disabled={connecting === suggestion.user_id}
                        className="shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                        style={{ backgroundColor: c.sageLight, color: c.sage }}>
                        {connecting === suggestion.user_id ? "..." : "Say hello"}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Thoughtfully chosen */}
            {resource && (
              <section>
                <h2 className="text-sm font-semibold mb-4" style={{ color: c.ink }}>Thoughtfully chosen for you</h2>
                <a href={resource.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-2xl border p-4 transition-opacity hover:opacity-80"
                  style={{ backgroundColor: c.card, borderColor: c.border }}>
                  <PodcastArtwork bg={resource.cover_bg} text={resource.cover_text || resource.title} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: c.inkMuted }}>Podcast</p>
                    <p className="font-semibold text-sm mb-1" style={{ color: c.ink }}>{resource.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: c.inkMuted }}>{resource.subtitle}</p>
                  </div>
                  <span className="text-xs rounded-full px-3 py-1 shrink-0" style={{ backgroundColor: c.sageLight, color: c.sage }}>Listen →</span>
                </a>
              </section>
            )}

            {/* Notes */}
            <section>
              <Link href="/notes"
                className="flex items-center justify-between rounded-2xl border px-5 py-4 transition-opacity hover:opacity-80"
                style={{ backgroundColor: c.card, borderColor: c.border }}>
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: c.ink }}>Notes for the day</p>
                  <p className="text-xs" style={{ color: c.inkMuted }}>A private space for your thoughts.</p>
                </div>
                <span className="text-xl">✏️</span>
              </Link>
            </section>

            {/* AI — small and quiet */}
            <section>
              <Link href={aiHref} className="flex items-center gap-3 transition-opacity hover:opacity-70">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: c.sageLight }}>
                  <span className="text-sm" style={{ color: c.sage }}>✦</span>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: c.ink }}>Need a quiet moment?</p>
                  <p className="text-xs" style={{ color: c.sage }}>Reflect with Aapun AI →</p>
                </div>
              </Link>
            </section>

            <p className="text-xs italic text-center" style={{ color: c.inkMuted }}>
              This is your quiet place. Come back anytime. ♡
            </p>

          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-10 flex items-center justify-around border-t py-2 px-4"
        style={{ backgroundColor: c.bg, borderColor: c.border }}>
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}
            className="flex flex-col items-center gap-0.5 px-2 py-1"
            style={{ color: c.inkMuted }}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>
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