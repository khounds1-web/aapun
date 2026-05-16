"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const ALLOWED_CATEGORIES = new Set([
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
]);

export type SaveProfileInput = {
  fullName: string;
  description: string;
  experienceCategories: string[];
};

export type SaveProfileResult =
  | { success: true }
  | { success: false; error: string };

export async function saveProfile(
  input: SaveProfileInput,
): Promise<SaveProfileResult> {
  const fullName = input.fullName.trim();
  const description = input.description.trim();
  const experienceCategories = input.experienceCategories.filter((c) =>
    ALLOWED_CATEGORIES.has(c),
  );

  if (fullName.length < 2) {
    return { success: false, error: "Please enter your full name." };
  }
  if (description.length < 20) {
    return {
      success: false,
      error: "Please write at least 20 characters about your experience.",
    };
  }
  if (experienceCategories.length === 0) {
    return {
      success: false,
      error: "Please select at least one experience category.",
    };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Session not found. Please try again.",
    };
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      full_name: fullName,
      description,
      experience_categories: experienceCategories,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("saveProfile:", error);
    return {
      success: false,
      error:
        error.code === "42P01"
          ? "Profiles table not found. Run the Supabase migration first."
          : "Could not save your profile. Please try again.",
    };
  }

  return { success: true };
}
