export type MatchRequestStatus = "pending" | "accepted" | "declined";

export type MatchRequest = {
  id: string;
  from_profile_id: string;
  to_profile_id: string;
  from_user_id: string;
  to_user_id: string;
  status: MatchRequestStatus;
  created_at: string;
  updated_at: string;
  // Joined fields (from profiles join)
  from_profile?: {
    username: string | null;
    full_name: string;
    description: string;
    experience_categories: string[];
  };
};
