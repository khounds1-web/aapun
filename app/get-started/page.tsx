"use client";

import { saveProfile } from "@/app/get-started/actions";
import { EXPERIENCE_AREAS, JOURNEY_STAGES } from "@/app/get-started/categories";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

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
  border: "#ddd6f0",
} as const;

const DESCRIPTION_MAX = 500;

export default function GetStartedPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [existingName, setExistingName] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [journeyStage, setJourneyStage] = useState("");
  const [description, setDescription] = useState("");
  const [username, setUsername] = useState("");
  const [confirmedAdult, setConfirmedAdult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoadingUser(false);
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase
      .from("profiles")
      .select("full_name, username")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0 && data[0]?.full_name) {
          setExistingName(data[0].full_name);
        }
        setLoadingUser(false);
      });
  }, [isLoaded, user]);

  // Returning users skip the username step (step 4)
  const isReturning = existingName !== null;
  const TOTAL_STEPS = isReturning ? 3 : 4;

  function toggleCategory(category: string) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  function goNext() {
    if (step < TOTAL_STEPS) setStep((step + 1) as 1 | 2 | 3 | 4);
  }

  function goBack() {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3 | 4);
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    // Returning users keep their existing name; new users supply a username
    const nameToUse = isReturning ? existingName! : username.trim();

    try {
      const result = await saveProfile({
        fullName: nameToUse,
        username: username.trim() || undefined,
        journeyStage: journeyStage || undefined,
        description: description.trim(),
        experienceCategories: Array.from(categories),
      });

      if (result?.error) {
        setSubmitError(result.error);
        setIsSubmitting(false);
        return;
      }

      router.push("/get-started/success");
    } catch (err) {
      console.error("[get-started] save failed", err);
      setSubmitError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  const canContinue =
    (step === 1 && categories.size > 0) ||
    (step === 2 && journeyStage !== "") ||
    step === 3 || // description is optional
    (step === 4 && username.trim().length >= 2 && confirmedAdult);

  const progress = (step / TOTAL_STEPS) * 100;

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: c.bg }}>
        <p className="text-sm" style={{ color: c.inkMuted }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden font-sans" style={{ backgroundColor: c.bg, color: c.inkSoft }}>
      <AmbientBackground />

      <main className="relative mx-auto flex min-h-screen max-w-xl flex-col px-6 py-10 sm:px-8 sm:py-14">
        <header className="mb-8">
          <Link href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: c.inkMuted }}>
            <span aria-hidden>←</span> Back to dashboard
          </Link>

          <div className="mb-6 flex items-center gap-3">
            <AapunMark size={36} />
            <div>
              <p className="text-lg font-semibold tracking-tight" style={{ color: c.ink }}>Aapun</p>
              <p className="text-sm" style={{ color: c.inkMuted }}>
                <span className="italic">my own</span> — in Assamese
              </p>
            </div>
          </div>

          {isReturning && (
            <p className="mb-4 text-sm" style={{ color: c.inkMuted }}>
              Welcome back, <strong style={{ color: c.ink }}>{existingName}</strong>. Add a new topic below.
            </p>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: c.inkMuted }}>Step {step} of {TOTAL_STEPS}</span>
              <span className="font-medium" style={{ color: c.sage }}>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: c.sageLight }}
              role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%`, backgroundColor: c.sage }} />
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col rounded-2xl p-6 shadow-sm backdrop-blur-sm sm:p-8"
          style={{ backgroundColor: c.card, borderWidth: 1, borderStyle: "solid", borderColor: c.border }}>

          {step === 1 && (
            <StepCategories
              selected={categories}
              onToggle={toggleCategory}
              firstName={existingName?.split(" ")[0] || null}
            />
          )}
          {step === 2 && (
            <StepJourneyStage value={journeyStage} onChange={setJourneyStage} />
          )}
          {step === 3 && (
            <StepDescription value={description} onChange={setDescription} maxLength={DESCRIPTION_MAX} />
          )}
          {step === 4 && !isReturning && (
            <StepUsername
              value={username}
              onChange={setUsername}
              confirmedAdult={confirmedAdult}
              onConfirmedAdultChange={setConfirmedAdult}
            />
          )}

          {submitError && (
            <p className="mt-6 rounded-xl px-4 py-3 text-sm leading-relaxed"
              style={{ backgroundColor: c.apricotLight, color: c.ink, borderWidth: 1, borderStyle: "solid", borderColor: `${c.apricot}44` }}
              role="alert">
              {submitError}
            </p>
          )}

          <nav className="mt-10 flex items-center justify-between gap-4 border-t pt-8" style={{ borderColor: c.border }}>
            {step > 1 ? (
              <button type="button" onClick={goBack}
                className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition-colors hover:bg-black/5"
                style={{ color: c.inkSoft }}>
                Back
              </button>
            ) : <span />}

            {step < TOTAL_STEPS ? (
              <button type="button" onClick={goNext} disabled={!canContinue}
                className="inline-flex h-11 items-center justify-center rounded-full px-8 text-sm font-medium text-white shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: c.sage }}>
                Continue
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={!canContinue || isSubmitting}
                className="inline-flex h-11 min-w-[9.5rem] items-center justify-center rounded-full px-8 text-sm font-medium text-white shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: c.sage }}>
                {isSubmitting ? "Saving…" : "Add topic"}
              </button>
            )}
          </nav>
        </div>
      </main>
    </div>
  );
}

// ── Step 1: Experience categories ─────────────────────────────────────────────

function StepCategories({
  selected, onToggle, firstName,
}: {
  selected: Set<string>;
  onToggle: (category: string) => void;
  firstName: string | null;
}) {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
        {firstName ? `Hi ${firstName}, what's on your mind?` : "Hi, what's on your mind?"}
      </h1>
      <p className="mb-8 leading-relaxed" style={{ color: c.inkSoft }}>
        Choose every experience that fits. This helps us connect you with someone who truly gets it.
      </p>
      <div className="space-y-6">
        {(Object.entries(EXPERIENCE_AREAS) as [string, { label: string; subcategories: readonly string[] }][]).map(
          ([, area]) => (
            <div key={area.label}>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: c.inkMuted }}>
                {area.label}
              </p>
              <fieldset>
                <legend className="sr-only">{area.label}</legend>
                <div className="flex flex-wrap gap-2.5">
                  {area.subcategories.map((category) => {
                    const isSelected = selected.has(category);
                    return (
                      <button key={category} type="button" aria-pressed={isSelected}
                        onClick={() => onToggle(category)}
                        className="rounded-full px-4 py-2.5 text-sm font-medium transition-all"
                        style={isSelected
                          ? { backgroundColor: c.sage, color: "#fff", boxShadow: "0 1px 3px rgba(107,91,158,0.25)" }
                          : { backgroundColor: "#fff", color: c.inkSoft, borderWidth: 1, borderStyle: "solid", borderColor: c.border }}>
                        {category}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          )
        )}
      </div>
      {selected.size > 0 && (
        <p className="mt-6 text-sm" style={{ color: c.sage }}>
          {selected.size} selected — you can always update this later.
        </p>
      )}
    </div>
  );
}

// ── Step 2: Journey stage ─────────────────────────────────────────────────────

function StepJourneyStage({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
        Where are you in your journey?
      </h1>
      <p className="mb-8 leading-relaxed" style={{ color: c.inkSoft }}>
        This helps us find someone at a similar stage — not too far ahead, not too far behind.
      </p>
      <div className="space-y-3" role="radiogroup" aria-label="Journey stage">
        {JOURNEY_STAGES.map((stage) => {
          const isSelected = value === stage.value;
          return (
            <button key={stage.value} type="button" role="radio" aria-checked={isSelected}
              onClick={() => onChange(stage.value)}
              className="w-full rounded-xl px-5 py-4 text-left transition-all"
              style={isSelected
                ? { backgroundColor: c.sage, color: "#fff", boxShadow: "0 1px 4px rgba(107,91,158,0.3)" }
                : { backgroundColor: "#fff", borderWidth: 1, borderStyle: "solid", borderColor: c.border }}>
              <p className="font-semibold text-sm" style={{ color: isSelected ? "#fff" : c.ink }}>
                {stage.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: isSelected ? "rgba(255,255,255,0.75)" : c.inkMuted }}>
                {stage.sub}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 3: Description ───────────────────────────────────────────────────────

function StepDescription({ value, onChange, maxLength }: { value: string; onChange: (value: string) => void; maxLength: number }) {
  const remaining = maxLength - value.length;
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
        Tell us your story, in your words
      </h1>
      <p className="mb-2 leading-relaxed" style={{ color: c.inkSoft }}>
        A few sentences about what you'd like to talk about with someone who gets it.
      </p>
      <p className="mb-6 text-sm" style={{ color: c.inkMuted }}>
        This is optional — share as much or as little as you'd like.
      </p>
      <label htmlFor="experience-description" className="sr-only">Your story</label>
      <textarea id="experience-description" value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))} rows={6}
        placeholder="For example: I'm a first-time mom with a 6-month-old and I'm really struggling with the isolation. I'd love to talk to someone who gets it…"
        className="w-full resize-y rounded-xl px-4 py-3 text-base leading-relaxed outline-none transition-shadow focus:ring-2"
        style={{ backgroundColor: "#fff", borderWidth: 1, borderStyle: "solid", borderColor: c.border, color: c.ink, "--tw-ring-color": c.sage } as React.CSSProperties} />
      <div className="mt-2 flex justify-end text-sm">
        <p style={{ color: c.inkMuted }}>{remaining} left</p>
      </div>
    </div>
  );
}

// ── Step 4: Username + adult confirm (new users only) ────────────────────────

function StepUsername({ value, onChange, confirmedAdult, onConfirmedAdultChange }: {
  value: string; onChange: (value: string) => void;
  confirmedAdult: boolean; onConfirmedAdultChange: (value: boolean) => void;
}) {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
        What should we call you?
      </h1>
      <p className="mb-6 leading-relaxed" style={{ color: c.inkSoft }}>
        This is what your match will see — not your full name. Use a first name, nickname, or anything you're comfortable with.
      </p>
      <label htmlFor="username" className="mb-2 block text-sm font-medium" style={{ color: c.ink }}>
        Your name on Aapun
      </label>
      <input id="username" type="text" autoComplete="nickname" value={value}
        onChange={(e) => onChange(e.target.value)} placeholder="First name or chosen name"
        className="mb-4 w-full rounded-xl px-4 py-3 text-base outline-none transition-shadow focus:ring-2"
        style={{ color: c.ink, backgroundColor: "#fff", borderWidth: 1, borderStyle: "solid", borderColor: c.border }} />
      <div className="mb-6">
        <label htmlFor="confirm-adult" className="flex cursor-pointer items-start gap-3 rounded-xl px-1 py-1">
          <input id="confirm-adult" type="checkbox" checked={confirmedAdult}
            onChange={(e) => onConfirmedAdultChange(e.target.checked)} aria-required="true"
            className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 rounded outline-none"
            style={{ accentColor: c.sage, borderColor: c.border }} />
          <span className="text-sm font-medium leading-snug" style={{ color: c.ink }}>
            I confirm I am 18 years of age or older
          </span>
        </label>
      </div>
      <aside className="rounded-xl p-4 text-sm leading-relaxed"
        style={{ backgroundColor: c.apricotLight, borderWidth: 1, borderStyle: "solid", borderColor: `${c.apricot}33` }} role="note">
        <p className="font-medium" style={{ color: c.ink }}>Aapun is not therapy or medical advice.</p>
        <p className="mt-2" style={{ color: c.inkSoft }}>
          Peers on Aapun are not clinicians. This platform is for mutual support — not diagnosis, treatment, or crisis care.
        </p>
      </aside>
    </div>
  );
}

// ── Decorative components ─────────────────────────────────────────────────────

function AmbientBackground() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full blur-3xl"
        style={{ backgroundColor: `${c.sage}18` }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-36 -right-20 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ backgroundColor: `${c.apricot}18` }} />
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
