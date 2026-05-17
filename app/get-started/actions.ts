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

  // Get user's email from Clerk
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.emailAddresses[0]?.emailAddress || "";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Save the new profile
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

  // Notify admin
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

  // Auto-match with other users who share categories
  try {
    await autoMatch(supabase, newProfile, data.fullName, email, data.experienceCategories);
  } catch (matchError) {
    console.error("Auto-match failed:", matchError);
    // Don't fail the signup if matching fails
  }

  return { success: true };
}

async function autoMatch(
  supabase: ReturnType<typeof createClient>,
  newProfile: { id: string; user_id: string },
  newUserName: string,
  newUserEmail: string,
  categories: string[]
) {
  // Find all other profiles with overlapping categories
  // excluding the current user and already matched profiles
  const { data: potentialMatches } = await supabase
    .from("profiles")
    .select("*")
    .neq("user_id", newProfile.user_id)
    .filter("experience_categories", "ov", `{${categories.join(",")}}`);

  if (!potentialMatches || potentialMatches.length === 0) return;

  // Match with ALL potential matches (multiple matches allowed)
  for (const match of potentialMatches) {
    // Skip if already matched with this person
    const alreadyMatched =
      match.matched_with === newUserName ||
      match.match_id?.includes(newProfile.id);

    if (alreadyMatched) continue;

    const matchId = `${newProfile.id}-${match.id}`;

    // Update new user's profile with this match
    await supabase
      .from("profiles")
      .update({
        match_status: "We found you a match!",
        matched_with: match.full_name,
        match_id: matchId,
      })
      .eq("id", newProfile.id);

    // Update the existing user's profile with new user as match
    await supabase
      .from("profiles")
      .update({
        match_status: "We found you a match!",
        matched_with: newUserName,
        match_id: matchId,
      })
      .eq("id", match.id);

    // Notify both users by email
    try {
      // Notify new user
      if (newUserEmail) {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: newUserEmail,
          subject: "You've been matched on Aapun! 🎉",
          html: `
            <h2>Great news, ${newUserName}!</h2>
            <p>We've matched you with <strong>${match.full_name}</strong> — a parent who shares similar experiences.</p>
            <p>Log in to say hi!</p>
            <br/>
            <p><a href="https://aapun.vercel.app/dashboard">Go to your dashboard</a></p>
            <p style="color:#6d8078;font-size:12px;">Aapun — real conversations with parents who get it.</p>
          `,
        });
      }

      // Notify existing matched user
      if (match.email) {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: match.email,
          subject: "You've been matched on Aapun! 🎉",
          html: `
            <h2>Great news, ${match.full_name}!</h2>
            <p>We've matched you with <strong>${newUserName}</strong> — a parent who shares similar experiences.</p>
            <p>Log in to say hi!</p>
            <br/>
            <p><a href="https://aapun.vercel.app/dashboard">Go to your dashboard</a></p>
            <p style="color:#6d8078;font-size:12px;">Aapun — real conversations with parents who get it.</p>
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
        html: `
          <h2>Great news, ${nameA}!</h2>
          <p>We've matched you with <strong>${nameB}</strong> — a parent who shares similar experiences.</p>
          <p>Log in to say hi!</p>
          <br/>
          <p><a href="https://aapun.vercel.app/dashboard">Go to your dashboard</a></p>
          <p style="color:#6d8078;font-size:12px;">Aapun — real conversations with parents who get it.</p>
        `,
      });
    }

    if (emailB) {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: emailB,
        subject: "You've been matched on Aapun! 🎉",
        html: `
          <h2>Great news, ${nameB}!</h2>
          <p>We've matched you with <strong>${nameA}</strong> — a parent who shares similar experiences.</p>
          <p>Log in to say hi!</p>
          <br/>
          <p><a href="https://aapun.vercel.app/dashboard">Go to your dashboard</a></p>
          <p style="color:#6d8078;font-size:12px;">Aapun — real conversations with parents who get it.</p>
        `,
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
          <p>Log in to read it and reply.</p>
          <br/>
          <p><a href="https://aapun.vercel.app/chat/${matchId}">Open conversation</a></p>
          <p style="color:#6d8078;font-size:12px;">Aapun — real conversations with parents who get it.</p>
        `,
      });
    }
  } catch (err) {
    console.error("Message notification failed:", err);
  }
}