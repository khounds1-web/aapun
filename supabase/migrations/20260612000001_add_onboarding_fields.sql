-- Add new onboarding fields to profiles
-- emotional_state, here_for, age_range from spec v1.0

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS emotional_state text,
  ADD COLUMN IF NOT EXISTS here_for text,
  ADD COLUMN IF NOT EXISTS age_range text;
