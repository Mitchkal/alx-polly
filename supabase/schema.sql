-- Create schema for polls, options, and votes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT true,
  allow_multiple_votes BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create poll options table
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, text)
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure a user can only vote once per poll option if not anonymous
  UNIQUE(poll_id, option_id, user_id),
  -- At least one of user_id or ip_address must be set
  CONSTRAINT votes_user_or_ip_check CHECK (
    (user_id IS NOT NULL) OR (ip_address IS NOT NULL)
  )
);

-- Create view for poll results
CREATE OR REPLACE VIEW poll_results AS
SELECT
  p.id AS poll_id,
  p.title AS poll_title,
  po.id AS option_id,
  po.text AS option_text,
  COUNT(v.id) AS vote_count
FROM polls p
JOIN poll_options po ON p.id = po.poll_id
LEFT JOIN votes v ON po.id = v.option_id
GROUP BY p.id, p.title, po.id, po.text
ORDER BY p.id, vote_count DESC;

-- Create function to check if a user has already voted in a poll
CREATE OR REPLACE FUNCTION has_user_voted(poll_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  vote_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM votes
    WHERE poll_id = poll_uuid AND user_id = user_uuid
  ) INTO vote_exists;
  
  RETURN vote_exists;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Polls policies
-- Users can view public polls
CREATE POLICY "Public polls are viewable by everyone" 
  ON polls FOR SELECT 
  USING (is_public = true);

-- Users can view their own polls (even if private)
CREATE POLICY "Users can view their own polls" 
  ON polls FOR SELECT 
  USING (user_id = auth.uid());

-- Users can insert their own polls
CREATE POLICY "Users can insert their own polls" 
  ON polls FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Users can update their own polls
CREATE POLICY "Users can update their own polls" 
  ON polls FOR UPDATE 
  USING (user_id = auth.uid());

-- Users can delete their own polls
CREATE POLICY "Users can delete their own polls" 
  ON polls FOR DELETE 
  USING (user_id = auth.uid());

-- Poll options policies
-- Anyone can view options for public polls
CREATE POLICY "Anyone can view options for public polls" 
  ON poll_options FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id AND polls.is_public = true
    )
  );

-- Users can view options for their own polls
CREATE POLICY "Users can view options for their own polls" 
  ON poll_options FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id AND polls.user_id = auth.uid()
    )
  );

-- Users can insert options for their own polls
CREATE POLICY "Users can insert options for their own polls" 
  ON poll_options FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id AND polls.user_id = auth.uid()
    )
  );

-- Users can update options for their own polls
CREATE POLICY "Users can update options for their own polls" 
  ON poll_options FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id AND polls.user_id = auth.uid()
    )
  );

-- Users can delete options for their own polls
CREATE POLICY "Users can delete options for their own polls" 
  ON poll_options FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id AND polls.user_id = auth.uid()
    )
  );

-- Votes policies
-- Anyone can view votes for public polls
CREATE POLICY "Anyone can view votes for public polls" 
  ON votes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = votes.poll_id AND polls.is_public = true
    )
  );

-- Users can view votes for their own polls
CREATE POLICY "Users can view votes for their own polls" 
  ON votes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = votes.poll_id AND polls.user_id = auth.uid()
    )
  );

-- Users can view their own votes
CREATE POLICY "Users can view their own votes" 
  ON votes FOR SELECT 
  USING (user_id = auth.uid());

-- Anyone can insert votes for public polls
CREATE POLICY "Anyone can insert votes for public polls" 
  ON votes FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = votes.poll_id AND polls.is_public = true
    )
  );

-- Users can delete their own votes
CREATE POLICY "Users can delete their own votes" 
  ON votes FOR DELETE 
  USING (user_id = auth.uid());