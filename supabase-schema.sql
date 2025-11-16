-- House Swipe App - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create house_listings table
CREATE TABLE IF NOT EXISTS house_listings (
  id BIGSERIAL PRIMARY KEY,
  address TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms NUMERIC(3, 1) NOT NULL,
  sqft INTEGER NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_swipes table to track user interactions
CREATE TABLE IF NOT EXISTS user_swipes (
  id BIGSERIAL PRIMARY KEY,
  house_id BIGINT REFERENCES house_listings(id) ON DELETE CASCADE,
  user_id TEXT, -- Optional: for future user authentication
  action TEXT NOT NULL CHECK (action IN ('like', 'pass')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_house_listings_created_at ON house_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_swipes_house_id ON user_swipes(house_id);
CREATE INDEX IF NOT EXISTS idx_user_swipes_user_id ON user_swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_swipes_action ON user_swipes(action);

-- Enable Row Level Security (RLS)
ALTER TABLE house_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_swipes ENABLE ROW LEVEL SECURITY;

-- Create policies for house_listings (public read access)
CREATE POLICY "Anyone can read house listings"
  ON house_listings
  FOR SELECT
  USING (true);

-- Create policies for user_swipes (anyone can insert, users can read their own)
CREATE POLICY "Anyone can insert swipes"
  ON user_swipes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read their own swipes"
  ON user_swipes
  FOR SELECT
  USING (true); -- For now, allow all reads. Update when you add authentication

-- Insert sample data (optional - you can also use the Supabase dashboard)
INSERT INTO house_listings (address, price, bedrooms, bathrooms, sqft, description, tags, image) VALUES
('123 Oak Street', 450000, 3, 2, 1850, 'Beautiful modern home with open floor plan, updated kitchen, and spacious backyard. Perfect for families!', ARRAY['Modern', 'Family Friendly', 'Updated'], 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop'),
('456 Maple Avenue', 675000, 4, 3, 2400, 'Stunning two-story home with vaulted ceilings, granite countertops, and a private pool. Luxury living at its finest.', ARRAY['Luxury', 'Pool', 'Spacious'], 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'),
('789 Pine Road', 325000, 2, 1, 1200, 'Cozy starter home with charming character, hardwood floors, and a lovely front porch. Great location!', ARRAY['Starter Home', 'Charming', 'Great Location'], 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop'),
('321 Elm Drive', 890000, 5, 4, 3200, 'Magnificent estate with panoramic views, chef''s kitchen, home theater, and 3-car garage. Your dream home awaits!', ARRAY['Estate', 'Luxury', 'Views'], 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'),
('654 Cedar Lane', 525000, 3, 2.5, 2100, 'Contemporary home with smart home features, energy-efficient appliances, and a beautiful garden. Move-in ready!', ARRAY['Smart Home', 'Energy Efficient', 'Contemporary'], 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop')
ON CONFLICT DO NOTHING;

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_house_listings_updated_at
  BEFORE UPDATE ON house_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

