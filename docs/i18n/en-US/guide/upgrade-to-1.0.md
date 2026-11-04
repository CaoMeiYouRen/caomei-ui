# Upgrade to 1.0

This page is for consumers upgrading `caomei-ui` from 0.x to **1.0.0**: it gives a version snapshot (repository readings), upgrade notes per release segment, the publicly disclosed known limitations and an upgrade checklist.

> Source of truth: version changes are governed by the corresponding section of the repository [CHANGELOG](https://github.com/CaoMeiYouRen/caomei-ui/blob/master/CHANGELOG.md); compatibility promises and frozen surfaces are in [Versioning & Compatibility](./version-policy.md); per-component differences when moving from PrimeVue are in [Migration from PrimeVue](./primevue-migration.md). This page does not duplicate the mapping tables and does not promise behaviour beyond the CHANGELOG.

## Version snapshot (read 2026-11-04)

Read from both repositories' `master` HEAD on 2026-11-04 (`latest` = `1.0.0`, `next` = `1.0.0-rc.1`). The table below contains **repository declaration and lockfile readings**, not downstream runtime verification:

| Downstream | Declared / locked | master revision | Result |
| --- | --- | --- | --- |
| dependfix (`@dependfix/platform`) | `1.0.0-rc.1` (`package.json` and lockfile agree) | `f1b7166` | Not on GA yet; rc.1 and GA have no runtime difference (momei measured tarball diff) |
| momei (root package) | `1.0.0` (`package.json` and lockfile agree) | `f058193` | rc.1 → GA complete |

- **Pre-upgrade baseline**: both repositories were measured at `0.6.0` on 2026-10-13; momei then moved to `0.7.0` (2026-10-24), `1.0.0-rc.1` (2026-11-01) and `1.0.0` (2026-11-03), while dependfix moved to `0.7.0` (2026-10-25) and `1.0.0-rc.1` (2026-10-30).
- **Coverage**: this page covers both release segments from `0.6.0` to `1.0.0` (`0.7.0` / `1.0.0`), with each item taken from the matching CHANGELOG section. At the start of the task both repositories were already on `1.0.0-rc.1` / `1.0.0`, so the **only remaining upgrade path is `1.0.0-rc.1 → 1.0.0`** (no minor boundary; the runtime artifacts are byte-identical — see "Downstream feedback and boundaries").
- **Compatibility evidence**: the downstream check run [`41482763157`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/41482763157) for tag `v1.0.0` is successful (dependfix @ `08ad8f1`, target `1.0.0`, `typecheck` + `build`).

## Upgrade path by release segment

### 0.6.0 → 0.7.0

- **New components**: `Alert`, `Chart`, `Tooltip`, `Menu`, `Breadcrumb`, `Row` / `Col`; `Chart` is an optional peer loaded on demand.
- **Locale form**: built-in locales moved to "pre-registered plus on-demand subpath"; `zh-CN` / `en-US` are pre-registered and other locales are imported from `caomei-ui/locale/<code>` and registered with `registerLocale()`. 0.x carries no semantic-versioning guarantee and this form change is not listed under `BREAKING CHANGES`; consumers that referenced the old aggregate locale entry still need to follow [Built-in messages & locales](/en-US/components/locale).
- **Responsive**: the 769–1023px gap was fixed and the viewport matrix expanded; pages with custom breakpoints in that range need a re-check.
- Everything else is additive capability or internal refactoring and does not change existing component contracts.

### 0.7.0 → 1.0.0

- **1.x compatibility promise**: public props / events / slots, the 13 `exports` keys, package-root export names, `--caomei-*` tokens, locale namespaces and `InputNumber` `step` semantics enter the frozen surfaces; breaking changes only ship in a `major` with a deprecation window (see [Versioning & Compatibility](./version-policy.md)).
- **Theme and colour roles**: three new presets (`sakura` / `forest` / `ink`); new `--caomei-color-<tone>-text` and `--caomei-color-control-border`; control borders and semantic text now use the new roles.
- **DataTable behaviour**: header select-all covers only the current page; selection / expansion under `lazy` require an explicit `rowKey`; the horizontal scroll container is keyboard reachable.
- **Button states and locales**: hover / active are derived from existing tokens (default preset keeps ≥ 4.5:1 across the three states); 10 built-in locales.
- **Runtime requirement**: `engines.node` ≥ 22.

## 1.0 upgrade notes

The following 4 items come from the CHANGELOG "Upgrade notes" section; confirm each before upgrading:

1. **Node ≥ 22**: `0.7.0` required ≥ 20, and Node 20 reached EOL in 2026-04; upgrade the runtime before the dependency.
2. **DataTable select-all semantics narrowed**: header select-all changed from "the whole table" to "the current page"; under `lazy`, selection / expansion require an explicit `rowKey` and no longer reuse in-page index keys. Pages that need "select all filtered results" must aggregate `selection` in the parent or add their own selection bar.
3. **Visible appearance changes**: control borders use the darker `--caomei-color-control-border`; `soft` / `outline` semantic text uses the `*-text` roles, so text in some presets is slightly darker. Re-check visual baselines against the new roles.
4. **Consumers that override tokens** (the "upgrade note" among the seven public items): if `--caomei-color-border` was carrying control borders, switch to `--caomei-color-control-border`; contrast after an override is the consumer's responsibility.

## Six disclosed known limitations + one upgrade note (seven public items)

These map one-to-one to the six "Known limitations" items plus the last "Upgrade notes" item (token override responsibility) in the 1.0.0 CHANGELOG; they describe upgrade impact and action only and do not change the original conclusions.

| Item | Fact | Impact and action when upgrading |
| --- | --- | --- |
| Existing brand-preset contrast gaps | momei light `success` three states 2.279 / 2.643 / 3.045; caomei `primary-solid` 4.17 | Kept as an existing brand decision; neither fixed nor worsened in this version. Projects requiring AA should use the default preset or override |
| Calendar / RichTextEditor interactive borders | Previous / next month navigation buttons and the editor container border are below 3:1 | Not included in this contrast assertion surface; override and re-check when non-text contrast is required |
| Chromium-only regression | Standing 390 / 768 / 1280 (plus targeted 320 / 900); 375px only for the gallery and DataTable keyboard-scroll checks; Firefox / WebKit are not included | Test on your target engine after upgrading; do not extrapolate Chromium results to all three engines |
| Disabled-state exemption | Exempt under WCAG 1.4.3 / 1.4.11 | Disabled-state contrast is not guaranteed; do not include it in contrast acceptance |
| Visual regression tolerance | Snapshot comparison with `threshold: 0.1` + `maxDiffPixels: 100` | Tiny colour differences on very small components may not trigger a diff; use computed-style sampling as the primary evidence for colour regressions |
| Phase-one five locales are AI-generated | `es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR`; native review is still pending | Wording may be unnatural; open an issue if you find problems and do not treat those five locales as natively reviewed |
| Token-override contrast responsibility (upgrade note) | Contrast after a consumer overrides `--caomei-*` is the consumer's responsibility | Re-check token overrides when upgrading; switch old `--caomei-color-border` control borders to `--caomei-color-control-border` |

## Upgrade checklist

- [ ] Read the target version's CHANGELOG `BREAKING CHANGES` / upgrade notes / known limitations, and record the current pin and downstream revision;
- [ ] Pin the target version exactly (do not cross a minor with `^` / `~`) and commit the upgrade on its own, separate from feature changes;
- [ ] Move Node to 22 or later;
- [ ] Search `DataTable` usages of `selectAll` / `lazy` / `rowKey`, and confirm select-all semantics and cross-page selection;
- [ ] Search overrides of `--caomei-color-border` and semantic text colours, and move to `control-border` / `*-text`;
- [ ] For locales other than `zh-CN` / `en-US`, import `caomei-ui/locale/<code>` and call `registerLocale()`;
- [ ] When using Tooltip, place `CaomeiTooltipProvider` at the app root;
- [ ] Re-run the downstream `typecheck` and `build` (same scope as the downstream compatibility check);
- [ ] Re-run visual regression / computed-style assertions; attribute colour differences to the new roles instead of loosening thresholds;
- [ ] Record the version, downstream revision, verification results and uncovered items in the upgrade log.

## Downstream feedback and boundaries

### Feedback received

- **momei**: `0.7.0` (2026-10-24) confirmed `theme.css` and the consumed runtime were unchanged and the component list grew from 81 to 95; `1.0.0-rc.1` (2026-11-01) added the five `-color-*-text` roles, kept the library default for `control-border` and re-captured 10 visual baselines; `1.0.0` (2026-11-03) measured GA and rc.1 as byte-identical for `.js` / `.mjs` / `.css` / `.vue` artifacts, with the same `dist/styles/index.css` sha256 and differences only in `package.json`, README and the member order of 28 `.d.ts` files; `visual` 18/18, `parity` 34/34, `typecheck` / `lint` 0 errors and 5,142 passed / 1 skipped.
- **dependfix**: the `1.0.0-rc.1` upgrade (2026-10-30) pinned exactly, overrode `--caomei-color-primary-text`, and rebuilt 19 visual baselines because of the `control-border` and `-text` roles; the downstream check run `41482763157` for tag `v1.0.0` is successful.
- **This repository**: the `v1.0.0` downstream check covers only `typecheck` + `build`, not e2e, visual regression or the full unit suite.

### Gaps and boundary statement

- **Not yet reported by momei**: momei's phase 69 completed and was archived on 2026-11-03 (the overlay-family page results were reported), while **page-level upgrade feedback from phases 70–71 has not been reported yet**; this page does not treat momei's three upgrade re-checks as full 1.0 acceptance. momei is also not in this repository's `downstream-compat.yml` matrix ([Backlog](/plan/backlog) (Chinese) §1.8, a conditional candidate), so the 1.0 downstream compatibility evidence comes from dependfix only.
- **Not yet reported by dependfix**: at snapshot time it is still on `1.0.0-rc.1`, and page-level feedback after the GA upgrade has **not been reported**; its 19 rebuilt baselines only prove the rc.1 token-role impact and are not a full GA regression.
- **This repository's boundary**: downstream migration is executed in each downstream repository; this repository maintains only the library-side upgrade notes and version-reading snapshot and does not run page-level verification for downstreams. Behaviour not declared in the CHANGELOG is not promised here.
- **Time boundary**: the version snapshot is the `master` HEAD on 2026-11-04; later downstream commits may have changed the pinned version, so re-check before upgrading.

## See also

- [Versioning & Compatibility](./version-policy.md) (1.x promise, frozen surfaces and pinning)
- [Migration from PrimeVue](./primevue-migration.md) (component mapping and migration pitfalls)
- [Theming and styles](/design/theming) (Chinese; token semantics and override recipes)
- [Built-in messages & locales](/en-US/components/locale) (locale subpaths and registration)
- [CHANGELOG](https://github.com/CaoMeiYouRen/caomei-ui/blob/master/CHANGELOG.md) / [GitHub Releases](https://github.com/CaoMeiYouRen/caomei-ui/releases)
