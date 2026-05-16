export const TEMP_GET_STARTED_PROFILE_KEY = "aapun:get-started:draft-v1";

export type TempGetStartedProfile = {
  fullName: string;
  description: string;
  experienceCategories: string[];
  savedAt: string;
};

export function saveTempGetStartedProfile(
  data: Omit<TempGetStartedProfile, "savedAt">,
): void {
  const payload: TempGetStartedProfile = {
    ...data,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(TEMP_GET_STARTED_PROFILE_KEY, JSON.stringify(payload));
}

function isTempProfile(value: unknown): value is TempGetStartedProfile {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.fullName === "string" &&
    typeof v.description === "string" &&
    Array.isArray(v.experienceCategories) &&
    v.experienceCategories.every((x) => typeof x === "string") &&
    typeof v.savedAt === "string"
  );
}

export function readTempGetStartedProfile(): TempGetStartedProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TEMP_GET_STARTED_PROFILE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isTempProfile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
