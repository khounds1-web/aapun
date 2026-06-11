"use client";

import { saveProfile } from "@/app/get-started/actions";
import { EXPERIENCE_AREAS } from "@/app/get-started/categories";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

const c = {
  bg: "#F9FAFB",
  ink: "#1F2937",
  inkSoft: "#374151",
  inkMuted: "#6B7280",
  sage: "#0EA5E9",
  sageDark: "#0284C7",
  sageLight: "#E0F2FE",
  apricot: "#EA580C",
  apricotLight: "#FED7AA",
  card: "rgba(255, 255, 255, 0.85)",
  border: "#E5E7EB",
} as const;

export default function GetStartedPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [existingName, setExistingName] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // New spec fields
  const [emotionalState, setEmotionalState] = useState("");
  const [hereFor, setHereFor] = useState("");
  const [ageRange, setAgeRange] = useState("");
  // Existing fields
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [description, setDescription] = useState("");
  const [username, setUsername] = useState("");
  const [confirmedAdult, setConfirmedAdult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

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

  // Step order:
  // 1 = emotional state, 2 = here for, 3 = age range,
  // 4 = categories, 5 = short intro (optional),
  // 6 = username + confirm (new users only)
  const isReturning = existingName !== null;
  const TOTAL_STEPS = isReturning ? 5 : 6;

  function toggleCategory(category: string) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  function goNext() {
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const nameToUse = isReturning ? existingName! : username.trim();

    try {
      const result = await saveProfile({
        fullName: nameToUse,
        username: username.trim() || undefined,
        emotionalState: emotionalState || undefined,
        hereFor: hereFor || undefined,
        ageRange: ageRange || undefined,
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
    (step === 1 && emotionalState !== "") ||
    (step === 2 && hereFor !== "") ||
    (step === 3 && ageRange !== "") ||
    (step === 4 && categories.size > 0) ||
    step === 5 || // intro is optional
    (step === 6 && username.trim().length >= 2 && confirmedAdult);

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
            <p className="mb-4 text-base" style={{ color: c.inkMuted }}>
              Welcome back, <strong style={{ color: c.ink }}>{existingName}</strong>. Add another topic below.
            </p>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-base">
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
            <StepEmotionalState value={emotionalState} onChange={setEmotionalState} />
          )}
          {step === 2 && (
            <StepHereFor value={hereFor} onChange={setHereFor} />
          )}
          {step === 3 && (
            <StepAgeRange value={ageRange} onChange={setAgeRange} />
          )}
          {step === 4 && (
            <StepCategories
              selected={categories}
              onToggle={toggleCategory}
              firstName={existingName?.split(" ")[0] || null}
            />
          )}
          {step === 5 && (
            <StepDescription value={description} onChange={setDescription} maxLength={150} />
          )}
          {step === 6 && !isReturning && (
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
                className="inline-flex h-12 items-center justify-center rounded-full px-6 text-base font-medium transition-colors hover:bg-black/5"
                style={{ color: c.inkSoft }}>
                ← Back
              </button>
            ) : <span />}

            {step < TOTAL_STEPS ? (
              <button type="button" onClick={goNext} disabled={!canContinue}
                className="inline-flex h-12 items-center justify-center rounded-full px-10 text-base font-medium text-white shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: c.sage }}>
                Continue
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={!canContinue || isSubmitting}
                className="inline-flex h-12 min-w-[10rem] items-center justify-center rounded-full px-10 text-base font-medium text-white shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: c.sage }}>
                {isSubmitting ? "Saving…" : "Find my people"}
              </button>
            )}
          </nav>
        </div>
      </main>
    </div>
  );
}

// ── Step 1: Emotional state ───────────────────────────────────────────────────

const EMOTIONAL_STATES = [
  { value: "Excited", emoji: "✨", sub: "Ready for what's next" },
  { value: "Hopeful", emoji: "🌤️", sub: "Things are looking up" },
  { value: "At peace", emoji: "🌿", sub: "Settled, open to connection" },
  { value: "Uncertain", emoji: "🌀", sub: "Figuring things out" },
  { value: "Struggling", emoji: "🌧️", sub: "It's been a tough stretch" },
];

function StepEmotionalState({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
        How are you feeling right now?
      </h1>
      <p className="mb-8 text-lg leading-relaxed" style={{ color: c.inkSoft }}>
        No right answer — just where you are today.
      </p>
      <div className="space-y-3" role="radiogroup" aria-label="How you're feeling">
        {EMOTIONAL_STATES.map((s) => {
          const isSelected = value === s.value;
          return (
            <button key={s.value} type="button" role="radio" aria-checked={isSelected}
              onClick={() => onChange(s.value)}
              className="w-full rounded-xl px-5 py-4 text-left transition-all flex items-center gap-4"
              style={isSelected
                ? { backgroundColor: c.sage, color: "#fff", boxShadow: "0 1px 4px rgba(14,165,233,0.3)" }
                : { backgroundColor: "#fff", borderWidth: 1, borderStyle: "solid", borderColor: c.border }}>
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <p className="font-semibold text-base" style={{ color: isSelected ? "#fff" : c.ink }}>{s.value}</p>
                <p className="text-sm mt-0.5" style={{ color: isSelected ? "rgba(255,255,255,0.8)" : c.inkMuted }}>{s.sub}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 2: What you're here for ─────────────────────────────────────────────

const HERE_FOR_OPTIONS = [
  { value: "Listen", emoji: "👂", sub: "I want to hear someone else's story" },
  { value: "Share my story", emoji: "💬", sub: "I need to talk it through" },
  { value: "Figure things out", emoji: "🧭", sub: "I'm looking for perspective" },
  { value: "Feel less alone", emoji: "🤝", sub: "I just want to know others get it" },
  { value: "Get perspective", emoji: "🔭", sub: "I want to hear how others see it" },
];

function StepHereFor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
        What are you here for?
      </h1>
      <p className="mb-8 text-lg leading-relaxed" style={{ color: c.inkSoft }}>
        This helps us match you with the right kind of conversation partner.
      </p>
      <div className="space-y-3" role="radiogroup" aria-label="What you're here for">
        {HERE_FOR_OPTIONS.map((s) => {
          const isSelected = value === s.value;
          return (
            <button key={s.value} type="button" role="radio" aria-checked={isSelected}
              onClick={() => onChange(s.value)}
              className="w-full rounded-xl px-5 py-4 text-left transition-all flex items-center gap-4"
              style={isSelected
                ? { backgroundColor: c.sage, color: "#fff", boxShadow: "0 1px 4px rgba(14,165,233,0.3)" }
                : { backgroundColor: "#fff", borderWidth: 1, borderStyle: "solid", borderColor: c.border }}>
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <p className="font-semibold text-base" style={{ color: isSelected ? "#fff" : c.ink }}>{s.value}</p>
                <p className="text-sm mt-0.5" style={{ color: isSelected ? "rgba(255,255,255,0.8)" : c.inkMuted }}>{s.sub}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 3: Age range ─────────────────────────────────────────────────────────

const AGE_RANGES = ["60–65", "65–70", "70–75", "75–80", "80+"];

function StepAgeRange({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
        How old are you?
      </h1>
      <p className="mb-8 text-lg leading-relaxed" style={{ color: c.inkSoft }}>
        We use this to find peers at a similar stage of life.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Age range">
        {AGE_RANGES.map((range) => {
          const isSelected = value === range;
          return (
            <button key={range} type="button" role="radio" aria-checked={isSelected}
              onClick={() => onChange(range)}
              className="rounded-xl px-5 py-5 text-center transition-all"
              style={isSelected
                ? { backgroundColor: c.sage, color: "#fff", boxShadow: "0 1px 4px rgba(14,165,233,0.3)" }
                : { backgroundColor: "#fff", borderWidth: 1, borderStyle: "solid", borderColor: c.border }}>
              <p className="font-semibold text-lg" style={{ color: isSelected ? "#fff" : c.ink }}>{range}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 4: Experience categories (accordion) ────────────────────────────────

function StepCategories({
  selected, onToggle, firstName,
}: {
  selected: Set<string>;
  onToggle: (category: string) => void;
  firstName: string | null;
}) {
  const [openAreas, setOpenAreas] = useState<Set<string>>(new Set());

  function toggleArea(areaKey: string) {
    setOpenAreas((prev) => {
      const next = new Set(prev);
      if (next.has(areaKey)) next.delete(areaKey);
      else next.add(areaKey);
      return next;
    });
  }

  function selectAll(subcategories: readonly string[]) {
    subcategories.forEach((cat) => {
      if (!selected.has(cat)) onToggle(cat);
    });
  }

  const areas = Object.entries(EXPERIENCE_AREAS) as [string, { label: string; subcategories: readonly string[] }][];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
        {firstName ? `Hi ${firstName}, what's this chapter about for you?` : "What's this chapter about for you?"}
      </h1>
      <p className="mb-6 text-lg leading-relaxed" style={{ color: c.inkSoft }}>
        Pick everything that feels true — across as many topics as you like. The more you choose, the better your matches.
      </p>

      <div className="space-y-2">
        {areas.map(([areaKey, area]) => {
          const isOpen = openAreas.has(areaKey);
          const selectedCount = area.subcategories.filter(s => selected.has(s)).length;
          const allSelected = selectedCount === area.subcategories.length;

          return (
            <div key={areaKey} className="rounded-xl overflow-hidden"
              style={{ borderWidth: 1, borderStyle: "solid", borderColor: isOpen ? c.sage + "66" : c.border }}>

              {/* Area header — tap to expand/collapse */}
              <button
                type="button"
                onClick={() => toggleArea(areaKey)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors"
                style={{ backgroundColor: isOpen ? c.sageLight : "#fff" }}
                aria-expanded={isOpen}>
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-base" style={{ color: c.ink }}>
                    {area.label}
                  </span>
                  {selectedCount > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: c.sage, color: "#fff", minWidth: 20 }}>
                      {selectedCount}
                    </span>
                  )}
                </div>
                <span className="text-sm transition-transform duration-200"
                  style={{ color: c.inkMuted, display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                  ▾
                </span>
              </button>

              {/* Subtopics — shown when expanded */}
              {isOpen && (
                <div className="px-4 pb-4 pt-3" style={{ borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: c.sage + "33" }}>
                  <fieldset>
                    <legend className="sr-only">{area.label} subtopics</legend>
                    <div className="flex flex-wrap gap-2">
                      {area.subcategories.map((category) => {
                        const isSelected = selected.has(category);
                        return (
                          <button key={category} type="button" aria-pressed={isSelected}
                            onClick={() => onToggle(category)}
                            className="rounded-full px-4 py-2.5 text-base font-medium transition-all"
                            style={isSelected
                              ? { backgroundColor: c.sage, color: "#fff" }
                              : { backgroundColor: "#fff", color: c.inkSoft, borderWidth: 1, borderStyle: "solid", borderColor: c.border }}>
                            {category}
                          </button>
                        );
                      })}
                    </div>
                    {!allSelected && (
                      <button
                        type="button"
                        onClick={() => selectAll(area.subcategories)}
                        className="mt-3 text-sm font-medium transition-opacity hover:opacity-70"
                        style={{ color: c.sage }}>
                        Select all in this topic
                      </button>
                    )}
                  </fieldset>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-base" style={{ color: selected.size > 0 ? c.sage : c.inkMuted }}>
        {selected.size === 0
          ? "Nothing selected yet — open a topic above to get started."
          : selected.size < 3
            ? `${selected.size} selected — feel free to pick more across different topics.`
            : `${selected.size} selected ✓`}
      </p>
    </div>
  );
}

// ── Step 5: Description ───────────────────────────────────────────────────────

function StepDescription({ value, onChange, maxLength }: { value: string; onChange: (value: string) => void; maxLength: number }) {
  const remaining = maxLength - value.length;
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
        A little about you
      </h1>
      <p className="mb-2 text-lg leading-relaxed" style={{ color: c.inkSoft }}>
        A few sentences about where you are and what you'd love to talk about. This is what your conversation partner will see.
      </p>
      <p className="mb-6 text-base" style={{ color: c.inkMuted }}>
        Completely optional — share as much or as little as you like.
      </p>
      <label htmlFor="experience-description" className="sr-only">A little about you</label>
      <textarea id="experience-description" value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))} rows={6}
        placeholder="For example: I retired last year after 30 years in nursing, and honestly I wasn't ready for how quiet everything became. I'd love to talk to someone who's navigated that shift…"
        className="w-full resize-y rounded-xl px-4 py-3 text-base leading-relaxed outline-none transition-shadow focus:ring-2"
        style={{ backgroundColor: "#fff", borderWidth: 1, borderStyle: "solid", borderColor: c.border, color: c.ink, "--tw-ring-color": c.sage } as React.CSSProperties} />
      <div className="mt-2 flex justify-end text-base">
        <p style={{ color: c.inkMuted }}>{remaining} characters left</p>
      </div>
    </div>
  );
}

// ── Step 6: Username + adult confirm (new users only) ────────────────────────

function StepUsername({ value, onChange, confirmedAdult, onConfirmedAdultChange }: {
  value: string; onChange: (value: string) => void;
  confirmedAdult: boolean; onConfirmedAdultChange: (value: boolean) => void;
}) {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
        What should we call you?
      </h1>
      <p className="mb-6 text-lg leading-relaxed" style={{ color: c.inkSoft }}>
        Your conversation partner will see this — not your full name. Your first name, a nickname, whatever feels right.
      </p>
      <label htmlFor="username" className="mb-2 block text-base font-medium" style={{ color: c.ink }}>
        Your name on Aapun
      </label>
      <input id="username" type="text" autoComplete="nickname" value={value}
        onChange={(e) => onChange(e.target.value)} placeholder="e.g. Margaret, Bob, or just M"
        className="mb-5 w-full rounded-xl px-4 py-3.5 text-lg outline-none transition-shadow focus:ring-2"
        style={{ color: c.ink, backgroundColor: "#fff", borderWidth: 1, borderStyle: "solid", borderColor: c.border }} />
      <div className="mb-6">
        <label htmlFor="confirm-adult" className="flex cursor-pointer items-start gap-3 rounded-xl px-1 py-1">
          <input id="confirm-adult" type="checkbox" checked={confirmedAdult}
            onChange={(e) => onConfirmedAdultChange(e.target.checked)} aria-required="true"
            className="mt-1 h-5 w-5 shrink-0 rounded outline-none"
            style={{ accentColor: c.sage, borderColor: c.border }} />
          <span className="text-base font-medium leading-snug" style={{ color: c.ink }}>
            I confirm I am 18 years of age or older
          </span>
        </label>
      </div>
      <aside className="rounded-xl p-4 text-base leading-relaxed"
        style={{ backgroundColor: c.apricotLight, borderWidth: 1, borderStyle: "solid", borderColor: `${c.apricot}33` }} role="note">
        <p className="font-medium" style={{ color: c.ink }}>Aapun is not therapy or medical advice.</p>
        <p className="mt-2" style={{ color: c.inkSoft }}>
          Everyone on Aapun is a peer, not a clinician. This is a space for real conversation and mutual support — not diagnosis, treatment, or crisis care.
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
