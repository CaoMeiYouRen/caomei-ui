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

## 0.x API freeze window

> Starts at the **current release** (shown at the top of this page, derived from `theme.version` — the 0.3.x line; the `x` is derived from the site version, never hand-written). This declaration aligns with dependfix migration assessment §12, trigger condition 3 ("caomei-ui has shipped a stable 0.x release and declares a 0.x API freeze window").

**Frozen until 1.0 (no breaking changes)**:

- **Component public contracts**: names and semantics of the existing components' public props / events / slots (adding optional props / events / slots is a backward-compatible increment, not a break).
- **Subpath exports**: the set and semantics of `caomei-ui`, `caomei-ui/theme.css`, `caomei-ui/resolver`, `caomei-ui/nuxt`, plus the `./package.json` convention entry — i.e. all 5 keys of `package.json` `exports`.
- **Public export names**: root-exported component names (`Caomei*`), composables (`use*`), locale types and the built-in message namespaces (names and semantics of **existing** keys; **adding** keys is a backward-compatible increment, while **removing / renaming** existing keys is a break).
- **Token contracts**: names and purposes of the semantic `--caomei-*` tokens (values may change; names and semantics are frozen).

**Still subject to change (not frozen)**:

- **Additive capabilities**: new components, new optional props / events / slots, new tokens, new locale message keys — all backward-compatible increments.
- **Implementation and styling details**: internal implementation, DOM structure, class names, computed styles and pixel-level appearance, examples and documentation wording; no pixel-level guarantee.
- **Internal modules and types that are not exported from the package root**.

**Exceptions and process**:

- If a frozen surface must break for security or correctness, it requires a **separate decision**, a `minor` bump, disclosure in the CHANGELOG `BREAKING CHANGES` section, and downstream fix instructions; no silent breaks.
- Lifting the freeze (entering 1.0 or relaxing it early) requires a separate decision and does not happen automatically under this declaration.
- Relationship to the "0.x compatibility policy" above: the frozen surfaces **narrow** that section's "a `minor` release may contain breaking changes"; non-frozen surfaces still follow it.

## Pinning recommendations

- Pin the **exact version** when you need a stable baseline (write `"caomei-ui": "<target version>"` without `^` / `~`), and read that version's `BREAKING CHANGES` before upgrading.
- Only use a range (`~` / `^`) once compatibility is confirmed; `Vue 3.5+` is a peer dependency and must be installed by the consuming project.
- After upgrading, at least re-run the downstream `typecheck` and `build`; the cross-version downstream regression mechanism is described in the [roadmap](/plan/roadmap).
