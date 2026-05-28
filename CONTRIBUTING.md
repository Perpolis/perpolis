# Contributing

Thanks for the interest. PRs are welcome — small and focused beats big and
ambitious every time.

## Workflow

1. Fork, branch off `main`. Branch name: `feat/<thing>`, `fix/<thing>`,
   `chore/<thing>`.
2. `pnpm install`, `pnpm dev`. Open against the running app.
3. Conventional Commits, please: `feat: …`, `fix: …`, `chore: …`,
   `refactor: …`, `docs: …`, `style: …`, `perf: …`, `test: …`.
4. Open a draft PR early if you want a sanity check on direction.
5. Resolve `pnpm lint` and `pnpm build` locally before requesting review.

## Style

- TypeScript strict — no `any` without a justification comment.
- Tailwind utilities over custom CSS. Theme tokens live in
  `app/globals.css`; do not hardcode hex values in JSX.
- No emojis in source unless the user-facing copy already uses them.
- Files over ~300 lines should be split. The trading page is grandfathered.

## Tests

We don't ship a test suite yet. If you add one, prefer Playwright over
Jest for anything UI-shaped — Next.js App Router + RSC makes unit-testing
components painful and integration tests pay off faster.

## Reporting issues

Use the GitHub issue templates. For security, see [`SECURITY.md`](./SECURITY.md).
