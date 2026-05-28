# Architecture

This document explains how the pieces of Perpolis fit together.

```
                       ┌──────────────────────────────┐
                       │            Browser           │
                       │  Next.js app (React 19, TSX) │
                       │   + lightweight-charts feed  │
                       │   + Solana wallet adapter    │
                       └─────────────┬────────────────┘
                                     │  HTTPS
                                     ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                  Next.js route handlers                     │
   │  app/api/positions  app/api/orders  app/api/markets         │
   │  app/api/demo-balance  app/api/demo-deposit  app/api/ohlcv  │
   └────────┬────────────────────────────┬───────────────────────┘
            │                            │
            ▼                            ▼
   ┌─────────────────┐         ┌──────────────────────────┐
   │  Neon Postgres  │◀──────▶│   Perpolator engine      │
   │  (HTTP driver)  │  marks  │  (mark, funding,         │
   │  positions,     │ + funds │   liquidations, TP/SL,   │
   │  orders,        │         │   interpolated entries)  │
   │  user_markets,  │         └──────────┬───────────────┘
   │  demo_balances, │                    │
   │  demo_deposits  │                    │ RPC
   └─────────────────┘                    ▼
                                ┌──────────────────────┐
                                │   Solana mainnet     │
                                │  (Helius / public)   │
                                └──────────────────────┘
```

## Layers

### 1. Frontend (`app/`, `components/`)

A standard Next.js App Router project. The trading page lives at
`app/meme-perps/[token]/page.tsx`. It owns:

- Order ticket (market / limit / stop-market / interpolated)
- Position table with live PnL
- TP/SL editor
- Chart (`components/trading-chart.tsx` wraps `lightweight-charts`)
- Wallet panel (welcome bonus, deposit modal, address management)

All UI state is local React state. Persistent state is read via SWR from
the API layer; no client-side database calls.

### 2. API layer (`app/api/`)

Every endpoint is a Next.js route handler running on Vercel's serverless
runtime. They are thin: they validate input, call the Perpolator engine
where pricing or settlement is involved, and persist results to Postgres.

| Route                          | Purpose                                                       |
| ------------------------------ | ------------------------------------------------------------- |
| `POST /api/positions`          | Open a position. Quotes mark from Perpolator, writes row.     |
| `GET  /api/positions?wallet=…` | List positions for a wallet.                                  |
| `POST /api/positions/close`    | Close, settle PnL into demo balance.                          |
| `POST /api/positions/update-tpsl` | Attach / change TP and SL levels.                          |
| `POST /api/positions/liquidate`| Server-side liquidator hook (called by Perpolator callbacks). |
| `POST /api/orders`             | Place limit / stop-market / interpolated order.               |
| `POST /api/orders/cancel`      | Cancel an order.                                              |
| `POST /api/orders/trigger`     | Trigger a resting order (called by Perpolator).               |
| `GET  /api/markets`            | List user-created markets.                                    |
| `GET  /api/markets/[symbol]`   | Single-market detail.                                         |
| `GET  /api/demo-balance`       | Read / seed welcome bonus.                                    |
| `POST /api/demo-balance`       | Apply atomic delta (credit / debit, floored at 0).            |
| `POST /api/demo-deposit`       | Verify on-chain payment, credit demo USDC.                    |
| `GET  /api/verify-payment`     | Idempotent payment-status check.                              |
| `GET  /api/ohlcv`              | Proxied candles for the chart.                                |
| `GET  /api/wallet-balance`     | Live SOL / USDC balance for a Solana address.                 |
| `GET  /api/tokens`             | Discover / search tokens.                                     |
| `GET  /api/search-token`       | Token search by mint or symbol.                               |
| `GET  /api/token-price`        | Single price quote.                                           |

### 3. Database (Neon Postgres)

Five tables, all defined in `scripts/001_create_positions.sql` and
`scripts/001_create_user_markets.sql`:

- **`positions`** — every open and closed position, with TP/SL columns and
  liquidation price.
- **`orders`** — resting orders (limit / stop / interpolated). Triggered
  orders flip to `status='filled'` and spawn a `positions` row.
- **`user_markets`** — markets created via the `/meme-perps/create` flow.
- **`demo_balances`** — per-wallet demo USDC balance. Upserts use
  `GREATEST(0::numeric, balance + delta)` to prevent negative balances and
  to avoid Postgres inferring `INTEGER` from bound parameters.
- **`demo_deposits`** — append-only ledger of on-chain top-ups. Unique on
  transaction signature so the same payment can't be credited twice.

We use `@neondatabase/serverless` (HTTP driver) — every query is a
stateless fetch, so cold-start cost is bounded.

### 4. Perpolator engine

Perpolator is the perpetuals matching layer that powers the trading
experience. It is responsible for:

- **Mark price** — TWAP-blended price stream per market, fed into the chart
  and into PnL calculations.
- **Funding** — periodic settlement of long-vs-short imbalance, surfaced in
  the UI funding banner.
- **Liquidations** — sub-second monitoring loop; calls our
  `/api/positions/liquidate` hook when maintenance margin breaks.
- **Order resting + triggers** — calls `/api/orders/trigger` when a limit /
  stop / interpolated condition is met.
- **Take-profit / stop-loss** — same trigger path as limit orders.
- **Interpolated entry** — Perpolis-specific: a ladder of N entries between
  two prices with auto-cancel on the rest if the band breaks.

The engine is integrated through plain HTTPS callbacks — the public
surface is documented in [`docs/perpolator.md`](./perpolator.md) (TODO).

## Cross-market safety

The most subtle correctness issue we had to solve: a position opened on
market **A** must never be settled against market **B**'s mark, even if the
user has both pages open or the SWR cache is shared.

Every position row carries `token_symbol`. Every loop that touches mark
price (auto-close on TP/SL, liquidation watcher, limit-trigger watcher,
PnL display) filters by

```ts
position.token_symbol === currentSymbol
```

before doing anything destructive. Foreign-market positions are still
visible in the unified positions table but their PnL is computed against
*their own* market's mark (fetched separately) and they cannot be closed
or liquidated from a foreign page.

## Deployment

- **Hosting** — Vercel (Next.js native).
- **DNS / TLS** — Cloudflare in front of both `perpolis.xyz` and
  `app.perpolis.xyz`. SSL mode `full` so the GitHub-Pages-style origin on
  the app subdomain is accepted.
- **Database** — Neon Postgres, scale-to-zero.
- **RPC** — Helius primary, public mainnet-beta as fallback.
