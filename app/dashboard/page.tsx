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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
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
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg"
      style={{ backgroundColor: c.sageLight }}>
      {icons[category] || "💬"}
    </div>
  );
}

function PodcastArtwork({ bg, text }: { bg: string; text: string }) {
  return (
    <div className="shrink-0 rounded-xl flex items-center justify-center p-3 text-center"
      style={{ width: 80, height: 80, backgroundColor: bg }}>
      <span className="font-semibold leading-tight whitespace-pre-line text-center"
        style={{ color: c.ink, fontSize: 10 }}>
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
    }

    // Fetch unread message counts per match
    if (user && topicsData.length > 0) {
      const matchIds = topicsData
        .filter((t: Topic) => t.match_id)
        .map((t: Topic) => t.match_id);

      if (matchIds.length > 0) {
        const { data: unread } = await supabase
          .from("messages")
          .select("match_id")
          .in(match_id, matchIds)
          .neq(sender_id, user.id)
          .eq(read, false);

        const counts: Record<string, number> = {};
        (unread || []).forEach((m: { match_id: string }) => {
          counts[m.match_id] = (counts[m.match_id] || 0) + 1;
        });
        setUnreadCounts(counts);
      }
    }
  }

  async function loadDailyResource(userId: string, categories: string[]) {
    const { data: seenData } = await supabase
      .from("user_seen_resources")
      .select("resource_id")
      .eq("user_id", userId);

    const seenIds = (seenData || []).map((r: { resource_id: string }) => r.resource_id);

    let query = supabase
      .from("resources")
      .select("*")
      .in("category", categories)
      .limit(20);

    if (seenIds.length > 0) {
      query = query.not("id", "in", `(${seenIds.join(",")})`);
    }

    const { data: available } = await query;
    if (!available || available.length === 0) return;

    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const picked = available[seed % available.length];

    setResource(picked);

    await supabase.from("user_seen_resources").insert([
      { user_id: userId, resource_id: picked.id }
    ]);
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

  const aiHref = topics.length > 0 ? `/ai-chat/${topics[0].id}` : "/get-started";

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: c.bg }}>

      {/* Nav */}
      <header className="px-6 sm:px-10" style={{ backgroundColor: c.bg }}>
        <div className="mx-auto max-w-2xl flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <AapunMark size={26} />
            <span className="text-sm font-semibold" style={{ color: c.ink }}>Aapun</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/get-started" className="text-sm" style={{ color: c.inkMuted }}>Spaces</Link>
            <Link href="/notes" className="text-sm" style={{ color: c.inkMuted }}>Notes</Link>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 sm:px-10">

        {/* Hero greeting */}
        <div className="pt-10 pb-12">
          <p className="text-base mb-1" style={{ color: c.inkMuted }}>
            {getGreetingEmoji()}
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold leading-tight mb-4" style={{ color: c.ink }}>
            {getGreeting()}<br />{firstName}
          </h1>
          <p className="text-base leading-relaxed" style={{ color: c.inkMuted }}>
            You're showing up for yourself.<br />We're glad you're here.
          </p>
        </div>

        {loading ? (
          <p className="text-sm pb-16" style={{ color: c.inkMuted }}>Loading...</p>
        ) : (
          <div className="space-y-12 pb-20">

            {/* Your spaces — full width */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold" style={{ color: c.ink }}>Your spaces</h2>
                  <p className="text-sm mt-0.5" style={{ color: c.inkMuted }}>Where meaningful conversations begin.</p>
                </div>
                <Link href="/get-started" className="text-sm transition-opacity hover:opacity-60" style={{ color: c.sage }}>
                  + New space
                </Link>
              </div>

              {groupedCategories.length === 0 ? (
                <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: c.card, borderColor: c.border }}>
                  <p className="mb-2 font-medium text-sm" style={{ color: c.ink }}>Nothing here yet</p>
                  <p className="mb-6 text-sm" style={{ color: c.inkMuted }}>Add your first space to begin.</p>
                  <Link href="/get-started"
                    className="inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-medium text-white"
                    style={{ backgroundColor: c.sage }}>
                    Begin
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {groupedCategories.map((group, i) => (
                    <div key={i} className="rounded-2xl border p-4"
                      style={{ backgroundColor: c.card, borderColor: c.border }}>
                      <div className="flex items-center gap-3 mb-3">
                        <CategoryIcon category={group.topics[0].experience_categories[0]} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm leading-snug" style={{ color: c.ink }}>
                            {group.topics[0].experience_categories[0]}
                          </p>
                          {group.matches.length > 0 ? (
                            <p className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: c.inkMuted }}>
                              <span className="inline-block h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: c.green }} />
                              Matched with {group.matches[0].matched_with}
                            </p>
                          ) : (
                            <p className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: c.inkMuted }}>
                              <span className="inline-block h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: c.apricot }} />
                              Finding your match
                            </p>
                          )}
                        </div>
                      </div>
                      {group.matches.length > 0 && group.matches[0].match_id ? (
                        <Link href={`/chat/${group.matches[0].match_id}`}
                          className="w-full inline-flex items-center justify-center rounded-full py-2 text-xs font-medium transition-opacity hover:opacity-80"
                          style={{ backgroundColor: c.sageLight, color: c.sage }}>
                          Spend time together →
                        </Link>
                      ) : (
                        <Link href={`/ai-chat/${group.topics[0].id}`}
                          className="w-full inline-flex items-center justify-center rounded-full py-2 text-xs font-medium transition-opacity hover:opacity-80"
                          style={{ backgroundColor: c.apricotLight, color: c.apricot }}>
                          Reflect quietly for now →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Thoughtfully chosen — 1 resource */}
            {resource && (
              <section>
                <div className="mb-5">
                  <h2 className="text-base font-semibold" style={{ color: c.ink }}>Thoughtfully chosen for you</h2>
                  <p className="text-sm mt-0.5" style={{ color: c.inkMuted }}>A moment to pause, learn, or feel seen.</p>
                </div>
                <a href={resource.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-5 rounded-2xl border p-5 transition-opacity hover:opacity-80"
                  style={{ backgroundColor: c.card, borderColor: c.border }}>
                  <PodcastArtwork bg={resource.cover_bg} text={resource.cover_text || resource.title} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: c.inkMuted }}>
                      Podcast
                    </p>
                    <p className="font-semibold text-base mb-1" style={{ color: c.ink }}>{resource.title}</p>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: c.inkMuted }}>{resource.subtitle}</p>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium"
                      style={{ backgroundColor: c.sageLight, color: c.sage }}>
                      Listen →
                    </span>
                  </div>
                </a>
              </section>
            )}

            {/* Notes */}
            <section>
              <Link href="/notes"
                className="flex items-center justify-between rounded-2xl border px-6 py-5 transition-opacity hover:opacity-80"
                style={{ backgroundColor: c.card, borderColor: c.border }}>
                <div>
                  <h2 className="text-base font-semibold mb-0.5" style={{ color: c.ink }}>Notes for the day</h2>
                  <p className="text-sm" style={{ color: c.inkMuted }}>A private space for your thoughts.</p>
                </div>
                <span className="text-xl" style={{ color: c.inkMuted }}>✏️</span>
              </Link>
            </section>

            {/* AI — quiet, small */}
            <section>
              <Link href={aiHref}
                className="flex items-center gap-3 transition-opacity hover:opacity-70"
                style={{ color: c.inkMuted }}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: c.sageLight }}>
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