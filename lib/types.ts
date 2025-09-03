// Type definitions for the Supabase database schema

export interface Poll {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_by?: string; // Add created_by
  is_public: boolean;
  allow_multiple_votes: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  votes_count?: number; // Add votes_count
}

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface PollResult {
  poll_id: string;
  poll_title: string;
  option_id: string;
  option_text: string;
  vote_count: number;
}

export interface PollWithOptions extends Poll {
  options: PollOption[];
}

export interface PollWithOptionsAndResults extends PollWithOptions {
  results: PollResult[];
}

// Type for creating a new poll
export interface CreatePollInput {
  title: string;
  description?: string;
  options: string[];
  is_public?: boolean;
  allow_multiple_votes?: boolean;
  expires_at?: string | null;
}

// Type for voting on a poll
export interface VoteInput {
  poll_id: string;
  option_id: string;
}