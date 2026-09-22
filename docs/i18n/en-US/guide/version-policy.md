<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
</script>

# Versioning & Compatibility

Latest version: **v{{ theme.version }}**

## Where to get it

- **npm**: `pnpm add caomei-ui` (or `npm i caomei-ui`) — registry page: [npmjs.com/package/caomei-ui](https://www.npmjs.com/package/caomei-ui).
- **GitHub Releases**: [CaoMeiYouRen/caomei-ui releases](https://github.com/CaoMeiYouRen/caomei-ui/releases) (release notes and tags).
- **Changelog**: [CHANGELOG](https://github.com/CaoMeiYouRen/caomei-ui/blob/master/CHANGELOG.md) — breaking changes are listed separately under `BREAKING CHANGES`; the package-format change and downstream fixes are described in [Release guide](/en-US/guide/release) §9.

## 0.x compatibility policy

- During 0.x there is **no semver compatibility guarantee**: a `minor` release may contain breaking changes (for example the style entry moved from `caomei-ui/styles.css` to `caomei-ui/theme.css`, and the package no longer ships a monolithic stylesheet).
- Every breaking change is disclosed in the CHANGELOG `BREAKING CHANGES` section and in the [Release guide](/en-US/guide/release), together with downstream fix instructions; the decision to enter 1.0 is made separately.
- A `patch` release only contains fixes and internal adjustments that do not change the public contract.

## Pinning recommendations

- Pin the **exact version** when you need a stable baseline (write `"caomei-ui": "<target version>"` without `^` / `~`), and read that version's `BREAKING CHANGES` before upgrading.
- Only use a range (`~` / `^`) once compatibility is confirmed; `Vue 3.5+` is a peer dependency and must be installed by the consuming project.
- After upgrading, at least re-run the downstream `typecheck` and `build`; the cross-version downstream regression mechanism is described in the [roadmap](/plan/roadmap).
