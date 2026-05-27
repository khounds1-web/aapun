import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { messages, profile } = await req.json();

    const systemPrompt = `You are a warm, empathetic listener on Aapun — a peer support platform for parents. You are NOT a therapist or medical professional.

The person you're talking to:
- Name: ${profile.full_name}
- Parenting experiences: ${profile.experience_categories.join(", ")}
${profile.description ? `- Their story: ${profile.description}` : ""}

Your role:
- Listen with genuine warmth and empathy
- Ask thoughtful follow-up questions
- Validate their feelings without giving medical or clinical advice
- Keep responses concise — 2-4 sentences max
- Never diagnose, prescribe, or give professional advice
- If they seem in crisis, gently suggest professional support
- Remind them occasionally that a real parent match is being found for them
- Be human, warm, and real — not robotic or overly formal`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ content });
  } catch (err) {
    console.error("AI chat API error:", err);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}