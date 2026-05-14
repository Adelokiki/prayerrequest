/*
  # Fix INSERT RLS policy for prayer_requests

  ## Problem
  The previous migration added `AND is_read = false` to the INSERT WITH CHECK clause.
  However, RLS WITH CHECK runs before column defaults are applied, so `is_read` is NULL
  at check time, causing all inserts to fail with a policy violation.

  ## Fix
  Replace the strict `is_read = false` check with `is_read IS NOT TRUE`, which allows
  both NULL (default not yet applied) and false, while still blocking anyone who
  explicitly tries to insert with is_read = true.
*/

DROP POLICY IF EXISTS "Anyone can submit a prayer request" ON prayer_requests;

CREATE POLICY "Anyone can submit a prayer request"
  ON prayer_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    message IS NOT NULL
    AND length(trim(message)) > 0
    AND is_read IS NOT TRUE
  );
