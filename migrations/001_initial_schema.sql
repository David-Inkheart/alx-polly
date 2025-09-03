-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_votes INTEGER DEFAULT 0
);
-- Create poll_options table
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, id)
);
-- Create votes table to track individual votes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent duplicate votes from same user on same poll
  UNIQUE(poll_id, user_id) UNIQUE(poll_id, user_id),
  -- Ensure option belongs to the same poll (composite foreign key)
  FOREIGN KEY (poll_id, option_id) REFERENCES poll_options(poll_id, id) ON DELETE CASCADE
);
-- Create indexes for better performance
CREATE INDEX idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX idx_polls_created_by ON polls(created_by);
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_option_id ON votes(option_id);
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
-- Trigger to automatically update updated_at
CREATE TRIGGER update_polls_updated_at BEFORE
UPDATE ON polls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts() RETURNS TRIGGER AS $$ BEGIN -- Update option vote count
  IF TG_OP = 'INSERT' THEN
UPDATE poll_options
SET votes_count = votes_count + 1
WHERE id = NEW.option_id;
UPDATE polls
SET total_votes = total_votes + 1
WHERE id = NEW.poll_id;
RETURN NEW;
ELSIF TG_OP = 'DELETE' THEN
UPDATE poll_options
SET votes_count = votes_count - 1
WHERE id = OLD.option_id;
UPDATE polls
SET total_votes = total_votes - 1
WHERE id = OLD.poll_id;
RETURN OLD;
END IF;
RETURN NULL;
END;
$$ language 'plpgsql';
-- Trigger to automatically update vote counts
CREATE TRIGGER update_vote_counts_trigger
AFTER
INSERT
  OR DELETE ON votes FOR EACH ROW EXECUTE FUNCTION update_vote_counts();