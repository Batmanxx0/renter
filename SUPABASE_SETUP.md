# Supabase Setup Guide

This guide will help you set up Supabase as the backend database for your House Swipe app.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - **Name**: house-swipe (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the closest region to you
5. Click "Create new project"
6. Wait for the project to be set up (takes 1-2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll see:
   - **Project URL**: Copy this
   - **anon/public key**: Copy this

## Step 3: Set Up Environment Variables

1. Open the `.env` file in the root of your project
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=your_actual_project_url_here
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Create the Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## Step 5: Verify the Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see two tables:
   - `house_listings`
   - `user_swipes`
3. Check that `house_listings` has some sample data

## Step 6: Restart Your Dev Server

1. Stop your current dev server (Ctrl+C)
2. Restart it:
   ```bash
   npm run dev
   ```

The app will now fetch data from Supabase instead of the local file!

## Adding More Listings

You can add house listings in two ways:

### Option 1: Using Supabase Dashboard
1. Go to **Table Editor** → `house_listings`
2. Click "Insert row"
3. Fill in the fields and save

### Option 2: Using SQL
```sql
INSERT INTO house_listings (address, price, bedrooms, bathrooms, sqft, description, tags, image)
VALUES (
  'Your Address',
  500000,
  3,
  2,
  1800,
  'Your description here',
  ARRAY['Tag1', 'Tag2'],
  'https://images.unsplash.com/photo-XXXXX?w=800&h=600&fit=crop'
);
```

## Troubleshooting

### App still using local data?
- Check that your `.env` file has the correct values
- Make sure you restarted the dev server after updating `.env`
- Check the browser console for any errors

### Can't connect to Supabase?
- Verify your API keys are correct
- Check that your Supabase project is active
- Make sure RLS policies are set correctly (they should be from the schema)

### No data showing?
- Check that you ran the SQL schema file
- Verify data exists in the `house_listings` table
- Check browser console for fetch errors

## Next Steps

- Add user authentication (Supabase Auth)
- Add filtering/search functionality
- Add user profiles to track favorites
- Add real-time updates when new listings are added

