import { neon } from "@neondatabase/serverless"

// Single Neon HTTP client. Safe to import from any server route — no
// connection pooling concerns (HTTP fetch per query).
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!url) {
  // Don't throw at import time — let individual handlers decide whether to
  // hard-fail or return empty fallbacks. But log loudly in production logs.
  console.error("[db] DATABASE_URL is not set. All DB calls will throw.")
}

export const sql = neon(url || "postgresql://invalid/db")

// Helper: run a parameterized query and always return an array of rows.
// Lets call sites stay terse:   const rows = await q`SELECT ... WHERE id = ${id}`
export const q = sql
