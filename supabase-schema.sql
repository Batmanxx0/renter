-- Renter production schema (new Supabase projects)
--
-- This is the single canonical schema for new environments. Run it in the
-- Supabase SQL Editor only after reviewing it for your project. For an
-- existing database, use a reviewed migration rather than re-running this file.

CREATE TABLE IF NOT EXISTS public.house_listings (
  id BIGSERIAL PRIMARY KEY,
  address TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
  bathrooms NUMERIC(3, 1) NOT NULL CHECK (bathrooms >= 0),
  sqft INTEGER NOT NULL CHECK (sqft >= 0),
  description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.user_swipes (
  id BIGSERIAL PRIMARY KEY,
  house_id BIGINT NOT NULL REFERENCES public.house_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT user_swipes_user_id_house_id_key UNIQUE (user_id, house_id)
);

CREATE INDEX IF NOT EXISTS idx_house_listings_created_at
  ON public.house_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_swipes_user_id_action
  ON public.user_swipes(user_id, action);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_house_listings_updated_at ON public.house_listings;
CREATE TRIGGER update_house_listings_updated_at
  BEFORE UPDATE ON public.house_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_swipes_updated_at ON public.user_swipes;
CREATE TRIGGER update_user_swipes_updated_at
  BEFORE UPDATE ON public.user_swipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.house_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_swipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read house listings" ON public.house_listings;
DROP POLICY IF EXISTS "Published listings are readable by everyone" ON public.house_listings;
CREATE POLICY "Published listings are readable by everyone"
  ON public.house_listings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert swipes" ON public.user_swipes;
DROP POLICY IF EXISTS "Users can read their own swipes" ON public.user_swipes;
DROP POLICY IF EXISTS "Users can insert their own swipes" ON public.user_swipes;
DROP POLICY IF EXISTS "Users can manage only their swipes" ON public.user_swipes;
CREATE POLICY "Users can manage only their swipes"
  ON public.user_swipes
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.house_listings;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;
