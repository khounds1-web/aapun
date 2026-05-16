"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function saveProfile(data: {
  fullName: string;
  description: string;
  experienceCategories: string[];
}) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Not signed in" };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.from("profiles").insert({    user_id: userId,
    full_name: data.fullName,
    description: data.description,
    experience_categories: data.experienceCategories
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
