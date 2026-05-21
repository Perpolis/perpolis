-- Create positions table for storing user trading positions
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  market TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  size DECIMAL NOT NULL,
  leverage DECIMAL NOT NULL,
  entry_price DECIMAL NOT NULL,
  liquidation_price DECIMAL NOT NULL,
  collateral DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  tx_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  close_price DECIMAL,
  realized_pnl DECIMAL
);
