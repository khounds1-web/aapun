"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const c = {
  bg: "#f5f0ea",
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

type Match = {
  id: string;
  full_name: string;
  matched_with: string;
  match_id: string;
  experience_categories: string[];
  description: string;
};

export default function MatchesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("matchId");

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/"); return; }
    if (!matchId) { router.push("/dashboard"); return; }

    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .eq("match_id", matchId)
      .single()
      .then(({ data }) => {
        setMatch(data);
        setLoading(false);
      });
  }, [isLoaded, user, matchId]);

  return (
    <div className="min-h-full font-sans" style={{ backgroundColor: c.bg }}>
      <main className="mx-auto max-w-2xl px-6 py-10 sm:px-8 sm:py-14">
        <Link href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: c.inkMuted }}>
          ← Back to dashboard
        </Link>

        {loading ? (
          <p className="text-sm" style={{ color: c.inkMuted }}>Loading…</p>
        ) : !match ? (
          <p className="text-sm" style={{ color: c.inkMuted }}>Match not found.</p>
        ) : (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight" style={{ color: c.ink }}>
                Your match
              </h1>
              <p className="mt-1 text-sm" style={{ color: c.inkMuted }}>
                You've been matched with someone who shares your experience.
              </p>
            </div>

            {/* Match card */}
            <div className="rounded-2xl border p-6 mb-6" style={{ backgroundColor: c.card, borderColor: c.border }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full text-white font-semibold mb-3"
                    style={{ backgroundColor: c.sage, fontSize: 18 }}>
                    {match.matched_with?.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-semibold" style={{ color: c.ink }}>{match.matched_with}</h2>
                  <p className="text-sm" style={{ color: c.inkMuted }}>Your peer match</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: c.sageLight, color: c.sage }}>
                  ✓ Matched
                </span>
              </div>

              <div className="mb-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: c.inkMuted }}>
                  Shared experience
                </p>
                <div className="flex flex-wrap gap-2">
                  {match.experience_categories.map((cat) => (
                    <span key={cat} className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{ backgroundColor: c.sageLight, color: c.sage }}>
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-4 text-sm leading-relaxed"
                style={{ backgroundColor: c.bg, borderWidth: 1, borderStyle: "solid", borderColor: c.border }}>
                <p className="mb-1 text-xs font-medium" style={{ color: c.inkMuted }}>Privacy reminder</p>
                <p style={{ color: c.inkSoft }}>
                  🔒 This conversation is private and messages are deleted after 3 days.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <Link href={`/chat/${match.match_id}`}
                className="inline-flex h-11 items-center justify-center rounded-full px-8 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#2f584b]"
                style={{ backgroundColor: c.sage }}>
                Start conversation →
              </Link>
              <Link href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium transition-colors hover:bg-black/5"
                style={{ color: c.inkSoft }}>
                Back to dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}