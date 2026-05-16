"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  readTempGetStartedProfile,
  type TempGetStartedProfile,
} from "@/app/get-started/temp-profile-storage";

const c = {
  bg: "#f6f4ef",
  ink: "#1c2824",
  inkSoft: "#4a5c56",
  inkMuted: "#6d8078",
  sage: "#3a6b5c",
  sageLight: "#e4ede9",
  apricotLight: "#f3e4db",
  card: "rgba(255, 255, 255, 0.85)",
  border: "#d8e4de",
  apricot: "#c97a52",
} as const;

export default function GetStartedSuccessPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const profile: TempGetStartedProfile | null = mounted
    ? readTempGetStartedProfile()
    : null;

  const trimmed = profile?.fullName.trim() ?? "";
  const firstName =
    trimmed.split(/\s+/).filter(Boolean)[0] || trimmed || "there";

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
              <p
                className="text-lg font-semibold tracking-tight"
                style={{ color: c.ink }}
              >
                Aapun
              </p>
              <p className="text-sm" style={{ color: c.inkMuted }}>
                <span className="italic">my own</span> — in Assamese
              </p>
            </div>
          </div>
        </header>

        <div
          className="flex flex-1 flex-col rounded-2xl p-6 shadow-sm backdrop-blur-sm sm:p-8"
          style={{
            backgroundColor: c.card,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: c.border,
          }}
        >
          {!mounted ? (
            <p className="py-8 text-center text-sm" style={{ color: c.inkMuted }}>
              Loading…
            </p>
          ) : profile ? (
            <div className="py-4 text-center">
              <div
                className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                style={{ backgroundColor: c.sageLight, color: c.sage }}
                aria-hidden
              >
                ✓
              </div>
              <h1
                className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl"
                style={{ color: c.ink }}
              >
                Welcome, {firstName}
              </h1>
              <p className="mb-6 leading-relaxed" style={{ color: c.inkSoft }}>
                Your answers are saved on this device for now. When accounts are
                ready, you&apos;ll be able to sign in and keep your profile.
              </p>
              <p
                className="mb-8 rounded-xl px-4 py-3 text-sm leading-relaxed"
                style={{
                  backgroundColor: c.apricotLight,
                  color: c.inkSoft,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: `${c.apricot}33`,
                }}
              >
                This profile is stored only in your browser (localStorage). Clearing
                site data or using another device won&apos;t include it.
              </p>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-full px-8 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#2f584b]"
                style={{ backgroundColor: c.sage }}
              >
                Back to home
              </Link>
            </div>
          ) : (
            <div className="py-6 text-center">
              <h1
                className="mb-3 text-xl font-semibold tracking-tight"
                style={{ color: c.ink }}
              >
                No profile found
              </h1>
              <p className="mb-8 leading-relaxed" style={{ color: c.inkSoft }}>
                Start from the beginning to create your profile on this device.
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
      <div
        aria-hidden
        className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full blur-3xl"
        style={{ backgroundColor: `${c.sage}22` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-36 -right-20 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ backgroundColor: `${c.apricot}28` }}
      />
    </>
  );
}

function AapunMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
    >
      <circle
        cx="15"
        cy="20"
        r="11"
        fill={`${c.sage}33`}
        stroke={c.sage}
        strokeWidth="1.5"
      />
      <circle
        cx="25"
        cy="20"
        r="11"
        fill={`${c.apricot}33`}
        stroke={c.apricot}
        strokeWidth="1.5"
      />
    </svg>
  );
}
