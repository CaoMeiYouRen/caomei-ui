# Release Guide

## Release tool

**semantic-release** infers the version from Conventional Commits and publishes automatically.

> changesets is not used (this project is a single package, and semantic-release is the standard fit).

> **Current status**: `release.yml` is in place, but the publish step is not enabled yet; it will be enabled after npm credentials are configured (`NPM_TOKEN` or npm Trusted Publisher / OIDC).

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

## Pre-release checks

- All quality gates pass (lint / typecheck / test / build).
- Build output smoke test: confirm ESM, type declarations, CSS and subpath exports work.
- Public API changes are confirmed backward compatible or a major is planned.
- The docs site builds.

## Downstream compatibility regression (deferred)

When a component library change may affect downstream projects, run the CI of the onboarded downstream projects as well to check for compatibility issues.

**Enable conditions** (all three):

1. caomei-ui is basically usable;
2. at least one downstream project is onboarded;
3. after a period of stable use, a new library change appears.

**Regression scope**: the onboarded downstream projects (dependfix/platform, caomei-auth, rss-impact-next, momei, afdian-linker), covering at least their typecheck and build.

**Recommendations**:

- Run key downstreams for patch changes; run all onboarded downstreams for minor / major.
- Trigger through a cross-repo mechanism (`repository_dispatch` or a reusable workflow).
- Any typecheck / build failure is a compatibility blocker and must not be released directly; decide by semantic versioning whether to fix the library or adapt the downstream.

> This mechanism does not block project setup and early migration; it lands as an independent stage (roadmap Phase 8) after stabilization.

## Related docs

- [Git standards](/standards/git) (Chinese)
- [Architecture - Release pipeline](/design/architecture#_7-发布链路) (Chinese)
- [Roadmap](/plan/roadmap) (Chinese)
