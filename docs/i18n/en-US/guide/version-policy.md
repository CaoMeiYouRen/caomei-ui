<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
</script>

# Versioning & Compatibility

Latest version: **v{{ theme.version }}**

## Where to get it

- **npm**: `pnpm add caomei-ui` (or `npm i caomei-ui`) — registry page: [npmjs.com/package/caomei-ui](https://www.npmjs.com/package/caomei-ui).
- **GitHub Releases**: [CaoMeiYouRen/caomei-ui releases](https://github.com/CaoMeiYouRen/caomei-ui/releases) (release notes and tags).
- **Changelog**: [CHANGELOG](https://github.com/CaoMeiYouRen/caomei-ui/blob/master/CHANGELOG.md) — breaking changes are listed separately under `BREAKING CHANGES`; the package-format change and downstream fixes are described in [Release guide](./release.md) §9.

## 1.x compatibility policy

From 1.0 on, the library follows Semantic Versioning (SemVer):

- `patch`: fixes and internal adjustments that do not change the public contract.
- `minor`: backward-compatible additions (new components, new optional props / events / slots, new tokens, new locale message keys) and deprecation markers; existing public contracts are neither removed nor redefined.
- `major`: the only release channel for breaking changes; they are listed in the CHANGELOG `BREAKING CHANGES` section and the [Release guide](./release.md), with downstream fix instructions.

The 1.0-preceding versions carried no semantic-versioning guarantee; breaking changes from that period are kept as historical records and are not rewritten. Since 0.7, built-in locales use the "pre-registered plus on-demand subpath" form: `zh-CN` / `en-US` are pre-registered, while other locales are imported from `caomei-ui/locale/<code>` and registered with `registerLocale()`. That form is part of the 1.x frozen surfaces (see [Built-in messages & locales](../components/locale.md)).

## 1.x frozen surfaces

The following **names and semantics** are frozen for 1.x. Additions are backward-compatible increments; removals, renames or redefinitions are breaking changes:

- **Component public contracts**: names and semantics of the existing components' public props / events / slots. Relaxing requiredness (required → optional) is backward-compatible; tightening it (optional → required) is a breaking change.
- **Subpath exports**: the set and semantics of all **13 keys** in `package.json` `exports` (package root, `theme.css`, the 8 locale subpaths, `resolver`, `nuxt`, and the `package.json` convention entry).
- **Root export names**: all **324** names importable from the package root (components, icon, composables, component-level types, locale runtime / types, chart helpers, injection keys, shared types).
- **Token contracts**: the names and purposes of **371** `--caomei-*` tokens (146 with default declarations plus 288 component-page "Style customization" override hooks, 371 after de-duplication; 15 internal-only variables that are not documented are not frozen). Default color and size values may change; pixel-level appearance is not guaranteed.
- **Locale form**: 10 locales, each with 28 namespaces / 80 messages; `zh-CN` / `en-US` are pre-registered and the other 8 are registered on demand via subpaths; namespace names and existing key names / semantics are frozen.
- **`InputNumber` `step` semantics**: frozen to the `NumberField` behavior listed in the [freeze final review record](../../../design/governance/2026-10-24-phase26-m1-1-freeze-final-review.md) §2.6; upgrading `reka-ui` in a way that changes it is a breaking change (or requires a compatibility layer): defaults to 1, falls back to 1 for non-positive values, does not snap to multiples of `step`, and rounds by precision before clamping to min / max.

**Not frozen**:

- Additive capabilities: new components, new optional props / events / slots, new tokens, new locale message keys.
- Implementation and styling details: internal implementation, DOM structure, class names, computed styles and pixel-level appearance, examples and documentation wording.
- Internal modules that are not exported from the package root, the 15 undocumented internal tokens, and transitive dependencies other than `reka-ui`.

The item-by-item list, recomputation commands and rationale are in the [freeze final review record](../../../design/governance/2026-10-24-phase26-m1-1-freeze-final-review.md) (the record is in Chinese only).

## Deprecation policy

- A deprecated item is marked in a **`minor` release**: documentation, type-level JSDoc `@deprecated`, and a `Deprecations` section in the CHANGELOG (currently added manually by the release flow).
- A deprecated item stays usable for **at least one `minor`** and is removed in the **next `major`**.
- A `patch` neither introduces deprecations nor changes the public contract.

## Pre-release channel

- Pre-release versions are published to the npm `next` dist-tag and do not take over `latest`; `latest` moves only when the final version is published.
- The freeze takes effect from the first rc of 1.0; between rc and the final release, only fixes and documentation adjustments are allowed.
- During the rc window, the docs site and README show that rc as the "latest version" (matching `package.json`); the actual `latest` / `next` targets are whatever the registry dist-tags say.

## Exceptions and process

- If a frozen surface must break for security or correctness, it requires a **separate decision** and may only ship in a `major` release; the break must be disclosed in the CHANGELOG `BREAKING CHANGES` section with downstream fix instructions and an executable replacement.
- Frozen surfaces must not break silently in `minor` / `patch`; when a transition is needed, follow the deprecation policy and keep the item for at least one `minor`.
- Lifting or relaxing the freeze requires a separate decision and does not happen automatically under this declaration.

## Pinning recommendations

- Pin the **exact version** when you need a stable baseline (write `"caomei-ui": "<target version>"` without `^` / `~`), and read that version's `BREAKING CHANGES` before upgrading.
- Only use a range (`~` / `^`) once compatibility is confirmed; Vue 3.5+ is a peer dependency and must be installed by the consuming project.
- For pre-release versions, pin an exact version or the `next` dist-tag; do not mix them with `latest`.
- After upgrading, at least re-run the downstream `typecheck` and `build`; the cross-version downstream regression mechanism is described in the [roadmap](/plan/roadmap).
