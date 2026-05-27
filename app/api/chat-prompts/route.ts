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
    const { categoriesA, categoriesB, descriptionA, descriptionB } = await req.json();

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are helping two parents start a conversation on Aapun, a peer support platform.

Parent 1 is navigating: ${categoriesA.join(", ")}
${descriptionA ? `Their story: ${descriptionA}` : ""}

Parent 2 is navigating: ${categoriesB.join(", ")}
${descriptionB ? `Their story: ${descriptionB}` : ""}

Generate exactly 3 warm, conversational ice-breaker prompts that would help them start talking. 

Rules:
- Short (under 12 words each)
- Feel like something a friend would ask, not a therapist
- Specific to their shared experiences
- Not too heavy or clinical
- Return ONLY a JSON array of 3 strings, nothing else

Example format: ["What's been your biggest surprise so far?", "How are you really doing these days?", "What do you wish someone had told you earlier?"]`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    let prompts: string[] = [];
    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      if (Array.isArray(parsed) && parsed.every((p) => typeof p === "string")) {
        prompts = parsed;
      }
    } catch {
      // malformed LLM output — return empty, UI handles gracefully
    }
    return NextResponse.json({ prompts });
  } catch (err) {
    console.error("Chat prompts API error:", err);
    return NextResponse.json({ prompts: [] });
  }
}