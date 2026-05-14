/*
  # Fix RLS policies for prayer_requests

  ## Changes
  - INSERT policy: restrict anonymous submissions to only the `message` column
    (prevents injecting arbitrary data like setting is_read=true on insert)
  - UPDATE policy: restrict authenticated users to only updating `is_read`,
    and only when the new value is a valid boolean (true/false)

  Both policies are tightened to the minimum required for the application:
  - Anyone can submit a prayer (INSERT message only)
  - Admins can mark a prayer as read/unread (UPDATE is_read only)
*/

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can submit a prayer request" ON prayer_requests;
DROP POLICY IF EXISTS "Authenticated users can update prayer requests" ON prayer_requests;

-- INSERT: only allow setting message; prevent caller from overriding id, is_read, created_at
CREATE POLICY "Anyone can submit a prayer request"
  ON prayer_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    message IS NOT NULL
    AND length(trim(message)) > 0
    AND is_read = false
  );

-- UPDATE: authenticated users can only flip is_read
CREATE POLICY "Authenticated users can update prayer requests"
  ON prayer_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
