"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function saveProfile(data: {
  fullName: string;
  username?: string;
  journeyStage?: string;
  description: string;
  experienceCategories: string[];
  emotionalState?: string;
  hereFor?: string;
  ageRange?: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Not signed in" };
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.emailAddresses[0]?.emailAddress || "";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: newProfile, error } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      full_name: data.fullName,
      username: data.username?.trim() || null,
      journey_stage: data.journeyStage?.trim() || null,
      emotional_state: data.emotionalState?.trim() || null,
      here_for: data.hereFor?.trim() || null,
      age_range: data.ageRange?.trim() || null,
      email: email,
      description: data.description,
      experience_categories: data.experienceCategories,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "khoundsumana@gmail.com",
      subject: `New Aapun signup — ${data.fullName}`,
      html: `
        <h2>New user signed up on Aapun</h2>
        <p><strong>Name:</strong> ${data.fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Age range:</strong> ${data.ageRange || "Not provided"}</p>
        <p><strong>Feeling:</strong> ${data.emotionalState || "Not provided"}</p>
        <p><strong>Here for:</strong> ${data.hereFor || "Not provided"}</p>
        <p><strong>Topics:</strong> ${data.experienceCategories.join(", ")}</p>
        <p><strong>Story:</strong> ${data.description || "Not provided"}</p>
        <br/>
        <p><a href="https://aapun.vercel.app/admin">Go to admin</a></p>
      `,
    });
  } catch (emailError) {
    console.error("Admin email failed:", emailError);
  }

  try {
    await autoMatch(supabase, newProfile, data.fullName, email, data.experienceCategories, data.ageRange);
  } catch (matchError) {
    console.error("Auto-match failed:", matchError);
  }

  return { success: true };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function autoMatch(
  supabase: any,
  newProfile: { id: string; user_id: string },
  newUserName: string,
  newUserEmail: string,
  categories: string[],
  ageRange?: string
) {
  // Find unmatched profiles with overlapping categories, different user
  const { data: potentialMatches } = await supabase
    .from("profiles")
    .select("*")
    .neq("user_id", newProfile.user_id)
    .is("match_id", null)
    .filter("experience_categories", "ov", `{${categories.join(",")}}`);

  if (!potentialMatches || potentialMatches.length === 0) return;

  // Score and rank matches:
  // +3 per shared subcategory, +1 for same age range
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scored = potentialMatches.map((m: any) => {
    const sharedCats = categories.filter((c: string) =>
      (m.experience_categories || []).includes(c)
    ).length;
    const sameAge = ageRange && m.age_range === ageRange ? 1 : 0;
    return { ...m, _score: sharedCats * 3 + sameAge };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }).sort((a: any, b: any) => b._score - a._score);

  const rankedMatches = scored;

  // Track which user_ids we've already sent requests to in this run
  const matchedUserIds = new Set<string>();

  for (const match of rankedMatches) {
    // Skip same user (different profiles of same person)
    if (match.user_id === newProfile.user_id) continue;

    // Skip if already processed this user in this run
    if (matchedUserIds.has(match.user_id)) continue;

    // Skip if already directly matched with this user_id previously
    const { data: existingDirectMatch } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", newProfile.user_id)
      .eq("matched_user_id", match.user_id)
      .limit(1);

    if (existingDirectMatch && existingDirectMatch.length > 0) continue;

    // Skip if there's already a pending/accepted match_request between these profiles (either direction)
    const { data: existingReqA } = await supabase
      .from("match_requests")
      .select("id")
      .eq("from_profile_id", newProfile.id)
      .eq("to_profile_id", match.id)
      .in("status", ["pending", "accepted"])
      .limit(1);

    if (existingReqA && existingReqA.length > 0) continue;

    const { data: existingReqB } = await supabase
      .from("match_requests")
      .select("id")
      .eq("from_profile_id", match.id)
      .eq("to_profile_id", newProfile.id)
      .in("status", ["pending", "accepted"])
      .limit(1);

    if (existingReqB && existingReqB.length > 0) continue;

    matchedUserIds.add(match.user_id);

    // Create a pending match request — accept/decline happens on the dashboard
    const { error: insertError } = await supabase
      .from("match_requests")
      .insert({
        from_profile_id: newProfile.id,
        to_profile_id: match.id,
        from_user_id: newProfile.user_id,
        to_user_id: match.user_id,
        status: "pending",
      });

    if (insertError) {
      console.error("Failed to create match request:", insertError);
      continue;
    }

    // Notify both: "potential match found — check your dashboard"
    try {
      if (newUserEmail) {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: newUserEmail,
          subject: "We found a potential match for you on Aapun 👋",
          html: `
            <h2>Hi ${newUserName},</h2>
            <p>We've found someone who may connect with you on Aapun.</p>
            <p>Head to your dashboard to accept or decline — it only takes a second.</p>
            <br/>
            <p><a href="https://aapun.vercel.app/dashboard">View on your dashboard →</a></p>
            <p style="color:#6d8078;font-size:12px;">Aapun — real conversations with people who get it.</p>
          `,
        });
      }
      if (match.email) {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: match.email,
          subject: "Someone may want to connect with you on Aapun 👋",
          html: `
            <h2>Hi ${match.username ?? match.full_name},</h2>
            <p>Someone on Aapun has been matched with you based on shared experiences.</p>
            <p>Head to your dashboard to accept or decline.</p>
            <br/>
            <p><a href="https://aapun.vercel.app/dashboard">View on your dashboard →</a></p>
            <p style="color:#6d8078;font-size:12px;">Aapun — real conversations with people who get it.</p>
          `,
        });
      }
    } catch (emailError) {
      console.error("Match proposal email failed:", emailError);
    }
  }
}

export async function notifyMatch(
  userIdA: string,
  userIdB: string,
  nameA: string,
  nameB: string
) {
  try {
    const client = await clerkClient();
    const [userA, userB] = await Promise.all([
      client.users.getUser(userIdA),
      client.users.getUser(userIdB),
    ]);

    const emailA = userA.emailAddresses[0]?.emailAddress;
    const emailB = userB.emailAddresses[0]?.emailAddress;

    if (emailA) {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: emailA,
        subject: "You've been matched on Aapun! 🎉",
        html: `<h2>Great news, ${nameA}!</h2><p>We've matched you with <strong>${nameB}</strong>.</p><p><a href="https://aapun.vercel.app/dashboard">Go to your dashboard</a></p>`,
      });
    }
    if (emailB) {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: emailB,
        subject: "You've been matched on Aapun! 🎉",
        html: `<h2>Great news, ${nameB}!</h2><p>We've matched you with <strong>${nameA}</strong>.</p><p><a href="https://aapun.vercel.app/dashboard">Go to your dashboard</a></p>`,
      });
    }
  } catch (err) {
    console.error("Match notification failed:", err);
  }
}

export async function notifyMessage(
  recipientUserId: string,
  recipientName: string,
  senderName: string,
  matchId: string
) {
  try {
    const client = await clerkClient();
    const recipient = await client.users.getUser(recipientUserId);
    const email = recipient.emailAddresses[0]?.emailAddress;

    if (email) {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: `${senderName} sent you a message on Aapun`,
        html: `
          <h2>You have a new message, ${recipientName}!</h2>
          <p><strong>${senderName}</strong> sent you a message on Aapun.</p>
          <p><a href="https://aapun.vercel.app/chat/${matchId}">Open conversation</a></p>
          <p style="color:#6d8078;font-size:12px;">Aapun — real conversations with people who get it.</p>
        `,
      });
    }
  } catch (err) {
    console.error("Message notification failed:", err);
  }
}