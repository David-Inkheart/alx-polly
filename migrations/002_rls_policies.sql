-- Enable Row Level Security
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls FORCE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options FORCE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes FORCE ROW LEVEL SECURITY;
-- Polls policies
-- Anyone can view polls
CREATE POLICY "Anyone can view polls" ON polls FOR
SELECT USING (true);
-- Authenticated users can create polls
CREATE POLICY "Authenticated users can create polls" ON polls FOR
INSERT WITH CHECK (auth.uid() = created_by);
-- Users can update their own polls
CREATE POLICY "Users can update own polls" ON polls FOR
UPDATE USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
-- Users can delete their own polls
CREATE POLICY "Users can delete own polls" ON polls FOR DELETE USING (auth.uid() = created_by);
-- Poll options policies
-- Anyone can view poll options
CREATE POLICY "Anyone can view poll options" ON poll_options FOR
SELECT USING (true);
-- Only poll creators can insert options
CREATE POLICY "Poll creators can insert options" ON poll_options FOR
INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM polls
      WHERE polls.id = poll_options.poll_id
        AND polls.created_by = auth.uid() CREATE POLICY "Poll creators can update options" ON poll_options FOR
      UPDATE USING (
          EXISTS (
            SELECT 1
            FROM polls
            WHERE polls.id = poll_options.poll_id
              AND polls.created_by = auth.uid()
          )
        ) WITH CHECK (
          EXISTS (
            SELECT 1
            FROM polls
            WHERE polls.id = poll_options.poll_id
              AND polls.created_by = auth.uid()
          )
        );
AND polls.created_by = auth.uid()
)
);
-- Only poll creators can delete options
CREATE POLICY "Poll creators can delete options" ON poll_options FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM polls
    WHERE polls.id = poll_options.poll_id
      AND polls.created_by = auth.uid()
  )
);
-- Votes policies
-- Anyone can view votes (for displaying results)
CREATE POLICY "Anyone can view votes" ON votes FOR
SELECT USING (true);
-- Authenticated users can vote (one vote per poll per user)
CREATE POLICY "Authenticated users can vote" ON votes FOR
INSERT WITH CHECK (
    user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1
      FROM votes v
      WHERE v.poll_id = votes.poll_id
        AND v.user_id = auth.uid()
    )
  );
-- Users can only delete their own votes
CREATE POLICY "Users can delete own votes" ON votes FOR DELETE USING (auth.uid() = user_id);