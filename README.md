# Finarian - Financial Asset Manager

A clean, responsive web application to visualize and manage your financial assets. Built with React, Vite, TailwindCSS, and Supabase.

## Features

- 🔐 **User Authentication** - Sign up and sign in with email/password
- 💰 **Asset Management** - Add, update, and delete your financial assets
- 📊 **Portfolio Dashboard** - See total invested, current value, and gains/losses
- 📈 **Quantity Management** - Track quantities and prices for each asset
- 💵 **Gain/Loss Tracking** - View unrealized gains and losses in real-time
- ⚡ **Realtime Updates** - Changes sync instantly across all devices
- 📱 **Responsive Design** - Works perfectly on desktop and mobile

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Language**: JavaScript

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://oqjeiwtbvsjablvmlpuw.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xamVpd3RidnNqYWJsdm1scHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNDM1NzYsImV4cCI6MjA3NjYxOTU3Nn0.GkP6i4d6lGkETeG5tQ2bA_iS4WXsl9VCHgykp7YeazI
```

### 3. Set Up Supabase Database

Go to your Supabase dashboard and create the `assets` table:

```sql
-- Create assets table with quantity and price tracking
CREATE TABLE assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC(15, 4) NOT NULL DEFAULT 0,
  purchase_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  current_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own assets
CREATE POLICY "Users can view their own assets"
  ON assets FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own assets
CREATE POLICY "Users can insert their own assets"
  ON assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own assets
CREATE POLICY "Users can update their own assets"
  ON assets FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own assets
CREATE POLICY "Users can delete their own assets"
  ON assets FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE assets;
```

#### Migration for Existing Databases

If you already have an `assets` table with a `value` or `unit_price` column, run these migration commands:

```sql
-- If you have a 'value' column, drop it first
ALTER TABLE public.assets DROP COLUMN IF EXISTS value;

-- If you have a 'unit_price' column, rename it
ALTER TABLE public.assets RENAME COLUMN unit_price TO purchase_price;

-- Add new columns if they don't exist
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS quantity NUMERIC(15, 4) DEFAULT 1;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS current_price NUMERIC(15, 2) DEFAULT 0;
```

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## Project Structure

```
src/
├── lib/
│   └── supabaseClient.js    # Supabase client configuration
├── components/
│   ├── Auth.jsx              # Authentication (sign up/sign in)
│   ├── Header.jsx            # Dashboard header with total wealth
│   ├── AssetList.jsx         # List of assets with realtime updates
│   └── AddAssetForm.jsx      # Form to add new assets
├── App.jsx                   # Main app with auth state management
├── main.jsx                  # React entry point
└── index.css                 # Global styles with Tailwind
```

## How It Works

1. **Authentication**: Users sign up or sign in using email/password via Supabase Auth
2. **Session Management**: The app monitors auth state changes and shows appropriate UI
3. **Asset Management**: Logged-in users can add assets with quantity, purchase price, and current price
4. **Portfolio Tracking**: Calculate total invested amount, current value, and unrealized gains/losses
5. **Quantity Management**: Increment or decrement asset quantities with action buttons
6. **Realtime Updates**: Changes to assets are instantly reflected via Supabase Realtime
7. **Gain/Loss Calculation**: Automatically computed from purchase vs. current prices

## Security

- Row Level Security (RLS) ensures users can only access their own data
- Environment variables keep Supabase credentials secure
- All database operations are filtered by `user_id`

## Important Notes

### 💰 Why NUMERIC Instead of FLOAT?

All price and quantity columns use **NUMERIC** instead of FLOAT for precise financial calculations:

- **FLOAT has precision issues**: 8000 might be stored as 7998.98 ❌
- **NUMERIC is exact**: 8000.00 stays exactly 8000.00 ✅
- **quantity**: NUMERIC(15, 4) - up to 4 decimal places for fractional shares
- **purchase_price & current_price**: NUMERIC(15, 2) - standard monetary precision

This is critical for financial applications where every cent matters!

### 🌍 Currency Format

The app uses EUR (€) with French formatting (`fr-FR`). To change to USD or other currencies:

1. Update `formatCurrency` functions in `Header.jsx` and `AssetList.jsx`
2. Change `currency: 'EUR'` to your desired currency code
3. Update locale from `'fr-FR'` to match your region (e.g., `'en-US'`)

## MVP Features Included

✅ User authentication (sign up/sign in/sign out)  
✅ Add new assets with quantity, purchase price, and current price  
✅ View all personal assets with detailed information  
✅ Display total invested amount and current portfolio value  
✅ Track unrealized gains and losses per asset  
✅ Calculate total gain/loss with percentage  
✅ Increment/decrement asset quantities  
✅ Edit and delete assets with confirmation  
✅ **🔄 Automatic price updates** via Yahoo Finance API  
✅ Supabase Edge Function for secure API calls  
✅ Yahoo Finance symbol support (stocks, crypto, indices, forex)  
✅ Realtime synchronization across devices  
✅ Responsive design for mobile and desktop  
✅ Clean, modern UI with TailwindCSS  

## 🔄 Automatic Price Updates (NEW!)

Finarian now supports **automatic price updates** via Yahoo Finance! 

### How to Use

1. **Add a Yahoo Finance symbol** when creating or editing an asset
   - Examples: `AAPL`, `MSFT`, `BTC-USD`, `^FCHI`, `EURUSD=X`
2. **Click "🔄 Mettre à jour les prix"** in the dashboard header
3. Watch your portfolio values update in real-time!

### Technical Details

- **Supabase Edge Function** securely fetches prices server-side
- **Yahoo Finance API** provides real-time market data
- **No API key required** - fully functional out of the box
- Supports stocks, crypto, indices, and forex

📖 **Full documentation**: See [AUTOMATIC_PRICE_UPDATE.md](./AUTOMATIC_PRICE_UPDATE.md)

## Next Steps (Future Enhancements)

- 📊 **Charts and Visualizations**: Add portfolio allocation pie charts and gain/loss trend graphs
- 🏷️ **Asset Filtering**: Filter assets by category
- 📈 **Historical Tracking**: Track price history and portfolio value over time
- 💱 **Multi-Currency Support**: Support multiple currencies with conversion rates
- 📄 **Export Data**: Export portfolio to CSV or PDF
- 🔔 **Price Alerts**: Set alerts for price targets or percentage changes
- ⏰ **Scheduled Updates**: Auto-update prices daily via cron job

---

Built with ❤️ using React, TailwindCSS, and Supabase

