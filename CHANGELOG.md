# Changelog

All notable changes to Perpolis are documented here. The format roughly
follows [Keep a Changelog](https://keepachangelog.com), and releases are
versioned per [SemVer](https://semver.org).

## [0.6.0] — 2026-05-28

### Added

- Mobile mockup section on the landing page.
- Devnet balance pill in the wallet dropdown, sourced from the same API
  as the trading panel so the two never disagree.

### Fixed

- **Critical:** auto-close, liquidation watcher and limit-order trigger
  could evaluate a foreign-market position against the current page's
  mark price. All four useEffect hooks now filter by `token_symbol`
  matching the page's symbol before doing anything destructive.
- TP/SL modal crashed on positions whose Postgres `DECIMAL` columns came
  back as strings — coerced through `Number()` before formatting.
- Position close was occasionally crediting `"0"` to the demo balance
  because `position.collateral + pnlValue` was string-concatenating;
  wrapped in `Number()`.

## [0.5.0] — 2026-05-21

### Added

- Cloudflare proxy in front of `app.perpolis.xyz` with SSL mode `full`,
  so the app subdomain stops surfacing a `*.github.io` certificate.
- Neon Postgres as the primary datastore. Migrated all twelve API routes
  from the previous datastore to raw SQL via the Neon HTTP driver.
- `scripts/migrate.mjs` for one-shot schema bootstrap.

### Changed

- All amount columns now use Postgres `NUMERIC`; explicit `::numeric`
  casts on bound parameters prevent integer inference on upserts.

## [0.4.0] — 2026-05-12

### Added

- LARP widgets (live ticker, whale-watch, funding banner, tier badge).
- 30+ popular tokens seeded in the meme-perps index.

### Removed

- Stats row under the hero. It did not add information.

## [0.3.0] — 2026-05-02

### Added

- `/meme-perps/create` flow with on-chain payment via real USDC / USDT
  / SOL, verified server-side via Helius and credited as demo USDC.
- Welcome bonus of 50 demo USDC on first wallet connection.
- Take-profit, stop-loss, interpolated-entry order types.

## [0.2.0] — 2026-04-29

### Added

- Phantom, Solflare, MetaMask (Solana Snap) wallet adapters.
- Live OHLCV chart via `lightweight-charts`, fed by Birdeye through
  `/api/ohlcv`.
- English / Russian internationalisation.

## [0.1.0] — 2026-04-23

Initial public scaffold.

- Next.js 16 App Router project, Tailwind v4 + shadcn/ui.
- Landing page, hero, footer.
- Empty `/meme-perps` index, placeholder per-token trading page.
- Perpolator engine integration stub.
