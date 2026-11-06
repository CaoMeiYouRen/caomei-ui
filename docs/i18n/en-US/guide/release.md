# Release Guide

## Release tool

**semantic-release** infers the version from Conventional Commits and publishes automatically.

> changesets is not used (this project is a single package, and semantic-release is the standard fit).

> **Current status (2026-11-06)**: `release.yml` calls `pnpm release` (semantic-release) directly, the same pattern as momei / caomei-auth. Trigger is `workflow_dispatch` only (master only, enforced by a first-step check that fails the run otherwise); there is no `dry_run` input and no `release` environment approval. npm uses **Trusted Publishing (OIDC, `id-token: write`) and no longer needs `NPM_TOKEN`**; GitHub uses `GITHUB_TOKEN` (semantic-release injects it into the push URL). The workflow keeps the security alert gate, `pnpm verify` and the coverage gate before release. Versions, `CHANGELOG`, version statements, milestone notes, npm publish, GitHub Release and tags are all driven by `release.config.js`. There is no `next` branch: CI publishes `latest` only, while pre-releases still use the local `pnpm release:manual --tag=next`. The local manual flow below remains available as a fallback.

> **1.0 release gate (from 2026-10-26)**: `1.0.0-rc.1` must pass **G0 / G1 (plus G1-F if G1 decides "fix") / G2**, plus the S1 / S2 / S3 pre-release batches, before publishing; the final `1.0.0` must pass **G0 ~ G4** (including G3 rc and downstream verification). **Every `publish` run (including rc) must also pass the security alert gate in [security standard §2.1](/standards/security#_2-1-发布前安全告警门禁) (Chinese).** Do not run the corresponding `publish` before it passes. Target review 2026-11-13, hard stop 2026-11-27; no automatic extension. See [Phase 26 execution-time addition and 1.0 release gate](/design/governance/2026-10-26-phase26-ui-gate-planning.md) §4.

## Version inference

| Commit type | Version change |
|----------|----------|
| `fix` | patch |
| `feat` | minor |
| `BREAKING CHANGE` / `!` | major |
| `docs` / `chore` / `test` / `ci` / `refactor` | no version (unless configured) |

## Release flow

> This is the CI flow for the auto-publish path. It was authorized on 2026-11-03 (Phase 27 M6) and simplified on 2026-11-06 to call semantic-release directly; `1.0.x` used the local manual flow below.

1. Commits follow Conventional Commits (via the `conventional-committer` skill).
2. A maintainer runs the `Release` workflow manually (`workflow_dispatch`) on `master`. There is no environment approval and no `dry_run` input.
3. The workflow runs the security alert gate, `pnpm verify` and the coverage gate, then `pnpm release`. semantic-release automatically:
   - infers the version number;
   - generates / updates `CHANGELOG.md`;
   - syncs the "current version" statements in both READMEs and `docs/plan/roadmap.md` (via `@semantic-release/exec` `prepareCmd`, before `@semantic-release/git` commits them);
   - appends the milestone section from `docs/release-notes/<version>.md` to the release notes;
   - publishes the npm package `caomei-ui` through Trusted Publishing (OIDC, no `NPM_TOKEN`);
   - creates the GitHub Release and tag;
   - explicitly dispatches `downstream-compat.yml` with the released version (`actions: write` + `GITHUB_TOKEN`; `workflow_dispatch` is exempt from the recursion rule) and records the run URL in the job summary; tags created with `GITHUB_TOKEN` do not trigger `v*` workflows.

> **Post-publish verification**: the workflow no longer runs `verify-publish.mjs`; that script remains for the local manual flow. The first real CI run will publish `1.1.0`. See the Chinese guide §5 for the full list.

## Manual release (local)

Releases are performed **locally and manually** for `1.0.x`; CI auto-publish is authorized for `1.1.0` and later (Phase 27 M6, not enabled until that work lands). For 1.0, an rc pre-release goes to the npm `next` dist-tag first; `latest` moves only when the final version is published. Use the single-entry orchestrator:

```bash
# rc pre-release -> npm next
pnpm release:manual run --version=1.0.0-rc.1 --tag=next [--date=YYYY-MM-DD] [--otp=<code>] [--yes]
# final release -> npm latest
pnpm release:manual run --version=1.0.0 --tag=latest [--date=YYYY-MM-DD] [--otp=<code>] [--yes]
```

It chains eight steps: `preflight → api-diff → bump → changelog → sync → publish → verify → announce`. **`api-diff` runs after `preflight`**: `preflight`'s `pnpm verify` builds `dist`, and the diff compares that current build against the **previous published version on the same channel** (`latest` → previous `latest`, `next` → previous `next`), with `--base=<version>` as an override. **`sync` runs before `publish`**: `npm publish` packs the working tree, README included — run it after `publish` and every tarball ships a one-version-stale README (the `1.0.0-rc.1` tarball still said `0.7.0`). Omitting `--tag` infers the channel from the version (a pre-release with a `-` suffix → `next`, a stable version → `latest`); a pre-release with an explicit `--tag=latest` stops during argument validation. **`run` / `preflight` enforce the security alert gate**: open Dependabot and Code Scanning alerts are checked per [security standard §2.1](/standards/security#_2-1-发布前安全告警门禁) and a missing `SECURITY_ALERTS_TOKEN` aborts the run; `publish` re-runs the gate right before the irreversible step (a `--dry-run` preview skips it), and the counts plus any exemptions still go into the release governance record. `preflight` then runs `pnpm verify`, then `pnpm test:coverage` + `pnpm check:coverage` for coverage evidence. `publish` passes the target dist-tag explicitly, and `verify` reads the registry `dist-tags` to assert `dist-tags.<tag>` equals the published version; `latest` must never point at a pre-release. For pre-release versions `announce` passes `--prerelease`, and for any non-`latest` channel it passes `--latest=false`, so an rc or a staged release does not become the GitHub Latest Release. Mutating steps (`bump` / `changelog` / `publish` / `sync` / `announce`) require an explicit `--yes`; use `--dry-run` to preview. If the release deprecates public API, add a `Deprecations` section to the CHANGELOG manually (the generator does not group it yet). A major release also needs a hand-written milestone section (milestones / upgrade notes / known limitations, authored in that release's governance record): the generator only groups commits, so a range like `v1.0.0-rc.1..v1.0.0` collapses to a couple of fixes. Insert it **after** the `changelog` step and **before** `announce` — `announce` extracts that very section as the GitHub Release note, and inserting earlier gets overwritten when the CHANGELOG is regenerated. Commit it separately as `docs(changelog): 补充 <v> 里程碑段` and confirm the extracted note with `announce --dry-run` (`note <N> 行`). **Run a major release stepwise** (`api-diff → bump → changelog → insert & commit separately → sync → publish → verify → announce`); do not re-run the `changelog` step or the whole `run` chain afterwards, or the milestone block is overwritten. The script never pushes — run `git push origin master --follow-tags` yourself. See the [release guide](/guide/release) (Chinese) §3 for the full runbook, the tag placement note and the release-metadata exemption boundary.

## Pre-release checks

- **Security alert gate**: `preflight` and `publish` enforce the open and dismissed Dependabot and Code Scanning alert check per the [security standard §2.1](/standards/security#_2-1-发布前安全告警门禁) (Chinese; `auto_dismissed` is excluded), and a missing `SECURITY_ALERTS_TOKEN` aborts (fail-closed); a `--dry-run` preview skips the gate. **Critical must be zero and cannot be exempted, even when dismissed**; **high must be fixed, or exempted with a recorded `category`** (see §2.1); medium / low may be deferred. CI runs the same check in the `Security Alerts` workflow with the `SECURITY_ALERTS_TOKEN` secret (Dependabot alerts require a user PAT); locally put the token in `.env.local` at the repo root (gitignored via `*.local`) or export it for a single run, then use `pnpm check:security-alerts`. Record the counts and any exemptions in the release governance record.
- **Registry (local manual flow only)**: set `NPM_CONFIG_REGISTRY=https://registry.npmjs.org` for the release session. A mirror registry (for example `registry.npmmirror.com`) returns `ENEEDAUTH` for `npm whoami` and cannot publish; an expired `//registry.npmjs.org/:_authToken` returns `401`. Confirm `npm whoami` and `npm owner ls caomei-ui` before publishing. CI uses Trusted Publishing (OIDC) and needs no token.
- All quality gates pass (lint / typecheck / test / build).
- Coverage evidence is generated and checked with `pnpm test:coverage` + `pnpm check:coverage` (also part of `preflight`).
- Build output smoke test: confirm ESM, type declarations, CSS and subpath exports work.
- API surface diff: the `api-diff` step compares the current `dist` against the previous published version on the same channel. Removed / renamed declaration files or exports, removed members of non-extending exported types without an index signature, and optional → required tightening block the release; additions do not. Other content changes are listed for manual type review. The step is skipped when the channel has no previous version or the target is already the channel's current version. Use `pnpm release:manual api-diff --version=<v> [--base=<version>]` to run it alone (run `preflight` first, or it uses the existing `dist` and prints a warning); `--dry-run` still performs the read-only diff and prints the conclusion, degrading to a note when the registry or baseline is unavailable. An approved major can pass `--allow-breaking=<governance-record-path>` (must be an existing `.md` file under `docs/design/governance/`; the resolved path is printed for the record).
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
- **CI release event chain (M6-4)**: tags / releases created with `GITHUB_TOKEN` do **not** trigger `v*` workflows, but `workflow_dispatch` is exempt from the recursion rule. After a successful publish, `Release` runs `gh workflow run downstream-compat.yml -f caomei-ui-version=<v>` from a dedicated job (`actions: write` + `GITHUB_TOKEN`) and records the run URL in the job summary.
- **Checked list (register on onboarding)**: registered in the workflow's `matrix` — **in scope** means it is registered in the `matrix`.
  - **In scope**: `dependfix` (`apps/platform`, pilot).
  - **Consumed but not onboarded** (pending incremental registration): `momei` (root package) — **single blocker**: `momei`'s `build` (`NODE_OPTIONS=--max-old-space-size=6144 nuxt build`) has **unverified credential-free feasibility** on the upstream runner (`typecheck` = `nuxt typecheck` is comparatively light; `pnpm --filter <name>` **can select the root project by its package name**, so the existing override step needs no parameterising). Trigger = that verification, or a user request.
  - **Roadmap target downstreams with zero consumption today**: `caomei-auth` / `rss-impact-next` / `afdian-linker` — register on onboarding.
- **Trigger and capacity**: triggered **once per caomei-ui release tag (`v*`)** (manual runs allowed); scope is at least `typecheck` + `build`, **excluding** e2e / visual regression / full unit tests / coverage. **The downstream default branch is a moving target**: the workflow records the downstream revision (SHA) for attribution — a red run may be caused by the downstream's own changes, not a caomei-ui regression.
- **Ownership and status**: this mechanism is [roadmap Phase 8](/plan/roadmap); the workflow is **ready and verified by three real runs** — run #1 (2026-10-12, registry latest `0.6.0`, `dependfix @ 46c6fb61`, see `docs/design/governance/2026-10-12-phase22-m1-1-downstream-compat-first-run.md`), **run #2 (2026-10-13, explicit version input `0.5.0`, a **version difference** against the downstream's pinned version, `dependfix @ edbe5e04…`, see `docs/design/governance/2026-10-13-phase23-m2-1-downstream-compat-explicit-version-run.md`)** and **run #3 (2026-10-13 UTC / 2026-10-14 local, **negative control**: explicit input `0.2.0`, a known-incompatible version → `Typecheck downstream` **red**, `dependfix @ 1a6aca15…`, see `docs/design/governance/2026-10-14-phase24-m1-2-downstream-compat-negative-control.md`)**.
- **Discriminating-power wording (never read a green run as "compatibility verified")**: **pipeline integrity** (runtime sound, attributable) and **reinstall actually applied** (the override really switched versions) **hold**; **regression discriminating power** (telling "new version breaks downstream" from "does not") **now holds via the negative-control path** — run #3 installed the known-incompatible `0.2.0` and went red as expected, with all 6 TS diagnostics attributable to the `DataTable` multi-sort / row-grouping / row-expansion surface that only landed in `0.3.0`. **The positive direction is still unverified**: a case with a **target version newer than the downstream's pinned version** (the next release, tag-triggered) has not run yet. See the Phase 8 scope evaluation record (`docs/design/governance/2026-10-08-phase8-downstream-regression-scope-evaluation.md`) for the scope and form.

## Rollback and deprecation

> "Deprecation" here means the **npm version marker** (`npm deprecate`), not the API deprecation policy in [Version & compatibility](/guide/version-policy). The full ladder, time budget and commands live in the [release guide](/guide/release) (Chinese) §8 — that section is the single source of truth; this is a summary.

- **Severity**: **P0** = downstream cannot install (resolution failure / broken tarball / engines) → **mark and roll `latest` back within minutes**, then patch. **P1** = installable but downstream `typecheck` / `build` fails, or a core component breaks at runtime → `deprecate` within 24 hours, patch or roll back within 72 hours. **P2** = cosmetic → normal patch, no deprecation.
- **Ladder**: `deprecate` (warns only — it does **not** block installs) → patch on `latest` → `npm dist-tag add caomei-ui@<previous-stable> latest` as the fallback channel → restore once fixed. The fallback **only affects un-pinned new installs**; downstreams locked to `1.0.0` or ranged on `^1.0.0` still resolve the broken version and need the patch or an explicit pin.
- **Never**: `unpublish`, rewrite or move a pushed tag, or overwrite a published tarball. The GitHub Release body and its Latest flag may be edited (`gh release edit v<version> --latest=false`).
- **Signals must agree** after a rollback: npm `dist-tags`, the GitHub Release Latest flag, and the "current version" statements in the README files. Undo a wrong deprecation with `npm deprecate caomei-ui@<version> ""`.
- **2FA**: `npm deprecate` and `npm dist-tag` also need `--otp=<code>` when 2FA is enabled.

## Related docs

- [Git standards](/standards/git) (Chinese)
- [Architecture - Release pipeline](/design/architecture#_7-发布链路) (Chinese)
- [Roadmap](/plan/roadmap) (Chinese)
