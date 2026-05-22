import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

const STMTS = [
`CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  market TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  size DECIMAL NOT NULL,
  leverage DECIMAL NOT NULL,
  entry_price DECIMAL NOT NULL,
  liquidation_price DECIMAL,
  collateral DECIMAL NOT NULL,
  commission DECIMAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  take_profit DECIMAL,
  stop_loss DECIMAL,
  tx_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  close_price DECIMAL,
  pnl_realized DECIMAL
)`,
`CREATE INDEX IF NOT EXISTS idx_positions_wallet ON positions(wallet_address)`,
`CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status)`,
`CREATE INDEX IF NOT EXISTS idx_positions_created ON positions(created_at DESC)`,

`CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  market TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  size DECIMAL NOT NULL,
  leverage DECIMAL NOT NULL,
  limit_price DECIMAL NOT NULL,
  collateral DECIMAL NOT NULL,
  commission DECIMAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  tx_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`,
`CREATE INDEX IF NOT EXISTS idx_orders_wallet ON orders(wallet_address)`,
`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,

`CREATE TABLE IF NOT EXISTS user_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_wallet TEXT NOT NULL,
  token_address TEXT NOT NULL UNIQUE,
  token_symbol TEXT NOT NULL,
  token_name TEXT NOT NULL,
  token_logo TEXT,
  collateral TEXT NOT NULL DEFAULT 'USDC',
  max_leverage INTEGER NOT NULL DEFAULT 10,
  trading_fee DECIMAL(5,3) NOT NULL DEFAULT 0.10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  current_price DECIMAL(20,10) DEFAULT 0,
  price_change_24h DECIMAL(10,4) DEFAULT 0,
  volume_24h DECIMAL(20,2) DEFAULT 0,
  open_interest DECIMAL(20,2) DEFAULT 0,
  funding_rate DECIMAL(10,6) DEFAULT 0
)`,
`CREATE INDEX IF NOT EXISTS idx_user_markets_creator ON user_markets(creator_wallet)`,
`CREATE INDEX IF NOT EXISTS idx_user_markets_symbol ON user_markets(token_symbol)`,

`CREATE TABLE IF NOT EXISTS demo_balances (
  wallet_address TEXT PRIMARY KEY,
  balance DECIMAL NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
)`,

`CREATE TABLE IF NOT EXISTS demo_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_signature TEXT NOT NULL UNIQUE,
  wallet_address TEXT NOT NULL,
  amount_credited DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`,
`CREATE INDEX IF NOT EXISTS idx_demo_deposits_wallet ON demo_deposits(wallet_address)`,
]

for (const stmt of STMTS) {
  try {
    await sql.query(stmt)
    console.log("✅", stmt.slice(0, 80).replace(/\s+/g, " ").trim())
  } catch (e) {
    console.error("❌", stmt.slice(0, 60).replace(/\s+/g, " "), "→", e.message)
  }
}

// Verify
const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
console.log("\nTables now in DB:")
for (const r of tables) console.log("  -", r.tablename)
