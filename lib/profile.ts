export type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  username: string | null;        // display name shown to matches
  journey_stage: string | null;   // e.g. "Just starting out"
  description: string;
  experience_categories: string[];
  created_at: string;
  updated_at: string;
};
