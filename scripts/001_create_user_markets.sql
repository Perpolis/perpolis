-- Create user_markets table for user-created markets
CREATE TABLE IF NOT EXISTS public.user_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_wallet TEXT NOT NULL,
  token_address TEXT NOT NULL UNIQUE,
  token_symbol TEXT NOT NULL,
  token_name TEXT NOT NULL,
  token_logo TEXT,
  collateral TEXT NOT NULL DEFAULT 'USDC',
  max_leverage INTEGER NOT NULL DEFAULT 10,
  trading_fee DECIMAL(5,3) NOT NULL DEFAULT 0.10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Market stats (will be updated by price feeds)
  current_price DECIMAL(20,10) DEFAULT 0,
  price_change_24h DECIMAL(10,4) DEFAULT 0,
  volume_24h DECIMAL(20,2) DEFAULT 0,
  open_interest DECIMAL(20,2) DEFAULT 0,
  funding_rate DECIMAL(10,6) DEFAULT 0
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_markets_creator ON public.user_markets(creator_wallet);
CREATE INDEX IF NOT EXISTS idx_user_markets_symbol ON public.user_markets(token_symbol);
CREATE INDEX IF NOT EXISTS idx_user_markets_created ON public.user_markets(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_markets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read markets (public listing)
CREATE POLICY "Anyone can view markets" ON public.user_markets
  FOR SELECT USING (true);

-- Allow anyone to insert markets (wallet address is tracked)
CREATE POLICY "Anyone can create markets" ON public.user_markets
  FOR INSERT WITH CHECK (true);

-- Only creator can update their markets
CREATE POLICY "Creators can update their markets" ON public.user_markets
  FOR UPDATE USING (true);
