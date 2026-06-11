import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { auth } from "@clerk/nextjs/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all profiles with no direct match yet
  const { data: unmatched, error } = await supabase
    .from("profiles")
    .select("*")
    .is("match_id", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!unmatched || unmatched.length === 0) return NextResponse.json({ message: "No unmatched profiles" });

  const results = [];

  for (const profile of unmatched) {
    if (!profile.experience_categories?.length) continue;

    // Find other unmatched profiles with overlapping categories
    const { data: potentialMatches } = await supabase
      .from("profiles")
      .select("*")
      .neq("user_id", profile.user_id)
      .is("match_id", null)
      .filter("experience_categories", "ov", `{${profile.experience_categories.map((c: string) => `"${c}"`).join(",")}}`);

    if (!potentialMatches || potentialMatches.length === 0) continue;

    const matchedUserIds = new Set<string>();

    for (const match of potentialMatches) {
      if (match.user_id === profile.user_id) continue;
      if (matchedUserIds.has(match.user_id)) continue;

      // Skip if already directly matched with this user
      const { data: existingDirectMatch } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", profile.user_id)
        .eq("matched_user_id", match.user_id)
        .limit(1);

      if (existingDirectMatch && existingDirectMatch.length > 0) continue;

      // Skip if there's already a pending/accepted request between these profiles (either direction)
      const { data: existingReqA } = await supabase
        .from("match_requests")
        .select("id")
        .eq("from_profile_id", profile.id)
        .eq("to_profile_id", match.id)
        .in("status", ["pending", "accepted"])
        .limit(1);

      if (existingReqA && existingReqA.length > 0) continue;

      const { data: existingReqB } = await supabase
        .from("match_requests")
        .select("id")
        .eq("from_profile_id", match.id)
        .eq("to_profile_id", profile.id)
        .in("status", ["pending", "accepted"])
        .limit(1);

      if (existingReqB && existingReqB.length > 0) continue;

      matchedUserIds.add(match.user_id);

      // Create a pending match request
      const { error: insertError } = await supabase
        .from("match_requests")
        .insert({
          from_profile_id: profile.id,
          to_profile_id: match.id,
          from_user_id: profile.user_id,
          to_user_id: match.user_id,
          status: "pending",
        });

      if (insertError) {
        console.error("Failed to create match request:", insertError);
        continue;
      }

      results.push({ proposed: `${profile.full_name} ↔ ${match.full_name}` });

      // Notify both: "potential match found"
      try {
        if (profile.email) {
          await resend.emails.send({
            from: "onboarding@resend.dev",
            to: profile.email,
            subject: "We found a potential match for you on Aapun 👋",
            html: `<h2>Hi ${profile.username ?? profile.full_name},</h2><p>Someone on Aapun may connect with you. Head to your dashboard to accept or decline.</p><p><a href="https://aapun.vercel.app/dashboard">View on your dashboard →</a></p>`,
          });
        }
        if (match.email) {
          await resend.emails.send({
            from: "onboarding@resend.dev",
            to: match.email,
            subject: "Someone may want to connect with you on Aapun 👋",
            html: `<h2>Hi ${match.username ?? match.full_name},</h2><p>Someone on Aapun may connect with you. Head to your dashboard to accept or decline.</p><p><a href="https://aapun.vercel.app/dashboard">View on your dashboard →</a></p>`,
          });
        }
      } catch (e) {
        console.error("Email failed:", e);
      }
    }
  }

  return NextResponse.json({ success: true, proposed: results.length, results });
}
