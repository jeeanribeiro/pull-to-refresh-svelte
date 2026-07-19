# Contributing

Thanks for helping out! The setup is small:

```sh
pnpm install   # installs deps and builds the package once
pnpm dev       # demo site with live reload on http://localhost:43130
```

## Before you open a PR

Run the same gauntlet CI runs:

```sh
pnpm lint && pnpm check && pnpm test:unit && pnpm build
pnpm test:e2e   # needs chromium: pnpm exec playwright install chromium
```

A few ground rules:

- The library lives in `src/lib/`, the demo site in `src/routes/`.
- Gesture behavior changes need a component test in `src/lib/PullToRefresh.test.ts`
  (pointer sequences) and, when user-visible, an e2e test in `e2e/`.
- The indicator recreations are intentionally faithful to their platform
  originals — visual tweaks to them should come with a before/after screenshot.
- Add a changeset (`pnpm changeset`) for anything that should ship in a release.

## Reporting bugs

Use the bug report template. A reproduction in the demo site (or a REPL link)
makes fixes much faster.
