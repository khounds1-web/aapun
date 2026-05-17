"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getResourcesForCategories, DEFAULT_RESOURCES, type Resource } from "@/app/lib/resources";

const c = {
  bg: "#faf9fc",
  ink: "#1e1a2e",
  inkSoft: "#4a4060",
  inkMuted: "#a89fc0",
  sage: "#6b5b9e",
  sageLight: "#ede8f8",
  apricot: "#c97a52",
  apricotLight: "#f3e4db",
  card: "#ffffff",
  border: "#f0ebf8",
  green: "#5a7c65",
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

function BookCover({ bg, text }: { bg: string; text: string }) {
  return (
    <div className="shrink-0 rounded-md flex items-center justify-center p-2 text-center shadow-sm"
      style={{ width: 48, height: 64, backgroundColor: bg }}>
      <span className="font-medium leading-tight whitespace-pre-line" style={{ color: c.ink, fontSize: 8 }}>
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
  const [resources, setResources] = useState<Resource[]>(DEFAULT_RESOURCES);

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

    // Get all unique categories across all user's topics
    const allCategories = Array.from(
      new Set(topicsData.flatMap((t: Topic) => t.experience_categories))
    );
    setResources(getResourcesForCategories(allCategories));
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

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: c.bg }}>

      {/* Nav */}
      <header className="border-b px-8 sm:px-16" style={{ borderColor: c.border, backgroundColor: c.bg }}>
        <div className="mx-auto max-w-5xl flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <AapunMark size={26} />
            <span className="text-sm font-semibold tracking-tight" style={{ color: c.ink }}>Aapun</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/resources" className="text-sm transition-opacity hover:opacity-60" style={{ color: c.inkMuted }}>Read</Link>
            <Link href="/get-started" className="text-sm transition-opacity hover:opacity-60" style={{ color: c.inkMuted }}>Add space</Link>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 sm:px-16">

        {/* Greeting */}
        <div className="pt-16 pb-12">
          <p className="text-2xl mb-2" style={{ color: c.inkMuted }}>{getGreetingEmoji()}</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4" style={{ color: c.inkSoft }}>
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-base" style={{ color: c.inkMuted }}>
            You're showing up for yourself. We're glad you're here.
          </p>
        </div>

        {loading ? (
          <p className="text-sm pb-16" style={{ color: c.inkMuted }}>Loading…</p>
        ) : (
          <div className="space-y-10 pb-20">

            {/* Your spaces + AI card */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

              {/* Topic cards */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold" style={{ color: c.ink }}>Your spaces</h2>
                    <p className="text-xs mt-0.5" style={{ color: c.inkMuted }}>Where meaningful conversations begin.</p>
                  </div>
                  <Link href="/get-started" className="text-xs transition-opacity hover:opacity-60" style={{ color: c.sage }}>
                    + New space
                  </Link>
                </div>

                {groupedCategories.length === 0 ? (
                  <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: c.card, borderColor: c.border }}>
                    <p className="mb-2 font-medium text-sm" style={{ color: c.ink }}>Nothing here yet</p>
                    <p className="mb-6 text-xs" style={{ color: c.inkMuted }}>Add your first space to begin.</p>
                    <Link href="/get-started"
                      className="inline-flex h-9 items-center justify-center rounded-full px-6 text-sm font-medium text-white"
                      style={{ backgroundColor: c.sage }}>
                      Begin
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groupedCategories.map((group, i) => (
                      <div key={i} className="rounded-2xl border px-5 py-4 flex items-center gap-4"
                        style={{ backgroundColor: c.card, borderColor: c.border }}>
                        <CategoryIcon category={group.topics[0].experience_categories[0]} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm mb-0.5" style={{ color: c.ink }}>
                            {group.topics[0].experience_categories[0]}
                          </p>
                          {group.matches.length > 0 ? (
                            <p className="text-xs flex items-center gap-1.5" style={{ color: c.inkMuted }}>
                              <span className="inline-block h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: c.green }} />
                              You're matched with {group.matches[0].matched_with}
                            </p>
                          ) : (
                            <p className="text-xs flex items-center gap-1.5" style={{ color: c.inkMuted }}>
                              <span className="inline-block h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: c.apricot }} />
                              We're finding the right match for you
                            </p>
                          )}
                        </div>
                        {group.matches.length > 0 && group.matches[0].match_id ? (
                          <Link href={`/chat/${group.matches[0].match_id}`}
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-opacity hover:opacity-80"
                            style={{ backgroundColor: c.sageLight, color: c.sage }}>
                            Spend time together ›
                          </Link>
                        ) : (
                          <Link href={`/ai-chat/${group.topics[0].id}`}
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-opacity hover:opacity-80"
                            style={{ backgroundColor: c.apricotLight, color: c.apricot }}>
                            Reflect with AI ›
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI card */}
              <div className="w-full lg:w-72 shrink-0">
                <Link href={aiHref}
                  className="block rounded-2xl border p-7 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: c.sageLight, borderColor: `${c.sage}22` }}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full mb-6"
                    style={{ backgroundColor: `${c.sage}22` }}>
                    <span style={{ color: c.sage }}>✦</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 leading-snug" style={{ color: c.ink }}>
                    Need a quiet space to talk things through?
                  </h3>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: c.inkSoft }}>
                    Aapun AI is here to listen — whenever you need.
                  </p>
                  <span className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
                    style={{ backgroundColor: c.sage }}>
                    Talk with Aapun AI →
                  </span>
                </Link>
              </div>
            </div>

            {/* Thoughtfully chosen — dynamic per user categories */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-medium uppercase tracking-widest" style={{ color: c.inkMuted }}>
                  Thoughtfully chosen for you
                </h2>
                <Link href="/resources" className="text-xs transition-opacity hover:opacity-60" style={{ color: c.sage }}>
                  See all
                </Link>
              </div>
              <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: c.card, borderColor: c.border }}>
                {resources.map((res, i) => (
                  <a href={res.link} target="_blank" rel="noopener noreferrer" key={i}
                    className={`flex items-center gap-4 px-5 py-4 transition-opacity hover:opacity-70 ${i < resources.length - 1 ? "border-b" : ""}`}
                    style={{ borderColor: c.border }}>
                    <BookCover bg={res.coverBg} text={res.coverText} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-0.5" style={{ color: c.ink }}>{res.title}</p>
                      <p className="text-xs" style={{ color: c.inkMuted }}>{res.subtitle}</p>
                    </div>
                    <span className="text-xs rounded-full px-3 py-1 shrink-0"
                      style={{ backgroundColor: c.sageLight, color: c.sage }}>
                      {res.type === "read" ? "Read" : "Listen"}
                    </span>
                  </a>
                ))}
              </div>
            </section>

            <p className="text-xs italic text-center pt-4" style={{ color: c.inkMuted }}>
              You don't have to go through it alone. ♡
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