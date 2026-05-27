-- Matching Overhaul — Slice 1
-- Run in Supabase SQL Editor (Dashboard → SQL) or via Supabase CLI.
-- Non-destructive: all changes use IF NOT EXISTS or ADD COLUMN IF NOT EXISTS.

-- ── 1. Profile enrichment ─────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS journey_stage text;

-- username: display name shown to matches (not full_name).
--           NULL for existing profiles — app falls back to full_name.
-- journey_stage: e.g. "Just starting out", "Finding my footing", etc.

-- ── 2. match_requests table ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.match_requests (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  from_profile_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_profile_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_user_id    text        NOT NULL,   -- Clerk user ID
  to_user_id      text        NOT NULL,   -- Clerk user ID
  status          text        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT match_requests_pair_unique UNIQUE (from_profile_id, to_profile_id)
);

CREATE INDEX IF NOT EXISTS match_requests_to_user_id_idx
  ON public.match_requests (to_user_id);

CREATE INDEX IF NOT EXISTS match_requests_status_idx
  ON public.match_requests (status);

-- ── 3. Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read match_requests (filtered by to_user_id in app queries).
-- Writes go through service role only — no INSERT/UPDATE/DELETE policy for anon/authenticated.
DROP POLICY IF EXISTS "Users can view their own match requests" ON public.match_requests;
CREATE POLICY "Users can view their own match requests"
  ON public.match_requests
  FOR SELECT
  USING (true);
