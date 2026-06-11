"use server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function isAdmin(userId: string | null): boolean {
  return !!userId && userId === process.env.ADMIN_USER_ID;
}

export async function checkAdminAccess(): Promise<boolean> {
  const { userId } = await auth();
  return isAdmin(userId);
}

export async function loadAdminProfiles() {
  const { userId } = await auth();
  if (!isAdmin(userId)) return { data: null, error: "Unauthorized" };

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: data ?? [], error: error?.message ?? null };
}
