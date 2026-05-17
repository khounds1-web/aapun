// app/api/cron-resources/route.ts
// Daily cron job — Claude finds 3 new resources per category

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const CATEGORIES = [
  "Postpartum depression/anxiety",
  "NICU parents",
  "First-time parents",
  "Balancing careers and parenting",
  "Single parents",
  "IVF",
  "Pregnancy loss & miscarriage",
  "Parents of neurodivergent children",
  "Parents of autistic children",
  "Immigrant parents",
  "Breastfeeding/Pumping/Formula feeding",
  "Planning to conceive soon",
  "Co-parenting after divorce",
  "Stay-at-home moms/dads",
  "Parenting with a partner who doesn't share the load",
  "Hiring a nanny/caregiver",
  "Other",
];

const COVER_COLORS = ["#e8e2d4", "#ddd4e8", "#d4e4d8", "#d4dce8", "#e8d4d4", "#d4e8e4"];

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const results = [];

  for (const category of CATEGORIES) {
    try {
      // Get existing titles to avoid duplicates
      const { data: existing } = await supabase
        .from("resources")
        .select("title")
        .eq("category", category);

      const existingTitles = (existing || []).map((r: { title: string }) => r.title);

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        messages: [{
          role: "user",
          content: `Find 3 high-quality podcasts or books for parents in this situation: "${category}".

Rules:
- Real, existing resources with working websites
- Mix of podcasts and books (at least 1 of each)
- Free to access or widely available
- Do NOT include any of these (already in our library): ${existingTitles.join(", ")}
- Link to podcast website (not Spotify) or Goodreads for books

Return ONLY a JSON array, no other text:
[
  {
    "type": "listen" or "read",
    "title": "Title",
    "subtitle": "Author or show description — one line",
    "link": "https://...",
    "cover_text": "Short\n2-3 word\ncover text"
  }
]`
        }]
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "[]";
      const newResources = JSON.parse(text.replace(/```json|```/g, "").trim());

      const toInsert = newResources.map((r: any, i: number) => ({
        category,
        type: r.type,
        title: r.title,
        subtitle: r.subtitle,
        link: r.link,
        cover_bg: COVER_COLORS[i % COVER_COLORS.length],
        cover_text: r.cover_text,
      }));

      const { error } = await supabase.from("resources").insert(toInsert);
      if (error) {
        results.push({ category, error: error.message });
      } else {
        results.push({ category, added: toInsert.length });
      }
    } catch (err) {
      results.push({ category, error: String(err) });
    }
  }

  return NextResponse.json({ success: true, results });
}