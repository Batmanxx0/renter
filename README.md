# House Swipe 🏠

A Tinder-like house listing app where users can swipe through properties to find their dream home.

## Features

- ✨ Swipe interface similar to Tinder
- 📱 iOS-friendly touch gestures
- 🎨 Beautiful, modern UI
- 💻 Works on desktop and mobile
- 🚀 Fast development with Vite
- 🗄️ Supabase backend for real-time data
- 💾 Automatic swipe tracking

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

You can also use Live Server in VS Code - just open `index.html` and use the Live Server extension.

### Build for Production

```bash
npm run build
```

## How to Use

1. Swipe right (or drag right) to like a house
2. Swipe left (or drag left) to pass on a house
3. View your stats at the bottom
4. When you've seen all listings, you can start over

## iOS Deployment

To deploy this as a native iOS app:

1. Install Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   ```

2. Add iOS platform:
   ```bash
   npm install @capacitor/ios
   npx cap add ios
   ```

3. Build and sync:
   ```bash
   npm run build
   npx cap sync
   npx cap open ios
   ```

## Supabase Setup

This app uses Supabase as the backend database. See `SUPABASE_SETUP.md` for detailed setup instructions.

**Quick Setup:**
1. Your Supabase credentials are already configured in `.env`
2. Run the SQL schema in `supabase-schema.sql` in your Supabase SQL Editor
3. Restart your dev server: `npm run dev`

The app will automatically:
- Fetch house listings from Supabase
- Save swipe actions (likes/passes) to the database
- Fall back to local data if Supabase is not configured

## Customization

### Adding House Listings

**Option 1: Via Supabase Dashboard**
1. Go to your Supabase project → Table Editor
2. Select `house_listings` table
3. Click "Insert row" and fill in the details

**Option 2: Via SQL**
```sql
INSERT INTO house_listings (address, price, bedrooms, bathrooms, sqft, description, tags, image)
VALUES ('Your Address', 500000, 3, 2, 1800, 'Description', ARRAY['Tag1', 'Tag2'], 'image-url');
```

**Option 3: Local File (Fallback)**
Edit `src/data/houseListings.js` to add listings (used when Supabase is not configured)

## Deployment

This app can be deployed to various free hosting platforms. See deployment options below.

### Environment Variables

Before deploying, make sure to set these environment variables in your hosting platform:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

These should be set in your hosting platform's environment variables section (NOT in `.env` file for production).

