"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function saveProfile(data: {
  fullName: string;
  description: string;
  experienceCategories: string[];
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
    await autoMatch(supabase, newProfile, data.fullName, email, data.experienceCategories);
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
  categories: string[]
) {
  // Find all profiles with overlapping categories, different user
  const { data: potentialMatches } = await supabase
    .from("profiles")
    .select("*")
    .neq("user_id", newProfile.user_id)
    .filter("experience_categories", "ov", `{${categories.join(",")}}`);

  if (!potentialMatches || potentialMatches.length === 0) return;

  // Track which user_ids we've already matched with in this run
  const matchedUserIds = new Set<string>();

  for (const match of potentialMatches) {
    // Skip same user (different profiles of same person)
    if (match.user_id === newProfile.user_id) continue;

    // Skip if already matched this user in this run
    if (matchedUserIds.has(match.user_id)) continue;

    // Skip if already matched with this user_id previously
    const { data: existingMatch } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", newProfile.user_id)
      .eq("matched_user_id", match.user_id)
      .limit(1);

    if (existingMatch && existingMatch.length > 0) continue;

    matchedUserIds.add(match.user_id);

    const matchId = `${newProfile.id}-${match.id}`;

    // Update new user's profile
    await supabase
      .from("profiles")
      .update({
        match_status: "We found you a match!",
        matched_with: match.full_name,
        matched_user_id: match.user_id,
        match_id: matchId,
      })
      .eq("id", newProfile.id);

    // Update matched user's profile
    await supabase
      .from("profiles")
      .update({
        match_status: "We found you a match!",
        matched_with: newUserName,
        matched_user_id: newProfile.user_id,
        match_id: matchId,
      })
      .eq("id", match.id);

    // Notify both
    try {
      if (newUserEmail) {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: newUserEmail,
          subject: "You've been matched on Aapun! 🎉",
          html: `
            <h2>Great news, ${newUserName}!</h2>
            <p>We've matched you with <strong>${match.full_name}</strong> — someone who shares similar experiences.</p>
            <p>Log in to say hi!</p>
            <br/>
            <p><a href="https://aapun.vercel.app/dashboard">Go to your dashboard</a></p>
            <p style="color:#6d8078;font-size:12px;">Aapun — real conversations with people who get it.</p>
          `,
        });
      }
      if (match.email) {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: match.email,
          subject: "You've been matched on Aapun! 🎉",
          html: `
            <h2>Great news, ${match.full_name}!</h2>
            <p>We've matched you with <strong>${newUserName}</strong> — someone who shares similar experiences.</p>
            <p>Log in to say hi!</p>
            <br/>
            <p><a href="https://aapun.vercel.app/dashboard">Go to your dashboard</a></p>
            <p style="color:#6d8078;font-size:12px;">Aapun — real conversations with people who get it.</p>
          `,
        });
      }
    } catch (emailError) {
      console.error("Match notification email failed:", emailError);
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