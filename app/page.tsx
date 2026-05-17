"use client";

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const c = {
  bg: "#f4f0f8",
  ink: "#1e1a2e",
  inkSoft: "#4a4060",
  inkMuted: "#8a7fa0",
  sage: "#6b5b9e",
  sageDark: "#574a85",
  sageLight: "#ede8f8",
  apricot: "#c97a52",
  apricotLight: "#f3e4db",
  card: "rgba(255, 255, 255, 0.85)",
  border: "#ede8f8",
} as const;

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn]);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: c.bg, color: c.inkSoft }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 sm:px-12">
        <div className="flex items-center gap-3">
          <AapunMark size={36} />
          <span className="text-xl font-semibold tracking-tight" style={{ color: c.ink }}>Aapun</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium" style={{ color: c.inkMuted }}>
            <a href="#how-it-works" className="transition-opacity hover:opacity-70">How it works</a>
            <a href="#safety" className="transition-opacity hover:opacity-70">Safety</a>
            <a href="#about" className="transition-opacity hover:opacity-70">About</a>
          </div>
          <SignInButton mode="modal">
            <button className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: c.inkSoft }}>
              Sign in
            </button>
          </SignInButton>
        </div>
      </nav>

      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[85vh]">
        <div className="flex flex-col justify-center px-8 py-16 sm:px-12 lg:px-16">
          <div className="max-w-lg">
            <h1 className="mb-3 text-5xl font-semibold leading-tight tracking-tight sm:text-6xl" style={{ color: c.ink }}>
              Talk to someone who{" "}
              <span className="italic" style={{ color: c.sage }}>truly</span>{" "}
              gets it
            </h1>
            <p className="mb-6 text-xl font-medium" style={{ color: c.ink }}>
              The trusted friend you never knew you had.
            </p>
            <p className="mb-8 text-lg leading-relaxed" style={{ color: c.inkSoft }}>
              Aapun is a quiet space for meaningful one-on-one conversations with people who share similar lived experiences.
            </p>

            <div className="mb-10 grid grid-cols-3 gap-4">
              {[
                { icon: "♡", title: "Real conversations", sub: "No advice unless asked." },
                { icon: "⌂", title: "People who get it", sub: "People like you." },
                { icon: "🔒", title: "Private & respectful", sub: "Your story stays yours." },
              ].map((f) => (
                <div key={f.title}>
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full text-base"
                    style={{ backgroundColor: c.sageLight, color: c.sage }}>
                    {f.icon}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: c.ink }}>{f.title}</p>
                  <p className="text-xs leading-snug" style={{ color: c.inkMuted }}>{f.sub}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <SignUpButton mode="modal">
                <button className="inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-medium text-white shadow-md transition-colors"
                  style={{ backgroundColor: c.sage }}>
                  Get Started
                </button>
              </SignUpButton>
              <a href="#how-it-works"
                className="inline-flex h-12 items-center gap-2 text-base font-medium transition-opacity hover:opacity-70"
                style={{ color: c.inkSoft }}>
                How it works →
              </a>
            </div>

            <p className="mt-6 flex items-center gap-2 text-xs" style={{ color: c.inkMuted }}>
              <span>🔒</span> Safe. Private. Human.
            </p>
          </div>
        </div>

        {/* Hero image with gradient blend */}
        <div className="relative hidden lg:block overflow-hidden">
          <Image
            src="/mugs.png"
            alt="A conversation between two people"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0" style={{
            background: `linear-gradient(to right, ${c.bg} 0%, ${c.bg}99 10%, ${c.bg}44 30%, transparent 55%)`
          }} />
          <div className="absolute inset-0" style={{
            background: `linear-gradient(to bottom, ${c.bg}88 0%, transparent 20%, transparent 80%, ${c.bg}88 100%)`
          }} />
        </div>
      </section>

      {/* You bring your story */}
      <section className="px-8 py-20 text-center sm:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 text-2xl" style={{ color: c.apricot }}>♡</div>
          <h2 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: c.ink }}>
            You bring your story. They bring theirs.
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: c.inkSoft }}>
            Just two humans listening to each other.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-8 py-16 sm:px-12" id="how-it-works">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight" style={{ color: c.ink }}>
            How Aapun works
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { step: "1", title: "Share your experience", desc: "Tell us what you're navigating — no pressure, no judgment." },
              { step: "2", title: "We find your match", desc: "We connect you with someone who truly understands your situation." },
              { step: "3", title: "Have a real conversation", desc: "Connect one-on-one, at your own pace, on your terms." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl p-6"
                style={{ backgroundColor: c.card, borderWidth: 1, borderStyle: "solid", borderColor: c.border }}>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: c.sage }}>
                  {s.step}
                </div>
                <h3 className="mb-2 font-semibold" style={{ color: c.ink }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: c.inkSoft }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="px-8 py-16 sm:px-12" id="safety">
        <div className="mx-auto max-w-2xl rounded-2xl p-8 sm:p-10"
          style={{ backgroundColor: "#ffffff", borderWidth: 1, borderStyle: "solid", borderColor: c.border }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: c.ink }}>A gentle but important note</h2>
          <p className="mb-3 leading-relaxed" style={{ color: c.inkSoft }}>
            <strong style={{ color: c.ink }}>Aapun is not therapy, counseling, or mental health treatment.</strong>{" "}
            Peers here are not clinicians and cannot give medical or professional advice.
          </p>
          <p className="mb-3 leading-relaxed" style={{ color: c.inkSoft }}>
            <strong style={{ color: c.ink }}>Aapun is not a crisis or emergency service.</strong>{" "}
            If you or someone else is in immediate danger, please contact local emergency services or a crisis helpline in your area.
          </p>
          <p className="leading-relaxed" style={{ color: c.inkSoft }}>
            <strong style={{ color: c.ink }}>Your conversations are private.</strong>{" "}
            Messages are only visible to you and your match, and are automatically deleted after 3 days.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="px-8 py-16 text-center sm:px-12" id="about">
        <div className="mx-auto max-w-xl">
          <div className="flex items-center justify-center gap-3 mb-3">
            <AapunMark size={36} />
            <h2 className="text-2xl font-semibold tracking-tight" style={{ color: c.ink }}>About Aapun</h2>
          </div>
          <p className="leading-relaxed" style={{ color: c.inkSoft }}>
            Aapun means <em>my own</em> in Assamese. We built this because sometimes you just need to make a new friend — one who truly gets it. The trusted friend you never knew you had.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-8 py-20 text-center sm:px-12">
        <h2 className="mb-6 text-3xl font-semibold tracking-tight" style={{ color: c.ink }}>
          Ready to find your person?
        </h2>
        <SignUpButton mode="modal">
          <button className="inline-flex h-12 items-center justify-center rounded-full px-10 text-base font-medium text-white shadow-md"
            style={{ backgroundColor: c.sage }}>
            Get Started — it's free
          </button>
        </SignUpButton>
      </section>

      {/* Footer */}
      <footer className="border-t px-8 py-8 text-center text-sm" style={{ borderColor: c.border, color: c.inkMuted }}>
        © 2026 Aapun. Safe. Private. Human.
      </footer>

    </div>
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