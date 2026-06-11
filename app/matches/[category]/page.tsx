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
  apricot: "#EA580C",
  apricotLight: "#FED7AA",
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
  const idsParam = searchParams.get("ids");

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/"); return; }

    if (matchId) {
      // Single match
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .eq("match_id", matchId)
        .single()
        .then(({ data }) => {
          if (data) setMatches([data]);
          setLoading(false);
        });
    } else if (idsParam) {
      // Multiple matches
      const ids = idsParam.split(",");
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .in("match_id", ids)
        .then(({ data }) => {
          setMatches(data || []);
          setLoading(false);
        });
    } else {
      router.push("/dashboard");
    }
  }, [isLoaded, user, matchId, idsParam]);

  const isMultiple = matches.length > 1;

  return (
    <div className="min-h-full font-sans" style={{ backgroundColor: c.bg }}>
      <main className="mx-auto max-w-2xl px-6 py-10 sm:px-8 sm:py-14">
        <Link href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: c.inkMuted }}>
          ← Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: c.ink }}>
            {isMultiple ? "Your matches" : "Your match"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: c.inkMuted }}>
            {isMultiple
              ? "You've been matched with multiple parents who share your experience."
              : "You've been matched with someone who shares your experience."}
          </p>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: c.inkMuted }}>Loading…</p>
        ) : matches.length === 0 ? (
          <p className="text-sm" style={{ color: c.inkMuted }}>No matches found.</p>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="rounded-2xl border p-6"
                style={{ backgroundColor: c.card, borderColor: c.border }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full text-white font-semibold"
                      style={{ backgroundColor: c.sage, fontSize: 18 }}>
                      {match.matched_with?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-semibold" style={{ color: c.ink }}>{match.matched_with}</h2>
                      <p className="text-xs" style={{ color: c.inkMuted }}>Your peer match</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                    style={{ backgroundColor: c.sageLight, color: c.sage }}>
                    ✓ Matched
                  </span>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {match.experience_categories.map((cat) => (
                    <span key={cat} className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{ backgroundColor: c.sageLight, color: c.sage }}>
                      {cat}
                    </span>
                  ))}
                </div>

                <div className="mb-4 rounded-xl p-3 text-xs"
                  style={{ backgroundColor: c.bg, borderWidth: 1, borderStyle: "solid", borderColor: c.border, color: c.inkMuted }}>
                  🔒 Private conversation — messages deleted after 3 days.
                </div>

                <Link href={`/chat/${match.match_id}`}
                  className="inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#2f584b]"
                  style={{ backgroundColor: c.sage }}>
                  Start conversation →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}