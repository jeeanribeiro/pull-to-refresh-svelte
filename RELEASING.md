# Releasing

Releases are driven by [Changesets](https://github.com/changesets/changesets).

## Day-to-day flow

1. Land changes on `main` with a changeset: `pnpm changeset` (pick the bump, describe the change).
2. The `Release` workflow opens/updates a "Version Packages" PR that bumps the version and changelog.
3. Merging that PR publishes to npm with provenance and pushes the git tag.

## One-time npm setup (required before the first publish)

The publish job is intentionally gated behind the repository variable
`NPM_TRUSTED_PUBLISHING` so CI skips it cleanly until npm is configured:

1. Create the `pull-to-refresh-svelte` package on npm — either by running
   `pnpm publish --access public` once locally, or by configuring
   [npm trusted publishing](https://docs.npmjs.com/trusted-publishers)
   for `jeeanribeiro/pull-to-refresh-svelte` with workflow `release.yml`
   (no token needed; the workflow already requests `id-token: write`).
2. Set the repository variable:

   ```sh
   gh variable set NPM_TRUSTED_PUBLISHING --body true
   ```

## GitHub Releases

Tags follow `vX.Y.Z`. Each release gets human-written notes summarizing the
changes — see the existing releases for the format.
