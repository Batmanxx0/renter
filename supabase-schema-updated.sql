-- Updated Schema for Authentication and User Profiles
-- Run this AFTER the initial schema if you already have tables

-- Update user_swipes table to use UUID for user_id (matches Supabase Auth)
ALTER TABLE user_swipes 
  ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Update RLS policies for user_swipes with proper authentication
DROP POLICY IF EXISTS "Users can read their own swipes" ON user_swipes;
DROP POLICY IF EXISTS "Anyone can insert swipes" ON user_swipes;

-- New policies with proper authentication
CREATE POLICY "Users can insert their own swipes"
  ON user_swipes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can read their own swipes"
  ON user_swipes
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Enable real-time for house_listings (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE house_listings;

-- Create index for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_swipes_user_id_auth ON user_swipes(user_id) WHERE user_id IS NOT NULL;

