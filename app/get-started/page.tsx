"use client";

import { saveProfile } from "@/app/get-started/actions";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

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

const EXPERIENCE_CATEGORIES = [
  "Grief & loss",
  "Illness",
  "Divorce & separation",
  "Career transition",
  "Parenting",
  "Addiction & recovery",
  "Trauma",
  "Chronic pain",
  "Disability",
  "Caregiving",
  "Immigration & relocation",
  "Identity & life change",
  "Loneliness & isolation",
  "Other",
] as const;

const TOTAL_STEPS = 3;
const DESCRIPTION_MAX = 500;

type Step = 1 | 2 | 3;

export default function GetStartedPage() {
  const [step, setStep] = useState<Step>(1);
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [description, setDescription] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmedAdult, setConfirmedAdult] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const progress = completed ? 100 : (step / TOTAL_STEPS) * 100;

  function toggleCategory(category: string) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  function goNext() {
    if (step < TOTAL_STEPS) setStep((step + 1) as Step);
  }

  function goBack() {
    if (step > 1) setStep((step - 1) as Step);
  }

  async function handleSubmit() {
    if (!canContinue || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const { error: authError } = await supabase.auth.signInAnonymously();
        if (authError) {
          setSubmitError(
            authError.message.includes("anonymous")
              ? "Anonymous sign-in is disabled. Enable it in Supabase → Authentication → Providers."
              : "Could not start your session. Please try again.",
          );
          return;
        }
      }

      const result = await saveProfile({
        fullName: fullName.trim(),
        description: description.trim(),
        experienceCategories: Array.from(categories),
      });

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      setCompleted(true);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canContinue =
    (step === 1 && categories.size > 0) ||
    (step === 2 && description.trim().length >= 20) ||
    (step === 3 &&
      fullName.trim().length >= 2 &&
      confirmedAdult);

  return (
    <div
      className="relative min-h-full overflow-hidden font-sans"
      style={{ backgroundColor: c.bg, color: c.inkSoft }}
    >
      <AmbientBackground />

      <main className="relative mx-auto flex min-h-full max-w-xl flex-col px-6 py-10 sm:px-8 sm:py-14">
        <header className="mb-8">
          <a
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: c.inkMuted }}
          >
            <span aria-hidden>←</span> Back to home
          </a>

          <div className="mb-6 flex items-center gap-3">
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

          {!completed && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: c.inkMuted }}>
                  Step {step} of {TOTAL_STEPS}
                </span>
                <span className="font-medium" style={{ color: c.sage }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full"
                style={{ backgroundColor: c.sageLight }}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Profile setup progress"
              >
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: c.sage,
                  }}
                />
              </div>
            </div>
          )}
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
          {completed ? (
            <CompletionView fullName={fullName.trim()} />
          ) : (
            <>
              {step === 1 && (
                <StepCategories
                  selected={categories}
                  onToggle={toggleCategory}
                />
              )}
              {step === 2 && (
                <StepDescription
                  value={description}
                  onChange={setDescription}
                  maxLength={DESCRIPTION_MAX}
                />
              )}
              {step === 3 && (
                <StepName
                  value={fullName}
                  onChange={setFullName}
                  confirmedAdult={confirmedAdult}
                  onConfirmedAdultChange={setConfirmedAdult}
                />
              )}

              {submitError && (
                <p
                  className="mt-6 rounded-xl px-4 py-3 text-sm leading-relaxed"
                  style={{
                    backgroundColor: c.apricotLight,
                    color: c.ink,
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: `${c.apricot}44`,
                  }}
                  role="alert"
                >
                  {submitError}
                </p>
              )}

              <nav className="mt-10 flex items-center justify-between gap-4 border-t pt-8" style={{ borderColor: c.border }}>
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition-colors hover:bg-black/5"
                    style={{ color: c.inkSoft }}
                  >
                    Back
                  </button>
                ) : (
                  <span />
                )}

                {step < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canContinue}
                    className="inline-flex h-11 items-center justify-center rounded-full px-8 text-sm font-medium text-white shadow-md transition-colors enabled:hover:bg-[#2f584b] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ backgroundColor: c.sage }}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canContinue || isSubmitting}
                    className="inline-flex h-11 min-w-[9.5rem] items-center justify-center rounded-full px-8 text-sm font-medium text-white shadow-md transition-colors enabled:hover:bg-[#2f584b] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ backgroundColor: c.sage }}
                  >
                    {isSubmitting ? "Saving…" : "Create profile"}
                  </button>
                )}
              </nav>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function StepCategories({
  selected,
  onToggle,
}: {
  selected: Set<string>;
  onToggle: (category: string) => void;
}) {
  return (
    <div>
      <h1
        className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl"
        style={{ color: c.ink }}
      >
        What have you lived through?
      </h1>
      <p className="mb-8 leading-relaxed" style={{ color: c.inkSoft }}>
        Choose every area that fits your story. This helps us connect you with
        peers who share something real — no labels required.
      </p>

      <fieldset>
        <legend className="sr-only">Experience categories</legend>
        <div className="flex flex-wrap gap-2.5">
          {EXPERIENCE_CATEGORIES.map((category) => {
            const isSelected = selected.has(category);
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggle(category)}
                className="rounded-full px-4 py-2.5 text-sm font-medium transition-all"
                style={
                  isSelected
                    ? {
                        backgroundColor: c.sage,
                        color: "#fff",
                        boxShadow: "0 1px 3px rgba(58, 107, 92, 0.25)",
                      }
                    : {
                        backgroundColor: "#fff",
                        color: c.inkSoft,
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: c.border,
                      }
                }
              >
                {category}
              </button>
            );
          })}
        </div>
      </fieldset>

      {selected.size > 0 && (
        <p className="mt-6 text-sm" style={{ color: c.sage }}>
          {selected.size} selected — you can always update this later.
        </p>
      )}
    </div>
  );
}

function StepDescription({
  value,
  onChange,
  maxLength,
}: {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
}) {
  const remaining = maxLength - value.length;

  return (
    <div>
      <h1
        className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl"
        style={{ color: c.ink }}
      >
        Tell us your story, in your words
      </h1>
      <p className="mb-8 leading-relaxed" style={{ color: c.inkSoft }}>
        A few sentences about what you&apos;ve been through and what you might
        want to talk about with a peer. There&apos;s no right way to write this.
      </p>

      <label htmlFor="experience-description" className="sr-only">
        Personal experience description
      </label>
      <textarea
        id="experience-description"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        rows={6}
        placeholder="For example: I lost my mother two years ago and I'm still learning how to live with the grief while raising young kids..."
        className="w-full resize-y rounded-xl border border-[#d8e4de] bg-white px-4 py-3 text-base leading-relaxed text-[#1c2824] outline-none transition-shadow focus:ring-2 focus:ring-[#3a6b5c]/30"
      />
      <div className="mt-2 flex items-center justify-between text-sm">
        <p style={{ color: value.trim().length < 20 ? c.apricot : c.inkMuted }}>
          {value.trim().length < 20
            ? "At least 20 characters to continue"
            : "Thank you for sharing"}
        </p>
        <p style={{ color: c.inkMuted }}>{remaining} left</p>
      </div>
    </div>
  );
}

function StepName({
  value,
  onChange,
  confirmedAdult,
  onConfirmedAdultChange,
}: {
  value: string;
  onChange: (value: string) => void;
  confirmedAdult: boolean;
  onConfirmedAdultChange: (value: boolean) => void;
}) {
  return (
    <div>
      <h1
        className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl"
        style={{ color: c.ink }}
      >
        What should we call you?
      </h1>
      <p className="mb-6 leading-relaxed" style={{ color: c.inkSoft }}>
        Aapun is built on real people and real names. Please use the name
        you&apos;d like peers to know you by — first and last.
      </p>

      <label
        htmlFor="full-name"
        className="mb-2 block text-sm font-medium"
        style={{ color: c.ink }}
      >
        Full name
      </label>
      <input
        id="full-name"
        type="text"
        autoComplete="name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your full name"
        className="mb-4 w-full rounded-xl px-4 py-3 text-base outline-none transition-shadow focus:ring-2 focus:ring-[#3a6b5c]/30"
        style={{
          color: c.ink,
          backgroundColor: "#fff",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: c.border,
        }}
      />

      <div className="mb-6">
        <label
          htmlFor="confirm-adult"
          className="flex cursor-pointer items-start gap-3 rounded-xl px-1 py-1"
        >
          <input
            id="confirm-adult"
            type="checkbox"
            checked={confirmedAdult}
            onChange={(e) => onConfirmedAdultChange(e.target.checked)}
            aria-required="true"
            className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 rounded border border-[#d8e4de] outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[#3a6b5c]/35"
            style={{
              accentColor: c.sage,
            }}
          />
          <span
            className="text-sm font-medium leading-snug"
            style={{ color: c.ink }}
          >
            I confirm I am 18 years of age or older
          </span>
        </label>
      </div>

      <aside
        className="rounded-xl p-4 text-sm leading-relaxed"
        style={{
          backgroundColor: c.apricotLight,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: `${c.apricot}33`,
        }}
        role="note"
      >
        <p className="font-medium" style={{ color: c.ink }}>
          Aapun is not therapy or mental health treatment.
        </p>
        <p className="mt-2" style={{ color: c.inkSoft }}>
          By creating a profile, you understand that peers on Aapun are not
          clinicians, and this platform is for mutual support — not diagnosis,
          treatment, or crisis care.
        </p>
      </aside>
    </div>
  );
}

function CompletionView({ fullName }: { fullName: string }) {
  const firstName = fullName.split(/\s+/)[0] || fullName;

  return (
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
      <p className="mb-8 leading-relaxed" style={{ color: c.inkSoft }}>
        Your profile is ready. When matching and scheduling are live,
        you&apos;ll hear from us. For now, thank you for showing up as yourself.
      </p>
      <a
        href="/"
        className="inline-flex h-11 items-center justify-center rounded-full px-8 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#2f584b]"
        style={{ backgroundColor: c.sage }}
      >
        Back to home
      </a>
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
