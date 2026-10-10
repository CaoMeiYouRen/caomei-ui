# Release Guide

## Release tool

**semantic-release** infers the version from Conventional Commits and publishes automatically.

> changesets is not used (this project is a single package, and semantic-release is the standard fit).

> **Current status**: `release.yml` is in place, but the publish step is not enabled yet; releases are performed **locally and manually** for now (see "Manual release (local)" below). CI auto-publish will be enabled after npm credentials are configured (`NPM_TOKEN` or npm Trusted Publisher / OIDC).

## Version inference

| Commit type | Version change |
|----------|----------|
| `fix` | patch |
| `feat` | minor |
| `BREAKING CHANGE` / `!` | major |
| `docs` / `chore` / `test` / `ci` / `refactor` | no version (unless configured) |

## Release flow

1. Commits follow Conventional Commits (via the `conventional-committer` skill).
2. Pushing to `master` triggers semantic-release in `release.yml` (the publish step is currently disabled).
3. Once enabled, it automatically:
   - infers the version number;
   - generates / updates `CHANGELOG.md`;
   - publishes the npm package `caomei-ui`;
   - creates the GitHub Release and tag.

## Manual release (local)

Releases are currently performed **locally and manually** — CI auto-publish stays disabled (see the Chinese guide §5). Use the single-entry orchestrator:

```bash
pnpm release:manual run --version=0.7.0 [--date=YYYY-MM-DD] [--yes]
```

It chains seven steps: `preflight → bump → changelog → publish → verify → sync → announce`. Mutating steps (`bump` / `changelog` / `publish` / `sync` / `announce`) require an explicit `--yes`; use `--dry-run` to preview. The script never pushes — run `git push origin master --follow-tags` yourself. See the [Chinese release guide](/guide/release) §3 for the full runbook, the tag placement note and the release-metadata exemption boundary.

## Pre-release checks

- All quality gates pass (lint / typecheck / test / build).
- Build output smoke test: confirm ESM, type declarations, CSS and subpath exports work.
- Public API changes are confirmed backward compatible or a major is planned.
- The docs site builds.

### Third-party license compliance

- Licenses of the runtime dependencies (`reka-ui` / `@tanstack/vue-table` / `@lucide/vue` / `@internationalized/date` / `@vavt/cm-extension`, the rich text extra locale pack), the `vue` peer dependency and the optional peer (`md-editor-v3`, the rich text kernel) are declared in the repository-root `THIRD-PARTY-LICENSES` file and shipped with the npm package (added to `package.json`'s `files`).
- After adding or upgrading a runtime dependency, run `pnpm check:licenses` to verify the declaration covers it and matches the installed version; the check is part of `pnpm verify` (`governance:check`).
- Keep the declaration in sync: add a `## <name>@<version>` entry for a new dependency, and update both the entry heading and the full license text when upgrading (copy from `node_modules/<pkg>/LICENSE`).
- `prepublishOnly` runs the same check automatically before publishing, aborting the release if the declaration is missing or stale.

## Package format and the 0.2.0 breaking change

- Single ESM package: `exports` provides the `import` condition only (no `require`); consume it from ESM (Nuxt 4 / Vite).
- Subpath exports: `caomei-ui`, `caomei-ui/theme.css`, `caomei-ui/resolver`, `caomei-ui/nuxt`.
- **Breaking change since 0.2.0**: the `caomei-ui/styles.css` subpath export (old monolithic stylesheet) was removed in favour of `caomei-ui/theme.css` (base layer: tokens, dark mode, `.caomei-root`, brand presets). Component styles ship with their modules (`sideEffects: ["**/*.css"]`) and are tree-shaken by the bundler.
- **Downstream fix**: replace `import 'caomei-ui/styles.css'` with `import 'caomei-ui/theme.css'`. The resolver and the Nuxt module inject the base layer automatically — keep a single injection point to avoid duplicate injection.
- **Consumer requirement**: the shipped JS keeps per-module CSS imports, so plain Node ESM cannot import the package root (`ERR_UNKNOWN_FILE_EXTENSION: .css`). Use a bundler (Vite / rolldown tested) or an equivalent CSS stub loader (what our own `check:build` smoke uses).

## Downstream compatibility regression

> **History**: this mechanism used to be deferred (2026-09-19 decision); it **started** with [roadmap Phase 8](/plan/roadmap) on 2026-10-10, piloted on dependfix.

- **Mechanism**: caomei-ui's own workflow **checks out the downstream source** and runs its `typecheck` + `build` on the **upstream runner** (**upstream-triggered + upstream-executed**); any failure is a **compatibility blocker**.
- **Carrier**: `.github/workflows/downstream-compat.yml` — auto-triggered by a caomei-ui **release tag (`v*`)**, plus manual `workflow_dispatch` (with an optional target version). The downstream repository must be **public** (upstream checkout needs no extra credentials).
- **Checked list (register on onboarding)**: registered in the workflow's `matrix` — **in scope** means it is registered in the `matrix`.
  - **In scope**: `dependfix` (`apps/platform`, pilot).
  - **Consumed but not onboarded** (pending incremental registration): `momei` (root package).
  - **Roadmap target downstreams with zero consumption today**: `caomei-auth` / `rss-impact-next` / `afdian-linker` — register on onboarding.
- **Trigger and capacity**: triggered **once per caomei-ui release tag (`v*`)** (manual runs allowed); scope is at least `typecheck` + `build`, **excluding** e2e / visual regression / full unit tests / coverage. **The downstream default branch is a moving target**: the workflow records the downstream revision (SHA) for attribution — a red run may be caused by the downstream's own changes, not a caomei-ui regression.
- **Ownership and status**: this mechanism is [roadmap Phase 8](/plan/roadmap); the workflow is **ready**, piloted on dependfix. See the Phase 8 scope evaluation record (`docs/design/governance/2026-10-08-phase8-downstream-regression-scope-evaluation.md`) for the scope and form.

## Related docs

- [Git standards](/standards/git) (Chinese)
- [Architecture - Release pipeline](/design/architecture#_7-发布链路) (Chinese)
- [Roadmap](/plan/roadmap) (Chinese)
