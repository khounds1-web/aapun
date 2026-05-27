import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { notifyMatch } from "@/app/get-started/actions";

type RouteContext = { params: { id: string } };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let action: string;
  try {
    const body = await request.json();
    action = body.action;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ error: "action must be accept or decline" }, { status: 400 });
  }

  const { id } = context.params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch the match request with both profiles
  const { data: matchReq, error: fetchError } = await supabase
    .from("match_requests")
    .select(
      `*, from_profile:profiles!from_profile_id(*), to_profile:profiles!to_profile_id(*)`
    )
    .eq("id", id)
    .single();

  if (fetchError || !matchReq) {
    return NextResponse.json({ error: "Match request not found" }, { status: 404 });
  }

  // Only the recipient (to_user_id) can accept or decline
  if (matchReq.to_user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Can only action a pending request
  if (matchReq.status !== "pending") {
    return NextResponse.json({ error: "Request already actioned" }, { status: 409 });
  }

  // ── Decline path ──────────────────────────────────────────────────────────
  if (action === "decline") {
    await supabase
      .from("match_requests")
      .update({ status: "declined", updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  }

  // ── Accept path ───────────────────────────────────────────────────────────
  const fromProfile = matchReq.from_profile;
  const toProfile = matchReq.to_profile;

  // match_id preserves the existing format: fromProfileId-toProfileId
  const matchId = `${matchReq.from_profile_id}-${matchReq.to_profile_id}`;

  const fromDisplayName =
    (fromProfile.username as string | null) ?? (fromProfile.full_name as string);
  const toDisplayName =
    (toProfile.username as string | null) ?? (toProfile.full_name as string);

  // Mark request as accepted
  await supabase
    .from("match_requests")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", id);

  // Write match to both profiles (only if still unmatched — prevents race conditions)
  await supabase
    .from("profiles")
    .update({
      match_status: "We found you a match!",
      matched_with: toDisplayName,
      matched_user_id: matchReq.to_user_id,
      match_id: matchId,
    })
    .eq("id", matchReq.from_profile_id)
    .is("match_id", null);

  await supabase
    .from("profiles")
    .update({
      match_status: "We found you a match!",
      matched_with: fromDisplayName,
      matched_user_id: matchReq.from_user_id,
      match_id: matchId,
    })
    .eq("id", matchReq.to_profile_id)
    .is("match_id", null);

  // Notify both users they are now connected
  try {
    await notifyMatch(
      matchReq.from_user_id,
      matchReq.to_user_id,
      fromDisplayName,
      toDisplayName
    );
  } catch (e) {
    console.error("Match notification failed:", e);
  }

  return NextResponse.json({ matchId });
}
