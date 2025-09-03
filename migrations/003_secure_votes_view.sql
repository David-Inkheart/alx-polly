-- Migration: Secure votes table and create aggregate results function
-- This migration addresses security concerns by:
-- 1. Making votes table private (restricting direct SELECT access)
-- 2. Creating a SECURITY DEFINER function for aggregate results
-- 3. Granting access to the function while protecting PII
-- Drop the existing insecure policy that allows anyone to view votes
DROP POLICY IF EXISTS "Anyone can view votes" ON votes;
-- Update RLS policies for votes table to be more restrictive
-- Only authenticated users and poll owners can view individual votes
DROP POLICY IF EXISTS "Authenticated users can view own votes" ON votes;
CREATE POLICY "Poll owners can view all votes on their polls" ON votes FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM polls
      WHERE polls.id = votes.poll_id
        AND polls.created_by = auth.uid()
    )
  );
CREATE POLICY "Users can view their own votes" ON votes FOR
SELECT USING (auth.uid() = user_id);
-- Create a SECURITY DEFINER function to provide secure aggregate results
-- This function is owned by postgres and only returns non-identifying aggregates
CREATE OR REPLACE FUNCTION get_poll_results(poll_uuid UUID) RETURNS TABLE (
    poll_id UUID,
    question TEXT,
    option_id UUID,
    option_text TEXT,
    votes_count INTEGER,
    total_votes INTEGER
  ) LANGUAGE sql SECURITY DEFINER
SET search_path = public AS $$
SELECT p.id as poll_id,
  p.question,
  po.id as option_id,
  po.text as option_text,
  po.votes_count,
  p.total_votes
FROM polls p
  JOIN poll_options po ON p.id = po.poll_id
WHERE p.id = poll_uuid
ORDER BY po.votes_count DESC,
  po.created_at ASC;
$$;
-- Set the function owner to postgres (privileged role)
ALTER FUNCTION get_poll_results(UUID) OWNER TO postgres;
-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_poll_results(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_poll_results(UUID) TO authenticated;
-- Alternative: Create a view approach (commented out, using function instead for better security)
-- CREATE VIEW poll_results AS
-- SELECT
--     p.id as poll_id,
--     p.question,
--     po.id as option_id,
--     po.text as option_text,
--     po.votes_count,
--     p.total_votes
-- FROM polls p
-- JOIN poll_options po ON p.id = po.poll_id;
--
-- ALTER VIEW poll_results OWNER TO postgres;
-- GRANT SELECT ON poll_results TO anon;
-- GRANT SELECT ON poll_results TO authenticated;
-- Create a function to get all poll results (for listing all polls with their results)
CREATE OR REPLACE FUNCTION get_all_poll_results() RETURNS TABLE (
    poll_id UUID,
    question TEXT,
    option_id UUID,
    option_text TEXT,
    votes_count INTEGER,
    total_votes INTEGER
  ) LANGUAGE sql SECURITY DEFINER
SET search_path = public AS $$
SELECT p.id as poll_id,
  p.question,
  po.id as option_id,
  po.text as option_text,
  po.votes_count,
  p.total_votes
FROM polls p
  JOIN poll_options po ON p.id = po.poll_id
ORDER BY p.created_at DESC,
  po.votes_count DESC,
  po.created_at ASC;
$$;
-- Set owner and grant permissions for the all results function
ALTER FUNCTION get_all_poll_results() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION get_all_poll_results() TO anon;
GRANT EXECUTE ON FUNCTION get_all_poll_results() TO authenticated;