/*
  # Create prayer_requests table

  1. New Tables
    - `prayer_requests`
      - `id` (uuid, primary key)
      - `message` (text, the prayer request content)
      - `created_at` (timestamptz, when it was submitted)
      - `is_read` (boolean, whether admin has read it)

  2. Security
    - Enable RLS on `prayer_requests` table
    - Allow anyone (anonymous) to INSERT (submit prayer requests)
    - Only authenticated users (admin) can SELECT (view requests)
    - Only authenticated users can UPDATE (mark as read)
*/

CREATE TABLE IF NOT EXISTS prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false
);

ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a prayer request"
  ON prayer_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view prayer requests"
  ON prayer_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update prayer requests"
  ON prayer_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
