"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

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

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

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

  const aiHref = topics.length > 0 ? `/ai-chat/${topics[0].id}` : "/get-started";

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: c.bg }}>

      {/* Nav — light, minimal */}
      <header className="border-b px-8 sm:px-16" style={{ borderColor: c.border, backgroundColor: c.bg }}>
        <div className="mx-auto max-w-2xl flex items-center justify-between h-16">
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

      {/* Content — narrow, centered, generous padding */}
      <main className="mx-auto max-w-2xl px-8 sm:px-16">

        {/* Greeting — large, spacious */}
        <div className="pt-16 pb-12">
          <p className="text-sm mb-3" style={{ color: c.inkMuted }}>{getGreetingEmoji()}</p>
          <h1 className="text-4xl font-semibold tracking-tight mb-3" style={{ color: c.ink }}>
            {getGreeting()},<br />{firstName}.
          </h1>
          <p className="text-base" style={{ color: c.inkMuted }}>
            You're showing up for yourself. We're glad you're here.
          </p>
        </div>

        {loading ? (
          <p className="text-sm pb-16" style={{ color: c.inkMuted }}>Loading…</p>
        ) : (
          <div>

            {/* Your spaces */}
            <section className="pb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-medium uppercase tracking-widest" style={{ color: c.inkMuted }}>
                  Your spaces
                </h2>
                <Link href="/get-started" className="text-xs transition-opacity hover:opacity-60" style={{ color: c.sage }}>
                  + New space
                </Link>
              </div>

              {groupedCategories.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-base mb-2" style={{ color: c.ink }}>Nothing here yet</p>
                  <p className="text-sm mb-8" style={{ color: c.inkMuted }}>
                    Add your first space to begin finding someone who gets it.
                  </p>
                  <Link href="/get-started"
                    className="inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-medium text-white"
                    style={{ backgroundColor: c.sage }}>
                    Begin
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedCategories.map((group, i) => (
                    <div key={i} className="py-6 border-t" style={{ borderColor: c.border }}>

                      {/* Category tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {group.topics[0].experience_categories.map((cat) => (
                          <span key={cat} className="rounded-full px-3 py-1 text-xs"
                            style={{ backgroundColor: c.sageLight, color: c.sage }}>
                            {cat}
                          </span>
                        ))}
                      </div>

                      {/* Status */}
                      {group.matches.length > 0 ? (
                        <div>
                          <p className="text-sm mb-5" style={{ color: c.inkSoft }}>
                            <span className="inline-block h-1.5 w-1.5 rounded-full mr-2 align-middle" style={{ backgroundColor: c.green }} />
                            {group.matches.length === 1
                              ? `Spend time together with ${group.matches[0].matched_with}`
                              : `${group.matches.length} people to connect with`}
                          </p>
                          <div className="flex items-center gap-3">
                            {group.matches.length === 1 && group.matches[0].match_id ? (
                              <>
                                <Link href={`/matches/${encodeURIComponent(group.category)}?matchId=${group.matches[0].match_id}`}
                                  className="text-xs transition-opacity hover:opacity-60"
                                  style={{ color: c.inkMuted }}>
                                  Learn more
                                </Link>
                                <Link href={`/chat/${group.matches[0].match_id}`}
                                  className="inline-flex h-9 items-center justify-center rounded-full px-5 text-xs font-medium text-white"
                                  style={{ backgroundColor: c.sage }}>
                                  Say hello
                                </Link>
                              </>
                            ) : (
                              <Link href={`/matches/${encodeURIComponent(group.category)}?ids=${group.matches.map(m => m.match_id).join(",")}`}
                                className="inline-flex h-9 items-center justify-center rounded-full px-5 text-xs font-medium text-white"
                                style={{ backgroundColor: c.sage }}>
                                See connections
                              </Link>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm mb-5" style={{ color: c.inkMuted }}>
                            <span className="inline-block h-1.5 w-1.5 rounded-full mr-2 align-middle" style={{ backgroundColor: c.apricot }} />
                            Finding your person — sit tight.
                          </p>
                          <Link href={`/ai-chat/${group.topics[0].id}`}
                            className="text-xs transition-opacity hover:opacity-60"
                            style={{ color: c.inkMuted }}>
                            ✦ Reflect with AI in the meantime →
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="border-t" style={{ borderColor: c.border }} />
                </div>
              )}
            </section>

            {/* AI reflection — quiet, secondary */}
            <section className="pb-16">
              <div className="py-10 px-8 rounded-3xl" style={{ backgroundColor: c.sageLight }}>
                <p className="text-xs mb-6" style={{ color: c.sage }}>✦</p>
                <h3 className="text-lg font-semibold mb-2 leading-snug" style={{ color: c.ink }}>
                  Need a quiet space to<br />talk things through?
                </h3>
                <p className="text-sm mb-8 leading-relaxed" style={{ color: c.inkSoft }}>
                  Aapun AI is here to listen — whenever you need.
                </p>
                <Link href={aiHref}
                  className="inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-medium text-white"
                  style={{ backgroundColor: c.sage }}>
                  Talk with Aapun AI →
                </Link>
              </div>
            </section>

            {/* Resources — minimal */}
            <section className="pb-20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-medium uppercase tracking-widest" style={{ color: c.inkMuted }}>
                  Thoughtfully chosen
                </h2>
                <Link href="/resources" className="text-xs transition-opacity hover:opacity-60" style={{ color: c.sage }}>
                  See all
                </Link>
              </div>
              <div className="space-y-6">
                {[
                  { type: "read", title: "Nobody Told Me", subtitle: "About Becoming a Mom — Heather McNamara" },
                  { type: "listen", title: "The Lavender Hour", subtitle: "Ep. 42 · The invisible load no one talks about" },
                  { type: "read", title: "Good Inside", subtitle: "Dr. Becky Kennedy" },
                ].map((res, i) => (
                  <Link href="/resources" key={i}
                    className="flex items-center justify-between py-5 border-t transition-opacity hover:opacity-70"
                    style={{ borderColor: c.border }}>
                    <div>
                      <p className="text-sm font-medium mb-0.5" style={{ color: c.ink }}>{res.title}</p>
                      <p className="text-xs" style={{ color: c.inkMuted }}>{res.subtitle}</p>
                    </div>
                    <span className="text-xs rounded-full px-3 py-1 ml-4 shrink-0"
                      style={{ backgroundColor: c.sageLight, color: c.sage }}>
                      {res.type === "read" ? "Read" : "Listen"}
                    </span>
                  </Link>
                ))}
                <div className="border-t" style={{ borderColor: c.border }} />
              </div>
            </section>

            <p className="text-xs italic text-center pb-16" style={{ color: c.inkMuted }}>
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