import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { categories } = await req.json();

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `You are a warm, empathetic writer for Aapun — a peer support platform for parents.

Write a short, helpful, and warm paragraph (3-4 sentences) for a parent who is navigating: ${categories.join(", ")}.

The paragraph should:
- Validate their experience
- Share one genuinely useful insight or perspective
- Feel like it was written by a caring friend, not a professional
- NOT give medical or clinical advice
- End with something hopeful

Keep it concise, human, and real.`,
        },
      ],
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ content });
  } catch (err) {
    console.error("Topic insight API error:", err);
    return NextResponse.json({ error: "Failed to generate insight" }, { status: 500 });
  }
}