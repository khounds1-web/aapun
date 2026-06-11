"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

const c = {
  bg: "#f6f4ef",
  ink: "#1c2824",
  inkSoft: "#4a5c56",
  inkMuted: "#6d8078",
  sage: "#3a6b5c",
  sageLight: "#e4ede9",
  apricotLight: "#FED7AA",
  card: "rgba(255, 255, 255, 0.85)",
  border: "#d8e4de",
  apricot: "#EA580C",
} as const;

type Profile = {
  full_name: string;
  description: string;
  experience_categories: string[];
};

export default function GetStartedSuccessPage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase
      .from("profiles")
      .select("full_name, description, experience_categories")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (error) console.error("Supabase fetch error:", error);
        setProfile(data);
        setLoading(false);
      });
  }, [isLoaded, user]);

  const firstName =
    profile?.full_name?.trim().split(/\s+/)[0] || "there";

  return (
    <div
      className="relative min-h-full overflow-hidden font-sans"
      style={{ backgroundColor: c.bg, color: c.inkSoft }}
    >
      <AmbientBackground />
      <main className="relative mx-auto flex min-h-full max-w-xl flex-col px-6 py-10 sm:px-8 sm:py-14">
        <header className="mb-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: c.inkMuted }}
          >
            <span aria-hidden>←</span> Back to home
          </Link>
          <div className="flex items-center gap-3">
            <AapunMark size={36} />
            <div>
              <p className="text-lg font-semibold tracking-tight" style={{ color: c.ink }}>Aapun</p>
              <p className="text-sm" style={{ color: c.inkMuted }}>
                <span className="italic">my own</span> — in Assamese
              </p>
            </div>
          </div>
        </header>

        <div
          className="flex flex-1 flex-col rounded-2xl p-6 shadow-sm backdrop-blur-sm sm:p-8"
          style={{ backgroundColor: c.card, borderWidth: 1, borderStyle: "solid", borderColor: c.border }}
        >
          {loading ? (
            <p className="py-8 text-center text-sm" style={{ color: c.inkMuted }}>Loading…</p>
          ) : profile ? (
            <div className="py-4 text-center">
              <div
                className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                style={{ backgroundColor: c.sageLight, color: c.sage }}
                aria-hidden
              >
                ✓
              </div>
              <h1 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
                Welcome, {firstName}
              </h1>
              <p className="mb-8 leading-relaxed" style={{ color: c.inkSoft }}>
                Your topic has been saved. We'll find you a peer who truly gets it.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center rounded-full px-8 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#2f584b]"
                  style={{ backgroundColor: c.sage }}
                >
                  Go to my dashboard
                </Link>
                <Link
                  href="/get-started"
                  className="inline-flex h-11 items-center justify-center rounded-full px-8 text-sm font-medium transition-colors hover:bg-black/5"
                  style={{ color: c.inkSoft }}
                >
                  + Add another topic
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <h1 className="mb-3 text-xl font-semibold tracking-tight" style={{ color: c.ink }}>
                No profile found
              </h1>
              <p className="mb-8 leading-relaxed" style={{ color: c.inkSoft }}>
                Start from the beginning to create your profile.
              </p>
              <Link
                href="/get-started"
                className="inline-flex h-11 items-center justify-center rounded-full px-8 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#2f584b]"
                style={{ backgroundColor: c.sage }}
              >
                Get started
              </Link>
            </div>
          )}
        </div>
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