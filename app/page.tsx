"use client";

import { SignUpButton } from "@clerk/nextjs";

/* Aapun palette — warm linen, sage trust, apricot warmth */
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
  card: "rgba(255, 255, 255, 0.75)",
  border: "#d8e4de",
} as const;

export default function Home() {
  return (
    <div
      className="relative min-h-full overflow-hidden font-sans"
      style={{ backgroundColor: c.bg, color: c.inkSoft }}
    >
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
      <div
        aria-hidden
        className="pointer-events-none absolute top-[38%] right-[18%] h-56 w-56 rounded-full blur-2xl"
        style={{ backgroundColor: `${c.sageLight}99` }}
      />

      <main className="relative mx-auto flex min-h-full max-w-2xl flex-col justify-center px-6 py-14 sm:px-10 sm:py-24">
        <header className="mb-12 text-center">
          <div className="mb-6 flex flex-col items-center gap-4">
            <AapunMark size={56} />
            <p
              className="text-5xl font-semibold tracking-tight sm:text-6xl"
              style={{ color: c.ink }}
            >
              Aapun
            </p>
          </div>
          <h1
            className="mx-auto max-w-xl text-3xl leading-snug font-semibold tracking-tight sm:text-4xl"
            style={{ color: c.ink }}
          >
            Talk to someone who{" "}
            <span style={{ color: c.sage }}>truly gets it</span>
          </h1>
        </header>

        <section className="mb-10 space-y-5 text-lg leading-relaxed">
          <p>
            Aapun is a place for one-on-one conversations with others who share
            similar lived experiences — scheduled chats today, with room for
            real-time connection later.
          </p>
          <p>
            You bring your story. They bring theirs. No scripts, no diagnoses —
            just two humans listening to each other.
          </p>
        </section>

        <aside
          className="mb-12 rounded-2xl p-6 shadow-sm backdrop-blur-sm sm:p-8"
          style={{
            backgroundColor: c.card,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: c.border,
          }}
          role="note"
        >
          <div className="mb-3 flex items-start gap-3">
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: c.apricotLight, color: c.apricot }}
              aria-hidden
            >
              <HeartIcon />
            </span>
            <h2
              className="text-base font-semibold sm:text-lg"
              style={{ color: c.ink }}
            >
              A gentle but important note
            </h2>
          </div>
          <div className="space-y-3 leading-relaxed">
            <p>
              <strong className="font-medium" style={{ color: c.ink }}>
                Aapun is not therapy, counseling, or mental health treatment.
              </strong>{" "}
              Peers here are not clinicians and cannot give medical or
              professional advice.
            </p>
            <p>
              <strong className="font-medium" style={{ color: c.ink }}>
                Aapun is not a crisis or emergency service.
              </strong>{" "}
              If you or someone else is in immediate danger, please contact local
              emergency services or a crisis helpline in your area.
            </p>
            <p className="text-base" style={{ color: c.inkMuted }}>
              We&apos;re here for mutual support and shared understanding — warm,
              human, and real.
            </p>
          </div>
        </aside>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SignUpButton mode="modal" fallbackRedirectUrl="/get-started">
            <button className="inline-flex h-12 items-center justify-center rounded-full bg-[#3a6b5c] px-8 text-base font-medium text-white shadow-md transition-colors hover:bg-[#2f584b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a6b5c]">
              Get Started
            </button>
          </SignUpButton>
          <p className="text-sm" style={{ color: c.inkMuted }}>
            Takes a few minutes to set up your profile.
          </p>
        </div>
      </main>
    </div>
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

function HeartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}