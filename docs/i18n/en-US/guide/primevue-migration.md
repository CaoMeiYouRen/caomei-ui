# Migration from PrimeVue

This page is for teams moving from PrimeVue (v4) to caomei-ui: a practical migration path plus the pitfalls that come up most often.

> **The authoritative per-component mapping is [Design spec §7](/design/design-spec) (Chinese)** — this page covers the workflow, shared conventions and pitfalls only, and does not duplicate the mapping tables. Component pages carry a "Migration from PrimeVue" section at the end of the page (placement rule in [Documentation site §4](/design/documentation-site), Chinese).

## Migration workflow

1. **Coexistence**: caomei-ui and PrimeVue can live side by side — components use the `Caomei` prefix, classes `caomei-` and design tokens `--caomei-`, which do not collide with PrimeVue's `p-*` / `--p-*` namespaces. During migration, switch **page by page behind a route / page allowlist** so the regression surface stays controllable.
2. **Theme and tokens**: map the PrimeVue theme variables to this library's tokens (`--p-*` → `--caomei-*`) before replacing components; see [Theming and styles §4](/design/theming) (Chinese) for token semantics and override recipes. The default light/dark themes ship with the package (base layer: `caomei-ui/theme.css`); `data-preset` switches presets.
3. **Component replacement**: decide per component whether to replace directly or bridge first (next section), then work through the mapping table in [Design spec §7](/design/design-spec) (Chinese), starting with the three highest-impact differences — controlled-field naming, icon form, and tone/size tiers (see [Common pitfalls](#common-pitfalls)).
4. **Text and locale**: built-in strings (close / clear / pagination / loading, and so on) are injected through `CaomeiConfigProvider`, falling back to Simplified Chinese when nothing is provided; see [Built-in text and locales](/en-US/components/locale).
5. **Page-by-page verification**: after each page, check interaction, accessible names, narrow-screen behavior and dark mode; the narrow-screen acceptance criteria are in [Responsive design §4](/design/responsive) (Chinese).

## Migration strategy: replace directly or bridge

Decide per component by its **impact surface**; do not apply one approach to every component.

| Signal | Replace directly | Bridge first, converge page by page |
| --- | --- | --- |
| Number of call sites | few and concentrated (this page's rule of thumb, not quantified) | many, across pages / shared components |
| Scope of differences | tag and a few prop renames | controlled fields, event payloads, slots and type contracts change together |
| Consumers of the old contract | only the current page | parent components, shared components, e2e / visual assertions or external callers rely on the old props / events (such as `@hide`) |
| Nature of the difference | equivalent renaming | needs a coexistence period (imperative APIs, directives, global tokens) |

When replacing directly, work through the §7 mapping table site by site; **do not build a bridge layer just to save edits** — the bridge itself needs maintenance and retirement. Bridge only when it clearly shrinks the change surface, and prefer the layer with the smallest surface: styles / tokens → functions / mappings → components.

### Three forms of bridging

| Layer | When it fits | How | Measured example |
| --- | --- | --- | --- |
| Styles / tokens | unmigrated pages still get their theme from PrimeVue | map `--p-*` to `--caomei-*` side by side, keeping `--p-*` for unmigrated components | momei appends a semantic-token bridge block at the end of its global styles, always mapping `--p-* → --caomei-*`, with light / dark computed values locked by contract tests |
| Functions / mappings | enum renames, value conversions or imperative APIs appear in bulk | converge them in a util, mapping table or Promise adapter so call sites only swap the entry point | dependfix converged `TagSeverity` into `ComponentTone` and routed `pi pi-*` icons (63 uses / 30 unique) through one mapping table |
| Components | call sites span files and the old props / events / slots are still relied on | a thin wrapper keeps the old contract and swaps the internals, so call sites only change the tag | momei routes `v-tooltip` (84 uses / 36 files) through `<AppTooltip>` and normalizes `null → ''` for setting fields in a thin adapter; dependfix uses `computed` to bridge Drawer's existing `visible` contract and re-emit `hide` (see [Common pitfalls](#common-pitfalls)) |

Typical triggers for a component bridge: the difference needs renaming at every site (`v-model:visible` → `open`), the library has no matching event (`Drawer` has no `hide`), the type contract is narrower (field components only accept `string | undefined`), or the number of call sites clearly exceeds the size of the bridge itself. Conversely, with one or two call sites a bridge costs more than the direct edit.

> Evidence for these forms: momei's [migration plan §5.2 / §5.5 / §6.2](https://github.com/CaoMeiYouRen/momei/blob/master/docs/design/governance/2026-09-18-primevue-to-caomei-ui-migration-plan.md) (token bridge / overlay wiring / property-level mapping) and dependfix's [migration record §15.12](https://github.com/dependfix/dependfix/blob/master/docs/design/governance/caomei-ui-migration.md) (snapshots: momei 2026-11-03, dependfix 2026-10-31). Both are evidence for the approach only; component differences are still governed by §7 and the component pages.

### Bridging layer rules and retirement

- **One place, marked as temporary**: each bridge file states why it exists, which differences it covers, and its removal condition; keep it apart from business components (adapters under `components/`, mappings and conversions under `utils/`).
- **Bridge the contract, not the look**: map old props / events / types only; do not add style overrides to match pixels. Register visual differences as intentional per [Common pitfalls](#common-pitfalls) and §7.
- **Keep token bridges out of named `@layer`s**: the library's base layer is unlayered and loads later, so a bridge inside `@layer` is silently overridden by its `:root` (no error in pixels or build); use a selector with higher specificity than the library `:root`, such as `html:root`.
- **Forward attrs in `as-child` setups**: when a bridge component is used as a child of an outer trigger (a Tooltip inside `DropdownMenuTrigger` / `PopoverTrigger`), it must set `inheritAttrs: false` and bind `$attrs` to the inner trigger, otherwise the outer `aria-*` and events are swallowed.
- **Mind Nuxt auto-import names**: components in a `components/` subdirectory are named with the directory prefix (`settings/setting-input.vue` → `AdminSettingsSettingInput`). A bridge in a subdirectory must either import explicitly or use the full name, otherwise the tag silently resolves to an unknown element and the page renders fewer controls without an error.
- **Retire when call sites reach zero**: a bridge is deletable code. Remove it per its removal condition when the migration closes out, and register anything that cannot be removed yet in the [Backlog](/plan/backlog) (Chinese) rather than keeping it indefinitely.

## Three paths for style customization (Toast as the example)

PrimeVue toasts are often overridden per tone for background / border / text / shadow. When migrating, pick one of the following in order, and do not rebuild a style layer just to match the old look:

1. **Accept the defaults (recommended)**: the default look is designed around semantic colours and the light / dark / preset themes, and is locked by the contrast matrix and visual baselines. Register it as an intentional difference instead of writing overrides.
2. **Override tokens**: to keep brand tone colours, override `--caomei-toast-{tone}-{bg,border,text,shadow}` on the Provider or any ancestor. The variables inherit into the item, so no extra selector specificity is needed; re-check text contrast after overriding.
3. **Thin wrapper**: split by need — wrapping `useToast` suits a shared call entry or preset copy; changing the icon, layout or extra fields requires wrapping a component (built-in icons are mapped by tone, so a `useToast` wrapper cannot change the look). In the default styles the tone blocks only declare variables inside `:where()`, so **variable-level** single-class overrides always win; **property-level** single-class overrides (`.caomei-toast--success { background-color: … }`) tie with the base class at 0,1,0 and must load after the consumer stylesheet or raise specificity.

```css
/* Path 2: change tone colours only, no new class */
.theme-brand {
    --caomei-toast-success-bg: #ecfdf3;
    --caomei-toast-success-text: #05603a;
}
```

```ts
// Path 3: one thin entry point (only when the structure differs)
const toast = useToast()
function notifySaved(): void {
    toast.success({ title: 'Saved' })
}
```

> Every default falls back to the global token (no visual change until overridden); `-text` does not control the description or action button, and `-border` accepts a colour only and excludes the left accent.

## Common pitfalls

| Topic | PrimeVue | caomei-ui | What to do |
| --- | --- | --- | --- |
| Controlled fields | `v-model:visible` / `v-model:value` | `v-model:open` / `v-model` | Rename every controlled field, not just the component tag |
| Semantic color | `severity` | `tone` + `variant` | `secondary` / `contrast` → `neutral`; `info` → `primary` (lossy approximation) |
| Size tiers | `small` / `large` | `sm` / `lg` | Old tier names are rejected by the type checker |
| Icons | `icon="pi pi-x"` string class | `#icon` slot + an `@lucide/vue` component | String classes are not recognized; pass a component instead — see [Icons](/en-US/components/icons) |
| Overlay title | `header` | `title` | Rename on Dialog / Drawer and other overlays |
| Validation state | `class="p-invalid"` | `:invalid` | Replace the class with the controlled prop |
| Full width | `fluid` | `width: 100%` by default | Drop `fluid`; **the selector family also carries a `20rem` width cap** — set the matching cap token to `none` when you truly need full width (see §7 and [Theming and styles §4.1](/design/theming), Chinese). **Exception**: `Button` uses `block` (span the parent width) and `SplitButton` does not implement `fluid` (it sizes to its content) |
| Option fields | `option-label` / `option-value` | `optionLabel` / `optionValue` | Same semantics, different naming style |
| Searchable single select | `Select` + `filter` | Use `CaomeiAutoComplete` | Reka Select has no filter primitive (a search box inside the panel violates the ARIA structure); see §7 and [Backlog](/plan/backlog) (Chinese) |
| Tag entry | `Chips` (renamed `InputChips` in v4) | `CaomeiTagsInput` (**preferred**); `CaomeiAutoComplete` + `multiple` (fallback) | `separator` → `delimiter`; `allowDuplicate` **defaults the other way** (duplicates are rejected by default here); see §7 and [TagsInput](/en-US/components/tags-input) |
| Event payloads | e.g. `Switch` `change` passes the native event | passes the resulting boolean | Same event name, different payload — update the handler signature |
| Date range | `selection-mode="range"`; `manual-input="false"` | `selectionMode="range"`; `v-model` is `[Date, Date]` (`null` when empty) | `multiple` is not implemented; this component does not support typing; `range` and `showTime` cannot be combined; the static type is `Date \| [Date, Date] \| null`, so single-date pages must widen it to that union; see [DatePicker](/en-US/components/date-picker) |
| Button icon-only shape | — | New `iconOnly` boolean prop; when enabled the button becomes square, the icon is centered, no text is rendered, **`label` is required for an accessible name** (maps to `aria-label`); `iconPosition` is ignored | See [Button](/en-US/components/button) and [#iconOnly shape](/en-US/components/button#icon-only-button) |
| Select custom trigger display | — | New `#value` slot (scope `{ option, label, selected }`), affects trigger only; the panel still uses `#option` | See [Select](/en-US/components/select) and [#custom-trigger-display](/en-US/components/select#custom-trigger-display) |
| Button `iconOnly` ignores `iconPosition` | — | When `iconOnly=true` the icon is always centered, `iconPosition` is ignored, **`label` is required** (otherwise no `aria-label`) | See [Button](/en-US/components/button) and [#icon-only-button](/en-US/components/button#icon-only-button) |
| Slot naming | column-level `#body` / `#header` | `#cell-{key}` / `#header-{key}` | Named by column `key`; scope fields are documented on the component page |
| Table sort model | `sort-mode` / `multi-sort-meta` / `default-sort-order` | `sortMode` / `multiSortMeta` / `sortDescFirst` | Multiple sort is a controlled model (`v-model:multiSortMeta`); `default-sort-order` becomes the **table-level** `sortDescFirst` (no per-column form here); **do not enable `sortDescFirst` globally** to mirror per-column `default-sort-order` — measured to change the click cycle on non-business columns; carry the default direction in the initial `multiSortMeta`; see §7 and [DataTable](/en-US/components/data-table) |
| Table grouping and row expansion | `row-group-mode` / `group-rows-by` / `expandable-row-groups` / `expanded-rows` / `Column expander` | same names in camelCase, plus `v-model:expandedRowGroups` / `v-model:expandedRows` and `#groupheader` / `#expansion` | Groups split on **consecutive equal values**; expandable groups start collapsed; the expansion column is written `{ key, expander: true }`; the grouping column keeps a blank placeholder cell in data rows (PrimeVue omits it), so filter `columns` by `groupRowsBy` when the column count must match; see §7 and [DataTable](/en-US/components/data-table) |
| Imperative overlays | `ref.toggle(event)` / `show(event)` / `hide()` (anchored to the event coordinates) | Declarative trigger | Make the original trigger button itself the `CaomeiPopoverTrigger` / `CaomeiDropdownMenuTrigger` (the anchor is that button); add `unstyled` when reusing a custom button with `as-child`, and replace `hide()` with a controlled `v-model:open` (Popover can also use `<CaomeiPopoverClose>`); see [Popover](/en-US/components/popover) and [DropdownMenu](/en-US/components/dropdown-menu) |
| Tooltip wiring | `v-tooltip` directive (including `v-tooltip:left` direction modifiers) / `<Tooltip>` | `<CaomeiTooltipProvider>` (once at the app root) + `<CaomeiTooltip>` / `CaomeiTooltipTrigger` / `CaomeiTooltipContent`; direction moves to `side` + `align` | `showDelay` → `delayDuration` (provider-level or per instance); **no separate hide delay**; no directive mounting — wrap an explicit trigger (`as-child` to reuse the original element); see §7 and [Tooltip](/en-US/components/tooltip) |
| Table controlled state write-back | `v-model:*` only logged / not written back | Listen and write back `multiSortMeta` / `expandedRowGroups` / `expandedRows` / `selection` / `page` | Without write-back the built-in sort, group toggle, row expand, selection and paging controls **do nothing**; replace arrays by reference instead of mutating in place; see [DataTable](/en-US/components/data-table) "Scope and conventions" |
| Table row state and pagination base | `expandedRows` may be a `Record<key, boolean>` (row-object arrays are also supported); `first` is a 0-based offset; `rows` / `totalRecords` | `expandedRows` is `string[]` of row keys; `selection` payload is `T \| T[] \| null`; `page` is 1-based; `itemsPerPage` / `total` | `lazy` + selection / expansion requires an explicit `rowKey`; narrow `selection` with `Array.isArray`; `page = floor(first / rows) + 1`; use the Paginator `#report` slot (scope `page` / `pages` / `total`; see [Paginator](/en-US/components/paginator) "Report slot"); more complex templates can still be rendered by the parent |
| Header select-all scope | client-paginated header select-all = the whole filtered table | `multiple` header select-all covers **only the current page**; cross-page selection is aggregated by the parent's `selection` | build a selection bar when "select all filtered results" is needed; under `lazy` it also covers only the current page; see §7 and [DataTable](/en-US/components/data-table) |
| Table density and table-level structure | `size="small"`; table-level `#header` / `#footer` | no `size` prop; density via `--caomei-data-table-cell-padding-block` / `-cell-padding-inline`; no table-level header / footer slots | use `caption` for a title and move actions outside the table container; do not expect `size` to take effect silently; see §7 and [DataTable](/en-US/components/data-table) "Density and selection column" |
| Table selection column width | selection column width is fixed (e.g. 52px) | `--caomei-data-table-selection-column-width` / `-selection-cell-padding-inline` | set them on the table container or an ancestor; no cell selectors needed; see [DataTable](/en-US/components/data-table) "Density and selection column" |
| Selector width and wrapper | `fluid`; width set on the component | a `20rem` cap by default; set `--caomei-select-max-width: none` on the **field wrapper or an ancestor**; `class` / `style` land on the trigger | use `:root:root` when the library `:root` wins; set a fixed width on the wrapper, not the trigger; see [Select](/en-US/components/select) |
| Form control selectors and event timing | `input[type=checkbox]`; read the new value in `@input` | Checkbox's clickable control is `button[role="checkbox"]` (`.caomei-checkbox__control`); the component root is still `div.caomei-checkbox`; `@input` forwarded by Input / Textarea fires before v-model writes back | use `button.caomei-checkbox__control` in e2e / unit selectors; use `@update:model-value` for logic that needs the new value; see [Checkbox](/en-US/components/checkbox) and [Input](/en-US/components/input) |
| CSS selectors and overlay events | infer `.caomei-datatable` / `.caomei-dialog` from the component name; rely on `@hide` | multi-word components are word-by-word kebab-case (`.caomei-data-table`); Dialog / Drawer / ConfirmDialog / Popover / DropdownMenu have no bare root class — use `__content` / `__overlay`; Toast / Select and others still have root or trigger classes; sort state uses `th[aria-sort]`; Drawer only emits `update:open` | verify against the built output with `rg` before writing selectors; bridge `hide` with `computed` over `v-model:open`; see §7 / [Drawer](/en-US/components/drawer) |
| Message split and look | one `Message` component; the soft variant has a same-colour border | `Message` + `Alert` split (Alert is not a live region by default); the soft variant has no visible border | use `Message` when announcement is needed; do not add border overrides unless design confirms; see §7 and [Message](/en-US/components/message) / [Alert](/en-US/components/alert) |
| ScrollPanel | `<ScrollPanel>` | no equivalent component | use a native scroll container plus CSS (`max-height` / `overflow: auto`); sticky headers and similar behaviour need to be built by the consumer; see [Backlog](/plan/backlog) (Chinese) |
| Not implemented | — | see the "not implemented / not exposed" line of each component in §7 | Read that line first so you do not follow a PrimeVue API that has no effect here |

> The table above lists **shared** reminders. Whether a given component supports something, and whether a difference is intentional, is always decided by that component's entry in [Design spec §7](/design/design-spec) (Chinese).

> **Experience source (evidence only, not the mapping source of truth)**: the table-state / row-state / pagination / selector-width / form-timing / CSS-selector / overlay-event rows come from dependfix's measured PrimeVue → caomei-ui migration (2026-09-28 to 2026-10-31); per-item evidence is in that repo's [`docs/design/governance/caomei-ui-migration.md`](https://github.com/dependfix/dependfix/blob/master/docs/design/governance/caomei-ui-migration.md) §15 (evidence snapshot: 2026-10-31). Component capabilities are still governed by §7 and the component pages.

## Per-component index

Every component in the table below has a registered mapping in [Design spec §7](/design/design-spec) (Chinese), grouped as in the component sidebar; each name links straight to its component page, whose "Migration from PrimeVue" section (at the **end of the page**, before `API`) holds the mapping table.

| Group | Components |
| --- | --- |
| Basics & Layout | [Avatar](/en-US/components/avatar), [Badge](/en-US/components/badge), [Button](/en-US/components/button), [ButtonGroup](/en-US/components/button-group), [Card](/en-US/components/card) (PrimeVue `Panel`), [Divider](/en-US/components/divider), [Image](/en-US/components/image), [SplitButton](/en-US/components/split-button), [Tag](/en-US/components/tag) |
| Form Inputs | [Checkbox](/en-US/components/checkbox) / [CheckboxGroup](/en-US/components/checkbox-group), [FileUpload](/en-US/components/file-upload), [FloatLabel](/en-US/components/float-label), [Input](/en-US/components/input), [InputGroup](/en-US/components/input-group), [InputNumber](/en-US/components/input-number), [Password](/en-US/components/password), [RadioGroup](/en-US/components/radio-group), [Slider](/en-US/components/slider), [Switch](/en-US/components/switch), [TagsInput](/en-US/components/tags-input), [Textarea](/en-US/components/textarea) |
| Selectors | [AutoComplete](/en-US/components/auto-complete), [Calendar](/en-US/components/calendar) / [DatePicker](/en-US/components/date-picker), [ColorPicker](/en-US/components/color-picker), [MultiSelect](/en-US/components/multi-select), [Select](/en-US/components/select), [SelectButton](/en-US/components/select-button), [ToggleButton](/en-US/components/toggle-button) |
| Feedback & Overlays | [Alert](/en-US/components/alert), [ConfirmDialog](/en-US/components/confirm-dialog), [Dialog](/en-US/components/dialog), [Drawer](/en-US/components/drawer), [Message](/en-US/components/message), [Popover](/en-US/components/popover), [Toast](/en-US/components/toast), [Tooltip](/en-US/components/tooltip) |
| Data Display | [DataTable](/en-US/components/data-table), [DataView](/en-US/components/data-view), [Paginator](/en-US/components/paginator), [ProgressBar](/en-US/components/progress-bar), [ProgressSpinner](/en-US/components/progress-spinner), [Skeleton](/en-US/components/skeleton) |
| Navigation & Actions | [Accordion](/en-US/components/accordion), [Breadcrumb](/en-US/components/breadcrumb), [DropdownMenu](/en-US/components/dropdown-menu), [Menu](/en-US/components/menu), [Stepper](/en-US/components/stepper), [Tabs](/en-US/components/tabs), [Toolbar](/en-US/components/toolbar) |
| Advanced | [Chart](/en-US/components/chart) |

> Where a component page's "Migration from PrimeVue" section disagrees with §7, **§7 wins** (drift is treated as a documentation defect). This table follows §7's currently registered components and **does not claim to be exhaustive** — it grows as §7 does. A component that is not listed here is governed by its own component page API / "Scope and conventions" (and by §7 where a mapping is registered). Every component page with a §7 mapping now has a "Migration from PrimeVue" section; Row / Col / RichTextEditor have no §7 mapping and are governed by their own pages.

## Post-migration checklist

- [ ] Every controlled field (`v-model:*`) and event name follows the convention above, and type checking passes;
- [ ] `multiSortMeta` / `expandedRowGroups` / `expandedRows` / `selection` / `page` are written back through `@update:*`, and the built-in sort, group toggle, row expand, selection and pagination controls have been clicked in a real page;
- [ ] `lazy` tables pass an explicit `rowKey`; `expandedRows` uses `string[]` and the `selection` payload is narrowed; the 0-based `first` is converted to the 1-based `page`;
- [ ] The business impact of header select-all covering **only the current page** is confirmed; cross-page selection is carried by the parent's `selection` / a selection bar;
- [ ] `size="small"` and similar table-density props are removed in favour of CSS padding; table-level `#header` / `#footer` content has moved outside the table container;
- [ ] The selector width cap and wrapper are checked (`--caomei-select-max-width` / `:root:root` / field wrapper);
- [ ] When migrating to `selectionMode="range"`, `v-model` is typed `[Date, Date] | null` and `showTime` is not enabled at the same time;
- [ ] Form-control e2e / unit selectors no longer rely on a native `input`; logic that needs the new value uses `@update:model-value`;
- [ ] CSS selectors follow the built class names / `aria-sort`, and overlay `hide` events are bridged;
- [ ] Any bridge layer (tokens / functions / components) has a removal condition per file; bridges with zero remaining call sites are deleted, and anything not yet retired is registered in the Backlog;
- [ ] Bridge components in `as-child` setups use `inheritAttrs: false` and bind `$attrs` to the inner trigger; bridges under a `components/` subdirectory are named with the directory prefix or imported explicitly;
- [ ] `CaomeiTooltipProvider` is placed at the app root and every tooltip uses an explicit trigger;
- [ ] The live-region and soft-variant look differences of `Message` / `Alert` are confirmed;
- [ ] All string icon names are replaced with `@lucide/vue` components;
- [ ] PrimeVue-only naming (`severity` / `small` / `large` / `fluid`) is gone from templates, types and style overrides;
- [ ] Overlays (Dialog / Drawer / Popover / DropdownMenu) have been re-checked in a real page for open, close, mask, Esc and focus return;
- [ ] Narrow screens (≤640 / ≤768) and dark mode verified page by page, with no horizontal overflow and no missing text;
- [ ] Built-in text locale injected where needed (multi-language sites);
- [ ] Intentional differences on affected components have been reviewed in the UI (the list lives in §7).

## See also

- [Design spec §7: migration mapping](/design/design-spec) (Chinese; the authoritative per-component mapping)
- [Theming and styles](/design/theming) (Chinese; tokens and override recipes)
- [Responsive design](/design/responsive) (Chinese; narrow-screen acceptance criteria)
- [Icons](/en-US/components/icons), [Built-in text and locales](/en-US/components/locale)
- [Component overview](/en-US/components/)
