# Release Guide

## Release tool

**semantic-release** infers the version from Conventional Commits and publishes automatically.

> changesets is not used (this project is a single package, and semantic-release is the standard fit).

> **Current status**: `release.yml` is in place, but the publish step is not enabled yet; releases are performed **locally and manually** (see "Manual release (local)" below). For 1.0 the flow is two-step: an rc pre-release published to the npm `next` dist-tag, then the final version published to `latest`. `manual-release.mjs` supports `--tag=next|latest`; the default is inferred from the version (pre-release → `next`, stable → `latest`), and **a pre-release combined with `latest` is rejected**. The channel contract and evidence are recorded in [the M3-1 release record](/design/governance/2026-10-26-phase26-m3-1-release-tag-coverage-preflight.md). CI auto-publish stays disabled; commit-driven auto-publish will be decided separately after 1.0.

> **1.0 release gate (from 2026-10-26)**: `1.0.0-rc.1` must pass **G0 / G1 (plus G1-F if G1 decides "fix") / G2** before publishing; the final `1.0.0` must pass **G0 ~ G4** (including G3 rc and downstream verification). Do not run the corresponding `publish` before it passes. Target review 2026-11-13, hard stop 2026-11-27; no automatic extension. See [Phase 26 execution-time addition and 1.0 release gate](/design/governance/2026-10-26-phase26-ui-gate-planning.md) §4.

## Version inference

| Commit type | Version change |
|----------|----------|
| `fix` | patch |
| `feat` | minor |
| `BREAKING CHANGE` / `!` | major |
| `docs` / `chore` / `test` / `ci` / `refactor` | no version (unless configured) |

## Release flow

> This is the CI flow for the eventual auto-publish path; it is **not used for 1.0**, which stays on the local manual flow below.

1. Commits follow Conventional Commits (via the `conventional-committer` skill).
2. Pushing to `master` triggers semantic-release in `release.yml` (the publish step is currently disabled).
3. Once enabled, it automatically:
   - infers the version number;
   - generates / updates `CHANGELOG.md`;
   - publishes the npm package `caomei-ui`;
   - creates the GitHub Release and tag.

## Manual release (local)

Releases are performed **locally and manually** — CI auto-publish stays disabled (see the Chinese guide §5). For 1.0, an rc pre-release goes to the npm `next` dist-tag first; `latest` moves only when the final version is published. Use the single-entry orchestrator:

```bash
# rc pre-release -> npm next
pnpm release:manual run --version=1.0.0-rc.1 --tag=next [--date=YYYY-MM-DD] [--otp=<code>] [--yes]
# final release -> npm latest
pnpm release:manual run --version=1.0.0 --tag=latest [--date=YYYY-MM-DD] [--otp=<code>] [--yes]
```

It chains seven steps: `preflight → bump → changelog → publish → verify → sync → announce`. Omitting `--tag` infers the channel from the version (a pre-release with a `-` suffix → `next`, a stable version → `latest`); a pre-release with an explicit `--tag=latest` stops during argument validation. `preflight` runs `pnpm verify`, then `pnpm test:coverage` + `pnpm check:coverage` for coverage evidence. `publish` passes the target dist-tag explicitly, and `verify` reads the registry `dist-tags` to assert `dist-tags.<tag>` equals the published version; `latest` must never point at a pre-release. For pre-release versions `announce` passes `--prerelease`, and for any non-`latest` channel it passes `--latest=false`, so an rc or a staged release does not become the GitHub Latest Release. Mutating steps (`bump` / `changelog` / `publish` / `sync` / `announce`) require an explicit `--yes`; use `--dry-run` to preview. If the release deprecates public API, add a `Deprecations` section to the CHANGELOG manually (the generator does not group it yet). The script never pushes — run `git push origin master --follow-tags` yourself. See the [Chinese release guide](/guide/release) §3 for the full runbook, the tag placement note and the release-metadata exemption boundary.

## Pre-release checks

- All quality gates pass (lint / typecheck / test / build).
- Coverage evidence is generated and checked with `pnpm test:coverage` + `pnpm check:coverage` (also part of `preflight`).
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
  - **Consumed but not onboarded** (pending incremental registration): `momei` (root package) — **single blocker**: `momei`'s `build` (`NODE_OPTIONS=--max-old-space-size=6144 nuxt build`) has **unverified credential-free feasibility** on the upstream runner (`typecheck` = `nuxt typecheck` is comparatively light; `pnpm --filter <name>` **can select the root project by its package name**, so the existing override step needs no parameterising). Trigger = that verification, or a user request.
  - **Roadmap target downstreams with zero consumption today**: `caomei-auth` / `rss-impact-next` / `afdian-linker` — register on onboarding.
- **Trigger and capacity**: triggered **once per caomei-ui release tag (`v*`)** (manual runs allowed); scope is at least `typecheck` + `build`, **excluding** e2e / visual regression / full unit tests / coverage. **The downstream default branch is a moving target**: the workflow records the downstream revision (SHA) for attribution — a red run may be caused by the downstream's own changes, not a caomei-ui regression.
- **Ownership and status**: this mechanism is [roadmap Phase 8](/plan/roadmap); the workflow is **ready and verified by three real runs** — run #1 (2026-10-12, registry latest `0.6.0`, `dependfix @ 46c6fb61`, see `docs/design/governance/2026-10-12-phase22-m1-1-downstream-compat-first-run.md`), **run #2 (2026-10-13, explicit version input `0.5.0`, a **version difference** against the downstream's pinned version, `dependfix @ edbe5e04…`, see `docs/design/governance/2026-10-13-phase23-m2-1-downstream-compat-explicit-version-run.md`)** and **run #3 (2026-10-13 UTC / 2026-10-14 local, **negative control**: explicit input `0.2.0`, a known-incompatible version → `Typecheck downstream` **red**, `dependfix @ 1a6aca15…`, see `docs/design/governance/2026-10-14-phase24-m1-2-downstream-compat-negative-control.md`)**.
- **Discriminating-power wording (never read a green run as "compatibility verified")**: **pipeline integrity** (runtime sound, attributable) and **reinstall actually applied** (the override really switched versions) **hold**; **regression discriminating power** (telling "new version breaks downstream" from "does not") **now holds via the negative-control path** — run #3 installed the known-incompatible `0.2.0` and went red as expected, with all 6 TS diagnostics attributable to the `DataTable` multi-sort / row-grouping / row-expansion surface that only landed in `0.3.0`. **The positive direction is still unverified**: a case with a **target version newer than the downstream's pinned version** (the next release, tag-triggered) has not run yet. See the Phase 8 scope evaluation record (`docs/design/governance/2026-10-08-phase8-downstream-regression-scope-evaluation.md`) for the scope and form.

## Related docs

- [Git standards](/standards/git) (Chinese)
- [Architecture - Release pipeline](/design/architecture#_7-发布链路) (Chinese)
- [Roadmap](/plan/roadmap) (Chinese)
