<div align="center">
  <img src="./logo.png" alt="Perpolis" width="120" />

  # Perpolis

  **Meme perpetuals on Solana. Up to 100× leverage on any SPL token.**

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Solana](https://img.shields.io/badge/Solana-mainnet-9945FF?logo=solana&logoColor=white)](https://solana.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-A3FF12.svg)](./LICENSE)

  [perpolis.xyz](https://perpolis.xyz) · [app.perpolis.xyz](https://app.perpolis.xyz) · [@perpolisxyz](https://x.com/perpolisxyz)
</div>

---

## What is Perpolis

Perpolis is a perpetuals exchange that lets anyone open a market on any SPL token and trade it with up to **100×** leverage. There are no listing committees, no whitelists, and no hard-coded pairs. If a token has a price feed, it has a perp.

The matching layer is **Perpolator** — our in-house perpetuals engine that tracks mark price, funding, liquidations, take-profit / stop-loss, limit, stop-market and interpolated-entry orders against an off-chain settlement ledger. Real funds never leave the user's wallet until withdrawal; positions are settled in demo USDC topped up against a small SOL/USDC deposit so users can ape without surrendering custody to anything heavier than a faucet.

This repository contains the full marketing site, the trading frontend, the order/position API and the Perpolator integration glue.

## Live

| Surface          | URL                                                                    |
| ---------------- | ---------------------------------------------------------------------- |
| Marketing        | [https://perpolis.xyz](https://perpolis.xyz)                           |
| Trading app      | [https://app.perpolis.xyz](https://app.perpolis.xyz)                   |
| Meme perps index | [https://perpolis.xyz/meme-perps](https://perpolis.xyz/meme-perps)     |
| Twitter / X      | [@perpolisxyz](https://x.com/perpolisxyz)                              |

## Features

- **Any-token perps.** Spin up a brand-new market in one click from the `/meme-perps/create` page; the Perpolator engine starts streaming the mark immediately.
- **Up to 100× leverage** with isolated margin per position. Liquidation engine runs server-side at sub-second cadence.
- **Order types out of the box** — market, limit, stop-market, take-profit / stop-loss attached at open, and *interpolated entry* (Perpolis's own laddered DCA primitive).
- **Welcome bonus** of 50 demo USDC for every connected wallet, plus on-chain top-up via real USDC / USDT / SOL deposits for sustained play.
- **Multi-wallet.** Phantom, Solflare, MetaMask (Solana Snap).
- **Live charts** powered by `lightweight-charts` over a streaming OHLCV feed.
- **Internationalised UI** — English / Russian out of the box, easy to extend.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19
- TypeScript end-to-end
- Tailwind CSS v4 + shadcn/ui
- [Neon Postgres](https://neon.tech) (serverless HTTP driver) for orders, positions, markets and balances
- [Birdeye](https://birdeye.so) for OHLCV + token discovery
- Helius RPC for wallet balance reads
- `@solana/web3.js` + `@solana/spl-token` for on-chain deposits
- The **Perpolator** engine for mark price, funding and liquidations (see [`docs/architecture.md`](./docs/architecture.md))
- Deployed on [Vercel](https://vercel.com) behind Cloudflare

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/perpolis/perpolis.git
cd perpolis
pnpm install
```

> npm and yarn both work. The lockfile is `pnpm-lock.yaml`.

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in at minimum:

- `DATABASE_URL` — a Neon (or any) Postgres connection string
- `NEXT_PUBLIC_TREASURY_WALLET` and `PAYMENT_ADDRESS` — same value, the address that receives deposits
- `BIRDEYE_API_KEY` — for price feeds and search

See [`.env.example`](./.env.example) for the full list and inline docs.

### 3. Run migrations

```bash
node scripts/migrate.mjs
```

This creates the `positions`, `orders`, `user_markets`, `demo_balances` and `demo_deposits` tables.

### 4. Dev server

```bash
pnpm dev
```

The app boots on [http://localhost:3000](http://localhost:3000).

## Repository layout

```
app/                    Next.js routes (App Router)
  api/                  Server route handlers (positions, orders, markets, demo balance, OHLCV, …)
  meme-perps/           Public market index + per-token trading page + create-market flow
components/             React components (sections, trading panels, LARP widgets, shadcn primitives)
  larp/                 Live ticker, whale-watch, funding banner, tier badge
  sections/             Hero / dex / trade / footer marketing sections
lib/                    DB client, wallet context, language context, utils
public/                 Static assets (logo, favicons, mobile mockup, wallet icons)
scripts/                SQL migrations + migrate.mjs runner
docs/                   Architecture notes
```

## Contributing

Open an issue or a draft PR. Conventional Commits (`feat:`, `fix:`, `chore:`…) preferred — see existing history.

## Security

If you find a vulnerability please email **security@perpolis.xyz** or DM [@perpolisxyz](https://x.com/perpolisxyz). Do not file a public issue. See [`SECURITY.md`](./SECURITY.md).

## License

[MIT](./LICENSE).
