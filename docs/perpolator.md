# Perpolator engine integration

The Perpolator engine is the perpetuals matching layer Perpolis runs
against. This document describes the public touch-points — what the engine
expects from us, and what we expect from it.

> Detailed engine internals (the matching loop, the funding accrual model,
> the liquidation queue) live in the engine repo and are out of scope for
> this app.

## Surface

```
┌──────────────────────┐                     ┌──────────────────────┐
│      Perpolis        │                     │     Perpolator       │
│  (this repository)   │                     │       engine         │
└──────────┬───────────┘                     └──────────┬───────────┘
           │                                            │
           │   POST /perpolator/orders   ──────────────▶│   place / cancel
           │   POST /perpolator/positions ─────────────▶│   open / close
           │   GET  /perpolator/mark/:symbol  ◀────────▶│   live mark stream
           │                                            │
           │   ◀────  POST /api/orders/trigger          │   order filled
           │   ◀────  POST /api/positions/liquidate     │   maintenance breach
           │   ◀────  POST /api/positions/update-tpsl   │   TP/SL ack
           │                                            │
```

## What the engine calls us with

These are the inbound webhooks the engine fires; each maps to a route in
`app/api/`.

### Order trigger — `POST /api/orders/trigger`

Body:

```jsonc
{
  "orderId": "uuid",
  "fillPrice": 0.012345,
  "filledAt": "2026-05-28T10:11:12Z"
}
```

We flip the order row to `status='filled'`, write the matching
`positions` row, and decrement the wallet's demo balance by the collateral
amount in a single Postgres transaction.

### Liquidation — `POST /api/positions/liquidate`

Body:

```jsonc
{
  "positionId": "uuid",
  "markPrice": 0.0091,
  "liquidatedAt": "2026-05-28T10:11:12Z"
}
```

We update the position to `status='liquidated'`, settle the residual (if
any) into the demo balance, and emit a UI event so the position is removed
from the live table.

### TP/SL acknowledgement — `POST /api/positions/update-tpsl`

Sent after the engine accepts a TP/SL change. Idempotent — same body
multiple times is a no-op.

## What we call into the engine

The forward direction is plain HTTPS with HMAC-signed bodies. Endpoints
live behind the gateway URL configured in `PERPOLATOR_BASE_URL`. We do not
publish that URL here.

## Cross-market guarantees

The engine streams **one mark per market**. We rely on this to keep our
auto-close, liquidation watcher and PnL calculations honest. See
[`architecture.md`](./architecture.md#cross-market-safety).
