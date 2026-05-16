"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const c = {
  bg: "#f6f4ef",
  ink: "#1c2824",
  inkSoft: "#4a5c56",
  inkMuted: "#6d8078",
  sage: "#3a6b5c",
  sageDark: "#2f584b",
  sageLight: "#e4ede9",
  apricot: "#c97a52",
  apricotLight: "#f3e4db",
  card: "rgba(255, 255, 255, 0.85)",
  border: "#d8e4de",
} as const;

type Topic = {
  id: string;
  full_name: string;
  description: string;
  experience_categories: string[];
  created_at: string;
  match_status?: string;
  matched_with?: string;
};

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/");
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Supabase fetch error:", error);
        setTopics(data || []);
        setLoading(false);
      });
  }, [isLoaded, user]);

  const firstName = topics[0]?.full_name?.trim().split(/\s+/)[0] || "there";

  return (
    <div
      className="relative min-h-full overflow-hidden font-sans"
      style={{ backgroundColor: c.bg, color: c.inkSoft }}
    >
      <AmbientBackground />

      <main className="relative mx-auto flex min-h-full max-w-2xl flex-col px-6 py-10 sm:px-8 sm:py-14">
        <header className="mb-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AapunMark size={36} />
              <div>
                <p className="text-lg font-semibold tracking-tight" style={{ color: c.ink }}>Aapun</p>
                <p className="text-sm" style={{ color: c.inkMuted }}>
                  <span className="italic">my own</span> — in Assamese
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/get-started"
                className="inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#2f584b]"
                style={{ backgroundColor: c.sage }}
              >
                + Add topic
              </Link>
              <UserButton />
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
            Your topics, {firstName}
          </h1>
          <p className="mt-1 text-sm" style={{ color: c.inkMuted }}>
            Each topic is looking for a peer who gets it.
          </p>
        </header>

        {loading ? (
          <p className="py-8 text-center text-sm" style={{ color: c.inkMuted }}>Loading…</p>
        ) : topics.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center shadow-sm backdrop-blur-sm"
            style={{ backgroundColor: c.card, borderWidth: 1, borderStyle: "solid", borderColor: c.border }}
          >
            <p className="mb-4 text-lg font-medium" style={{ color: c.ink }}>No topics yet</p>
            <p className="mb-6 text-sm" style={{ color: c.inkMuted }}>Add your first topic to start finding a peer.</p>
            <Link
              href="/get-started"
              className="inline-flex h-11 items-center justify-center rounded-full px-8 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#2f584b]"
              style={{ backgroundColor: c.sage }}
            >
              Get started
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="rounded-2xl p-6 shadow-sm backdrop-blur-sm"
                style={{ backgroundColor: c.card, borderWidth: 1, borderStyle: "solid", borderColor: c.border }}
              >
                <div className="mb-3 flex flex-wrap gap-2">
                  {topic.experience_categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{ backgroundColor: c.sageLight, color: c.sage }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                <p className="mb-4 text-sm leading-relaxed line-clamp-2" style={{ color: c.inkSoft }}>
                  {topic.description}
                </p>

                {topic.matched_with ? (
                  <div
                    className="rounded-xl px-4 py-3 text-sm"
                    style={{ backgroundColor: c.sageLight, borderWidth: 1, borderStyle: "solid", borderColor: `${c.sage}33` }}
                  >
                    <p className="font-medium" style={{ color: c.sage }}>✓ We found you a match!</p>
                    <p className="mt-1" style={{ color: c.inkSoft }}>
                      You've been matched with <strong>{topic.matched_with}</strong>. We'll be in touch shortly to introduce you.
                    </p>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
                    style={{ backgroundColor: c.apricotLight, borderWidth: 1, borderStyle: "solid", borderColor: `${c.apricot}33` }}
                  >
                    <span style={{ color: c.apricot }}>◎</span>
                    <span style={{ color: c.ink }}>Watching for a match — we'll let you know.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AmbientBackground() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: `${c.sage}22` }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-36 -right-20 h-[28rem] w-[28rem] rounded-full blur-3xl" style={{ backgroundColor: `${c.apricot}28` }} />
    </>
  );
}

function AapunMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="15" cy="20" r="11" fill={`${c.sage}33`} stroke={c.sage} strokeWidth="1.5" />
      <circle cx="25" cy="20" r="11" fill={`${c.apricot}33`} stroke={c.apricot} strokeWidth="1.5" />
    </svg>
  );
}