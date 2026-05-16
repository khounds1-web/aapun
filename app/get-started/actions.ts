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

function mapDbError(
  error: { code?: string; message?: string },
  ref: string,
): string {
  if (error.code === "42P01") {
    return "Profiles table not found. Run the Supabase migration first.";
  }
  if (error.code === "42501") {
    return `Could not save your profile (permission denied). Ref: ${ref}`;
  }
  return `Could not save your profile. Ref: ${ref}`;
}

export async function saveProfile(
  input: SaveProfileInput,
): Promise<SaveProfileResult> {
  const ref = crypto.randomUUID();

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

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    if (!supabase) {
      console.error("[saveProfile] Supabase client unavailable (env)", {
        ref,
      });
      return {
        success: false,
        error: `Profile save is unavailable. Ref: ${ref}`,
      };
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("[saveProfile] auth.getUser failed or no user", {
        ref,
        hasUser: Boolean(user),
        authMessage: userError?.message,
        authStatus: userError?.status,
        authName: userError?.name,
        cookieNames: cookieStore.getAll().map((c) => c.name),
      });
      return {
        success: false,
        error: `Session not found. Please try again. Ref: ${ref}`,
      };
    }

    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        full_name: fullName,
        description,
        experience_categories: experienceCategories,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (upsertError) {
      console.error("[saveProfile] profiles upsert failed", {
        ref,
        userId: user.id,
        code: upsertError.code,
        message: upsertError.message,
        details: upsertError.details,
        hint: upsertError.hint,
      });
      return {
        success: false,
        error: mapDbError(upsertError, ref),
      };
    }

    return { success: true };
  } catch (err) {
    console.error("[saveProfile] unexpected error", {
      ref,
      err:
        err instanceof Error
          ? { message: err.message, stack: err.stack, name: err.name }
          : err,
    });
    return {
      success: false,
      error: `Something went wrong. Ref: ${ref}`,
    };
  }
}
