// app/api/rematch/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all unmatched profiles
  const { data: unmatched, error } = await supabase
    .from("profiles")
    .select("*")
    .is("match_id", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!unmatched || unmatched.length === 0) return NextResponse.json({ message: "No unmatched profiles" });

  const results = [];

  for (const profile of unmatched) {
    // Find potential matches with overlapping categories, different user_id
    const { data: potentialMatches } = await supabase
      .from("profiles")
      .select("*")
      .neq("user_id", profile.user_id)
      .filter("experience_categories", "ov", `{${profile.experience_categories.join(",")}}`);

    if (!potentialMatches || potentialMatches.length === 0) continue;

    const matchedUserIds = new Set<string>();

    for (const match of potentialMatches) {
      if (match.user_id === profile.user_id) continue;
      if (matchedUserIds.has(match.user_id)) continue;

      // Skip if already matched with this user
      const { data: existingMatch } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", profile.user_id)
        .eq("matched_user_id", match.user_id)
        .limit(1);

      if (existingMatch && existingMatch.length > 0) continue;

      matchedUserIds.add(match.user_id);

      const matchId = `${profile.id}-${match.id}`;

      await supabase.from("profiles").update({
        match_status: "We found you a match!",
        matched_with: match.full_name,
        matched_user_id: match.user_id,
        match_id: matchId,
      }).eq("id", profile.id);

      await supabase.from("profiles").update({
        match_status: "We found you a match!",
        matched_with: profile.full_name,
        matched_user_id: profile.user_id,
        match_id: matchId,
      }).eq("id", match.id);

      results.push({ matched: `${profile.full_name} ↔ ${match.full_name}` });

      // Notify both
      try {
        if (profile.email) {
          await resend.emails.send({
            from: "onboarding@resend.dev",
            to: profile.email,
            subject: "You've been matched on Aapun! 🎉",
            html: `<h2>Great news, ${profile.full_name}!</h2><p>We've matched you with <strong>${match.full_name}</strong> — someone who shares similar experiences.</p><p><a href="https://aapun.vercel.app/dashboard">Go to your dashboard</a></p>`,
          });
        }
        if (match.email) {
          await resend.emails.send({
            from: "onboarding@resend.dev",
            to: match.email,
            subject: "You've been matched on Aapun! 🎉",
            html: `<h2>Great news, ${match.full_name}!</h2><p>We've matched you with <strong>${profile.full_name}</strong> — someone who shares similar experiences.</p><p><a href="https://aapun.vercel.app/dashboard">Go to your dashboard</a></p>`,
          });
        }
      } catch (e) {
        console.error("Email failed:", e);
      }
    }
  }

  return NextResponse.json({ success: true, matched: results.length, results });
}