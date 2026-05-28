# Security policy

## Reporting a vulnerability

Please report security issues privately. **Do not** open a public GitHub issue.

- Email: **security@perpolis.xyz**
- DM: [@perpolisxyz](https://x.com/perpolisxyz)

Include:

- A clear description of the issue and its impact
- Reproduction steps (a minimal PoC is ideal)
- The commit / deployed URL where the issue was observed

We aim to acknowledge reports within **48 hours** and to ship a fix or
mitigation within **14 days** for confirmed vulnerabilities, faster for issues
that put user funds at direct risk.

## Scope

In scope:

- `perpolis.xyz` and all subdomains we operate (`app.`, `api.`)
- The code in this repository
- The Perpolator engine's exposed HTTP surface

Out of scope:

- Vulnerabilities in third-party providers (Vercel, Neon, Cloudflare,
  Birdeye, Helius) — please report those to the vendor directly.
- Social engineering, physical attacks, denial-of-service.
- Issues that require an attacker to already control the victim's wallet.

## Safe harbour

Good-faith research is welcome. We will not pursue legal action against
researchers who:

- Avoid privacy violations and disruption to other users.
- Do not exploit beyond the minimum needed to confirm the issue.
- Give us reasonable time to fix before public disclosure.
