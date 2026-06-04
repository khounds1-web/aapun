// app/api/seed-resources/route.ts
// Seeds the Supabase resources table from the curated static RESOURCE_MAP.
// Safe to re-run: clears old records and re-inserts fresh ones.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { RESOURCE_MAP, DEFAULT_RESOURCES } from "@/app/lib/resources";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ── 1. Clear all existing resources ───────────────────────────────────────
  const { error: deleteError } = await supabase
    .from("resources")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all rows

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // ── 2. Build rows from curated RESOURCE_MAP ────────────────────────────────
  const rows: {
    category: string;
    type: string;
    title: string;
    subtitle: string;
    link: string;
    cover_bg: string;
    cover_text: string;
  }[] = [];

  for (const [category, resources] of Object.entries(RESOURCE_MAP)) {
    for (const r of resources) {
      rows.push({
        category,
        type: r.type,
        title: r.title,
        subtitle: r.subtitle,
        link: r.link,
        cover_bg: r.coverBg,
        cover_text: r.coverText,
      });
    }
  }

  // ── 3. Also seed DEFAULT_RESOURCES under a special "default" category ──────
  for (const r of DEFAULT_RESOURCES) {
    rows.push({
      category: "default",
      type: r.type,
      title: r.title,
      subtitle: r.subtitle,
      link: r.link,
      cover_bg: r.coverBg,
      cover_text: r.coverText,
    });
  }

  // ── 4. Insert in batches of 50 ─────────────────────────────────────────────
  const BATCH = 50;
  const results = [];

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("resources").insert(batch);
    if (error) {
      results.push({ batch: i / BATCH, error: error.message });
    } else {
      results.push({ batch: i / BATCH, inserted: batch.length });
    }
  }

  return NextResponse.json({
    success: true,
    total: rows.length,
    categories: Object.keys(RESOURCE_MAP).length,
    results,
  });
}
