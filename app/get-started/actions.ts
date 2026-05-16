"use server";
import { auth } from "@clerk/nextjs/server";
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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.from("profiles").insert({
    user_id: userId,
    full_name: data.fullName,
    description: data.description,
    experience_categories: data.experienceCategories,
  });

  if (error) {
    return { error: error.message };
  }

  // Send notification email
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "khoundsumana@gmail.com",
      subject: `New Aapun signup — ${data.fullName}`,
      html: `
        <h2>New user signed up on Aapun</h2>
        <p><strong>Name:</strong> ${data.fullName}</p>
        <p><strong>Topics:</strong> ${data.experienceCategories.join(", ")}</p>
        <p><strong>Story:</strong> ${data.description}</p>
        <br/>
        <p><a href="https://aapun.vercel.app/admin">Go to admin to match them</a></p>
      `,
    });
  } catch (emailError) {
    console.error("Email notification failed:", emailError);
    // Don't fail the signup if email fails
  }

  return { success: true };
}